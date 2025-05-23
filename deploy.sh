#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist/js
mkdir -p dist/css
mkdir -p dist/assets

# Copy HTML files and Netlify configuration files
cp *.html dist/
cp _headers dist/ 2>/dev/null || :

# Copy JS files
cp js/*.js dist/js/

# Copy CSS files
cp css/*.css dist/css/

# Copy any other static assets if needed
if [ -d "assets" ]; then
  cp -r assets/* dist/assets/
fi

# Create a runtime-env.js file that will load environment variables from the Netlify function
cat > dist/js/runtime-env.js << EOL
// Runtime environment variables - loaded from Netlify function
window.ENV = {};

// Function to load environment variables
async function loadEnvVars() {
  try {
    const response = await fetch('/.netlify/functions/get-env-vars');
    if (response.ok) {
      const data = await response.json();
      window.ENV = data;
      console.log('Environment variables loaded successfully');
    } else {
      console.error('Failed to load environment variables:', response.status);
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

// Load environment variables when the script is loaded
if (window.location.hostname !== 'localhost') {
  loadEnvVars();
}
EOL

echo "Files copied to dist directory. Ready for deployment."
