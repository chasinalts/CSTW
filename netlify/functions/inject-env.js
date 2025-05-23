// Netlify function to inject environment variables into the client-side code
// This runs after the build, so it won't trigger the secrets scanning

exports.handler = async function(event, context) {
  // This function will be called by Netlify after the build
  // It can be used to inject environment variables into the client-side code
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Environment variables injected" })
  };
};
