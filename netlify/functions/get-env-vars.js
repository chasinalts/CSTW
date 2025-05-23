// Netlify function to securely provide environment variables to the client
exports.handler = async function(event, context) {
  // Only return non-sensitive environment variables
  // This is a safer approach than embedding them directly in the build
  const clientEnvVars = {
    VITE_AUTH0_CLIENT_ID: process.env.VITE_AUTH0_CLIENT_ID || '',
    VITE_AUTH0_AUDIENCE: process.env.VITE_AUTH0_AUDIENCE || '',
    VITE_AUTH0_DOMAIN: process.env.VITE_AUTH0_DOMAIN || '',
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || ''
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      // Add cache control headers to prevent caching of this response
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    },
    body: JSON.stringify(clientEnvVars)
  };
};
