// Supabase storage utility functions
import { supabaseClient, BANNER_BUCKET, GALLERY_BUCKET, SCANNER_BUCKET } from '../supabaseConfig';

// Define types
export interface FileObject {
  id: string;
  name: string;
  file_path: string;
  bucket_id: string;
  image_type: string;
  uploaded_by?: string;
  uploaded_at?: string;
  publicUrl: string;
  size?: number;
}

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param bucketType The bucket to upload to (banner, gallery, scanner)
 * @param userId The ID of the user uploading the file
 * @returns The uploaded file object
 */
export async function uploadFile(file: File, bucketType: string, userId: string): Promise<FileObject | null> {
  try {
    // Determine the bucket name based on the type
    const bucketName = getBucketName(bucketType);
    
    // Create a unique file path
    const filePath = `${bucketType}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // Upload the file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabaseClient
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    const publicUrl = urlData?.publicUrl;
    
    // Create a file object to store in the database
    const fileObject: FileObject = {
      id: `${bucketType}-${Date.now()}`,
      name: file.name,
      file_path: filePath,
      bucket_id: bucketName,
      image_type: bucketType,
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
      publicUrl,
      size: file.size
    };
    
    // Store the file metadata in the database
    const { data: metadataData, error: metadataError } = await supabaseClient
      .from('images')
      .insert(fileObject);
    
    if (metadataError) {
      console.error('Error storing file metadata:', metadataError);
      // Delete the uploaded file if metadata storage fails
      await supabaseClient.storage.from(bucketName).remove([filePath]);
      return null;
    }
    
    return fileObject;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
}

/**
 * Delete a file from Supabase storage
 * @param filePath The path of the file to delete
 * @param bucketType The bucket the file is in
 * @returns True if the file was deleted successfully
 */
export async function deleteFile(filePath: string, bucketType: string): Promise<boolean> {
  try {
    // Determine the bucket name based on the type
    const bucketName = getBucketName(bucketType);
    
    // Delete the file from Supabase storage
    const { error: deleteError } = await supabaseClient
      .storage
      .from(bucketName)
      .remove([filePath]);
    
    if (deleteError) {
      console.error('Error deleting file:', deleteError);
      return false;
    }
    
    // Delete the file metadata from the database
    const { error: metadataError } = await supabaseClient
      .from('images')
      .delete()
      .eq('file_path', filePath);
    
    if (metadataError) {
      console.error('Error deleting file metadata:', metadataError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
}

/**
 * List files from Supabase storage
 * @param bucketType The bucket to list files from
 * @returns An array of file objects
 */
export async function listFiles(bucketType: string): Promise<FileObject[]> {
  try {
    // Get files from the database
    const { data, error } = await supabaseClient
      .from('images')
      .select('*')
      .eq('image_type', bucketType);
    
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }
    
    return data as FileObject[];
  } catch (error) {
    console.error('Error in listFiles:', error);
    return [];
  }
}

/**
 * Get the URL for a file in Supabase storage
 * @param filePath The path of the file
 * @param bucketType The bucket the file is in
 * @returns The public URL for the file
 */
export function getFileUrl(filePath: string, bucketType: string): string {
  const bucketName = getBucketName(bucketType);
  
  const { data } = supabaseClient
    .storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data?.publicUrl || '';
}

/**
 * Get a preview URL for a file in Supabase storage
 * @param filePath The path of the file
 * @param bucketType The bucket the file is in
 * @param width Optional width for the preview
 * @param height Optional height for the preview
 * @returns The preview URL for the file
 */
export function getFilePreview(
  filePath: string, 
  bucketType: string, 
  width?: number, 
  height?: number
): string {
  const bucketName = getBucketName(bucketType);
  
  const options: any = {
    quality: 80,
    format: 'webp'
  };
  
  if (width) options.width = width;
  if (height) options.height = height;
  
  const { data } = supabaseClient
    .storage
    .from(bucketName)
    .getPublicUrl(filePath, {
      transform: options
    });
  
  return data?.publicUrl || '';
}

/**
 * Get the bucket name based on the bucket type
 * @param bucketType The type of bucket (banner, gallery, scanner)
 * @returns The bucket name
 */
function getBucketName(bucketType: string): string {
  switch (bucketType) {
    case 'banner':
      return BANNER_BUCKET;
    case 'gallery':
      return GALLERY_BUCKET;
    case 'scanner':
      return SCANNER_BUCKET;
    default:
      return bucketType;
  }
}
