// This script stores environment variables in localStorage for use in traditional HTML/JS files
(function() {
    // Function to fetch environment variables from Netlify function
    const fetchEnvVars = async () => {
        try {
            // First try to get from import.meta.env (for local development)
            let auth0ClientId = null;
            let auth0Audience = null;
            let auth0Domain = null;
            let supabaseUrl = null;
            let supabaseAnonKey = null;

            try {
                auth0ClientId = import.meta?.env?.VITE_AUTH0_CLIENT_ID;
                auth0Audience = import.meta?.env?.VITE_AUTH0_AUDIENCE;
                auth0Domain = import.meta?.env?.VITE_AUTH0_DOMAIN;
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
            if (!auth0Domain && window.ENV?.VITE_AUTH0_DOMAIN) {
                auth0Domain = window.ENV.VITE_AUTH0_DOMAIN;
            }
            if (!supabaseUrl && window.ENV?.VITE_SUPABASE_URL) {
                supabaseUrl = window.ENV.VITE_SUPABASE_URL;
            }
            if (!supabaseAnonKey && window.ENV?.VITE_SUPABASE_ANON_KEY) {
                supabaseAnonKey = window.ENV.VITE_SUPABASE_ANON_KEY;
            }

            // If still not found, fetch from Netlify function
            if (!auth0ClientId || !auth0Audience || !auth0Domain || !supabaseUrl || !supabaseAnonKey) {
                try {
                    // Only fetch from the function if we're in production (on Netlify)
                    if (window.location.hostname !== 'localhost') {
                        console.log('Fetching environment variables from Netlify function...');
                        const response = await fetch('/.netlify/functions/get-env-vars');
                        if (response.ok) {
                            const data = await response.json();
                            auth0ClientId = data.VITE_AUTH0_CLIENT_ID || auth0ClientId;
                            auth0Audience = data.VITE_AUTH0_AUDIENCE || auth0Audience;
                            auth0Domain = data.VITE_AUTH0_DOMAIN || auth0Domain;
                            supabaseUrl = data.VITE_SUPABASE_URL || supabaseUrl;
                            supabaseAnonKey = data.VITE_SUPABASE_ANON_KEY || supabaseAnonKey;
                        } else {
                            console.error('Failed to fetch environment variables:', response.status);
                        }
                    }
                } catch (fetchError) {
                    console.error('Error fetching environment variables:', fetchError);
                }
            }

            // Store in localStorage
            if (auth0ClientId) {
                localStorage.setItem('auth0_client_id', auth0ClientId);
            }
            if (auth0Audience) {
                localStorage.setItem('auth0_audience', auth0Audience);
            }
            if (auth0Domain) {
                localStorage.setItem('auth0_domain', auth0Domain);
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

    // Call the function to fetch and store environment variables
    fetchEnvVars();
})();
