// This script stores environment variables in localStorage for use in traditional HTML/JS files
(function() {
    // Try to get environment variables from import.meta.env (Vite)
    const storeEnvVars = () => {
        try {
            // Try to get from import.meta.env first (Vite)
            let auth0ClientId = null;
            let auth0Audience = null;
            let supabaseUrl = null;
            let supabaseAnonKey = null;

            try {
                auth0ClientId = import.meta?.env?.VITE_AUTH0_CLIENT_ID;
                auth0Audience = import.meta?.env?.VITE_AUTH0_AUDIENCE;
                supabaseUrl = import.meta?.env?.VITE_SUPABASE_URL;
                supabaseAnonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY;
            } catch (e) {
                console.log('Could not access import.meta.env, trying window.ENV...');
            }

            // If not found, try window.ENV (set by runtime-env.js)
            if (!auth0ClientId && window.ENV?.VITE_AUTH0_CLIENT_ID) {
                auth0ClientId = window.ENV.VITE_AUTH0_CLIENT_ID;
            }
            if (!auth0Audience && window.ENV?.VITE_AUTH0_AUDIENCE) {
                auth0Audience = window.ENV.VITE_AUTH0_AUDIENCE;
            }
            if (!supabaseUrl && window.ENV?.VITE_SUPABASE_URL) {
                supabaseUrl = window.ENV.VITE_SUPABASE_URL;
            }
            if (!supabaseAnonKey && window.ENV?.VITE_SUPABASE_ANON_KEY) {
                supabaseAnonKey = window.ENV.VITE_SUPABASE_ANON_KEY;
            }

            // Store in localStorage
            if (auth0ClientId) {
                localStorage.setItem('auth0_client_id', auth0ClientId);
            }
            if (auth0Audience) {
                localStorage.setItem('auth0_audience', auth0Audience);
            }
            if (supabaseUrl) {
                localStorage.setItem('supabase_url', supabaseUrl);
            }
            if (supabaseAnonKey) {
                localStorage.setItem('supabase_anon_key', supabaseAnonKey);
            }

            console.log('Environment variables stored in localStorage');
        } catch (error) {
            console.error('Error storing environment variables:', error);
        }
    };

    // Call the function to store environment variables
    storeEnvVars();
})();
