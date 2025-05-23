// Netlify function to handle CORS headers
exports.handler = async (event, context) => {
  // Set CORS headers for your domain
  const headers = {
    'Access-Control-Allow-Origin': '*', // In production, restrict this to your domain
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  // For actual requests, just add the headers
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'CORS headers added' })
  };
};
