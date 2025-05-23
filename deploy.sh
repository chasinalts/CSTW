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

# Copy environment variables to a JS file that can be loaded in the browser
cat > dist/js/runtime-env.js << EOL
// Runtime environment variables
window.ENV = {
  VITE_AUTH0_CLIENT_ID: "${VITE_AUTH0_CLIENT_ID:-''}",
  VITE_AUTH0_AUDIENCE: "${VITE_AUTH0_AUDIENCE:-''}",
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL:-''}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY:-''}"
};
EOL

echo "Files copied to dist directory. Ready for deployment."
