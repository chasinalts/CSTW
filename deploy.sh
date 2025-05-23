#!/bin/bash

# Build the React application
echo "Building React application..."
npm run build

# Copy Netlify configuration files
cp _headers dist/ 2>/dev/null || :

# Create a runtime-env.js file that will load environment variables from the Netlify function
cat > dist/assets/runtime-env.js << EOL
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

echo "Build complete. Ready for deployment."
