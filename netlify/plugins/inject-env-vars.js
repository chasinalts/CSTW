// Netlify plugin to inject environment variables safely
module.exports = {
  onPostBuild: async ({ utils }) => {
    console.log('Injecting environment variables safely...');

    // Create a safe version of the runtime-env.js file
    // This approach avoids exposing actual values during the build
    const safeEnvScript = `
// Runtime environment variables - populated during Netlify post-processing
window.ENV = {
  // These are placeholders that will be replaced with actual values at runtime
  VITE_AUTH0_CLIENT_ID: "PLACEHOLDER_AUTH0_CLIENT_ID",
  VITE_AUTH0_AUDIENCE: "PLACEHOLDER_AUTH0_AUDIENCE",
  VITE_AUTH0_DOMAIN: "PLACEHOLDER_AUTH0_DOMAIN",
  VITE_SUPABASE_URL: "PLACEHOLDER_SUPABASE_URL",
  VITE_SUPABASE_ANON_KEY: "PLACEHOLDER_SUPABASE_ANON_KEY"
};
`;

    // Write the safe script to the runtime-env.js file
    const fs = require('fs');
    const path = require('path');
    const runtimeEnvPath = path.join(process.cwd(), 'dist', 'js', 'runtime-env.js');

    try {
      fs.writeFileSync(runtimeEnvPath, safeEnvScript);
      console.log('Successfully created safe runtime-env.js file');
    } catch (error) {
      console.error('Error creating runtime-env.js file:', error);
      utils.build.failBuild('Failed to create runtime-env.js file');
    }
  }
};
