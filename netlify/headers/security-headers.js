// Security headers for Netlify
module.exports = {
  onPostBuild: async ({ utils }) => {
    const fs = require('fs');
    const path = require('path');
    
    // Create _headers file in the publish directory
    const headersPath = path.join(process.cwd(), 'dist', '_headers');
    
    // Define security headers
    const headers = `
# Security headers for all pages
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.auth0.com https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://via.placeholder.com; connect-src 'self' https://*.supabase.co https://*.auth0.com https://*.netlify.app; font-src 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
`;
    
    // Write headers file
    fs.writeFileSync(headersPath, headers.trim());
    
    console.log('Security headers added to _headers file');
  }
};
