// Secure blob handler for image uploads and management
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sanitizeHtml = require('sanitize-html');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Allowed image types and max size (5MB)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Bucket names
const BUCKETS = {
  BANNER: 'banner',
  GALLERY: 'gallery',
  SCANNER: 'scanner'
};

// Verify Auth0 token
const verifyToken = async (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token (in a real implementation, you'd verify against Auth0 JWKS)
    // This is a simplified example
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.sub) {
      throw new Error('Invalid token');
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
};

// Check if user has required permissions
const checkPermissions = async (userId, requiredPermission) => {
  try {
    // Get user profile from Supabase
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !userProfile) {
      console.error('Error fetching user profile:', error);
      return false;
    }
    
    // Check if user is owner or admin
    if (userProfile.is_owner === true || userProfile.role === 'admin') {
      return true;
    }
    
    // Check specific permission if not owner/admin
    return userProfile.permissions && userProfile.permissions[requiredPermission] === true;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

// Sanitize file name to prevent path traversal attacks
const sanitizeFileName = (fileName) => {
  // Remove any path components
  const baseName = fileName.split(/[\\/]/).pop();
  
  // Remove special characters and spaces
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Add random suffix for uniqueness
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  
  // Construct final filename with timestamp
  const timestamp = Date.now();
  const extension = sanitized.split('.').pop();
  
  return `${timestamp}-${randomSuffix}.${extension}`;
};

// Handle image upload
const handleUpload = async (userId, file, bucket) => {
  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(file.contentType)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }
  
  // Sanitize file name
  const fileName = sanitizeFileName(file.filename);
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(`${userId}/${fileName}`, file.buffer, {
      contentType: file.contentType,
      cacheControl: '3600'
    });
  
  if (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(`${userId}/${fileName}`);
  
  return {
    url: publicUrlData.publicUrl,
    path: `${userId}/${fileName}`,
    bucket: bucket
  };
};

// Handle image deletion
const handleDelete = async (userId, path, bucket) => {
  // Validate path to prevent path traversal
  if (!path || path.includes('..') || !path.startsWith(`${userId}/`)) {
    throw new Error('Invalid file path');
  }
  
  // Delete from Supabase Storage
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete file');
  }
  
  return { success: true, message: 'File deleted successfully' };
};

// Main handler function
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*', // In production, restrict this to your domain
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS'
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  try {
    // Verify authentication
    const user = await verifyToken(event.headers.authorization);
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    
    // Sanitize input
    const action = sanitizeHtml(body.action || '');
    const bucket = sanitizeHtml(body.bucket || '');
    const path = sanitizeHtml(body.path || '');
    
    // Validate bucket
    if (!Object.values(BUCKETS).includes(bucket)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid bucket' })
      };
    }
    
    // Check permissions based on action
    const requiredPermission = 'media_uploads';
    const hasPermission = await checkPermissions(user.sub, requiredPermission);
    
    if (!hasPermission) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Insufficient permissions' })
      };
    }
    
    // Handle different actions
    let result;
    
    switch (action) {
      case 'upload':
        // Parse multipart form data for file upload
        const file = {
          filename: body.filename,
          contentType: body.contentType,
          size: body.fileSize,
          buffer: Buffer.from(body.fileData, 'base64')
        };
        
        result = await handleUpload(user.sub, file, bucket);
        break;
        
      case 'delete':
        result = await handleDelete(user.sub, path, bucket);
        break;
        
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
