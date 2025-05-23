#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist/js
mkdir -p dist/css
mkdir -p dist/assets

# Copy HTML files
cp *.html dist/

# Copy JS files
cp js/*.js dist/js/

# Copy CSS files
cp css/*.css dist/css/

# Copy any other static assets if needed
if [ -d "assets" ]; then
  cp -r assets/* dist/assets/
fi

# Create a placeholder runtime-env.js file
# This will be populated by Netlify's post-processing script
cat > dist/js/runtime-env.js << EOL
// Runtime environment variables - populated during Netlify post-processing
window.ENV = {
  // These are placeholders that will be replaced with actual values at runtime
  VITE_AUTH0_CLIENT_ID: "PLACEHOLDER_AUTH0_CLIENT_ID",
  VITE_AUTH0_AUDIENCE: "PLACEHOLDER_AUTH0_AUDIENCE",
  VITE_AUTH0_DOMAIN: "PLACEHOLDER_AUTH0_DOMAIN",
  VITE_SUPABASE_URL: "PLACEHOLDER_SUPABASE_URL",
  VITE_SUPABASE_ANON_KEY: "PLACEHOLDER_SUPABASE_ANON_KEY"
};
EOL

echo "Files copied to dist directory. Ready for deployment."
