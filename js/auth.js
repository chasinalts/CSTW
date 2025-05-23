// Auth0 authentication for traditional HTML pages
let auth0Client = null;
let userProfile = null;
let isAuthenticated = false;

// Initialize Auth0 client
async function initAuth0() {
    try {
        // Get Auth0 configuration from environment variables or use defaults
        const domain = 'dev-mytcazei5krtbkqw.us.auth0.com';
        const clientId = import.meta?.env?.VITE_AUTH0_CLIENT_ID || localStorage.getItem('auth0_client_id');
        const audience = import.meta?.env?.VITE_AUTH0_AUDIENCE || localStorage.getItem('auth0_audience');

        if (!clientId) {
            console.error('Auth0 client ID not found. Authentication will not work properly.');
        }

        // Create Auth0 client
        auth0Client = await createAuth0Client({
            domain: domain,
            clientId: clientId,
            authorizationParams: {
                redirect_uri: window.location.origin,
                audience: audience,
            },
            cacheLocation: 'localstorage',
            useRefreshTokens: true,
        });

        // Check if user was redirected after login
        if (window.location.search.includes('code=')) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Check if user is authenticated
        isAuthenticated = await auth0Client.isAuthenticated();

        // Update UI based on authentication status
        updateUI();

        // If authenticated, get the user profile
        if (isAuthenticated) {
            userProfile = await auth0Client.getUser();
            console.log('User is authenticated:', userProfile);

            // Sync with Supabase if needed
            syncUserWithSupabase();
        }
    } catch (error) {
        console.error('Error initializing Auth0:', error);
    }
}

// Login function
async function login() {
    try {
        await auth0Client.loginWithRedirect();
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Logout function
async function logout() {
    try {
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin,
            }
        });
        userProfile = null;
        isAuthenticated = false;
        updateUI();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Update UI based on authentication status
function updateUI() {
    const loginBtn = document.querySelector('.login-btn');
    const logoutLink = document.querySelector('.logout-link');
    const userInfoSpan = document.querySelector('.user-info-span');

    if (isAuthenticated && userProfile) {
        // User is authenticated
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutLink) {
            logoutLink.style.display = 'inline-block';
            logoutLink.addEventListener('click', logout);
        }
        if (userInfoSpan) {
            userInfoSpan.textContent = userProfile.name || userProfile.email || 'Authenticated User';
        }
    } else {
        // User is not authenticated
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (userInfoSpan) userInfoSpan.textContent = 'Guest';
    }
}

// Sync user with Supabase
async function syncUserWithSupabase() {
    if (!isAuthenticated || !userProfile || !window.supabase) return;

    try {
        // Get access token
        const token = await auth0Client.getTokenSilently();

        // Check if user exists in Supabase
        const { data, error } = await window.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userProfile.sub)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking user profile:', error);
            return;
        }

        // Determine if user is owner or admin
        const isOwner = userProfile.app_metadata?.is_owner === true ||
                       userProfile.app_metadata?.is_owner === 'true';
        const role = isOwner ? 'owner' : (userProfile.app_metadata?.role === 'admin' ? 'admin' : 'user');

        if (!data) {
            // Create user profile if it doesn't exist
            const newUserProfile = {
                id: userProfile.sub,
                email: userProfile.email,
                username: userProfile.name || userProfile.nickname || userProfile.email?.split('@')[0],
                is_owner: isOwner,
                role: role,
                created_at: new Date().toISOString(),
                last_sign_in_at: new Date().toISOString(),
            };

            const { error: createError } = await window.supabase
                .from('user_profiles')
                .insert(newUserProfile);

            if (createError) {
                console.error('Error creating user profile:', createError);
            }
        }
    } catch (error) {
        console.error('Error syncing user with Supabase:', error);
    }
}

// Initialize Auth0 when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth0);

// Add event listeners for login/logout buttons
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }

    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', logout);
    }
});
