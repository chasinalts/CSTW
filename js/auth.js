// Auth0 Configuration
const AUTH0_DOMAIN = 'dev-mytcazei5krtbkqw.us.auth0.com';
const AUTH0_CLIENT_ID = 'tjP8vSN783KFTQcFXDoFFPKlSbj5ZeF2';
const AUTH0_REDIRECT_URI = window.location.origin + '/callback.html'; // Assuming a callback.html page
const AUTH0_AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`; // Example audience, adjust if needed

let auth0Client = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        auth0Client = await auth0.createAuth0Client({
            domain: AUTH0_DOMAIN,
            clientId: AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: AUTH0_REDIRECT_URI,
                // audience: AUTH0_AUDIENCE, // Uncomment if you have an API configured in Auth0
            }
        });

        console.log('Auth0 Client Initialized');

        // Handle redirect callback
        if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
            try {
                await auth0Client.handleRedirectCallback();
                window.history.replaceState({}, document.title, "/");
                updateUI();
            } catch (e) {
                console.error("Error handling redirect callback", e);
            }
        } else {
            updateUI();
        }

    } catch (error) {
        console.error('Error initializing Auth0 client:', error);
    }
});

async function login() {
    if (!auth0Client) {
        console.error('Auth0 client not initialized');
        return;
    }
    try {
        await auth0Client.loginWithRedirect();
    } catch (e) {
        console.error('Login failed', e);
    }
}

async function logout() {
    if (!auth0Client) {
        console.error('Auth0 client not initialized');
        return;
    }
    try {
        auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    } catch (e) {
        console.error('Logout failed', e);
    }
}

async function isAuthenticated() {
    if (!auth0Client) {
        console.warn('Auth0 client not initialized for isAuthenticated check');
        return false;
    }
    return await auth0Client.isAuthenticated();
}

async function getUser() {
    if (!auth0Client) {
        console.warn('Auth0 client not initialized for getUser check');
        return null;
    }
    if (await isAuthenticated()) {
        return await auth0Client.getUser();
    }
    return null;
}

async function updateUI() {
    const authenticated = await isAuthenticated();
    const user = await getUser();

    // Common UI elements across pages
    const loginButtons = document.querySelectorAll('.login-btn'); // Add this class to login buttons
    const logoutLinks = document.querySelectorAll('.logout-link'); // Existing logout links
    const userInfoSpans = document.querySelectorAll('.user-info-span'); // Add this class to user info spans
    const adminDashboardLinks = document.querySelectorAll('a[href="dashboard.html"]');

    if (authenticated && user) {
        loginButtons.forEach(btn => btn.style.display = 'none');
        logoutLinks.forEach(link => {
            link.style.display = 'inline';
            link.removeEventListener('click', handleLogoutClick); // Prevent multiple listeners
            link.addEventListener('click', handleLogoutClick);
        });
        userInfoSpans.forEach(span => span.textContent = `${user.name || user.email}`);
        // Show admin link only if user has a specific role/permission (example)
        // This requires custom claims in Auth0 ID token
        // For now, just show if authenticated
        adminDashboardLinks.forEach(link => link.style.display = 'inline-block');

    } else {
        loginButtons.forEach(btn => btn.style.display = 'inline');
        logoutLinks.forEach(link => link.style.display = 'none');
        userInfoSpans.forEach(span => span.textContent = 'Guest');
        adminDashboardLinks.forEach(link => link.style.display = 'none'); // Hide admin link if not logged in
    }
}

function handleLogoutClick(e) {
    e.preventDefault();
    logout();
}

// Expose functions to global scope if needed by inline event handlers in HTML
window.login = login;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getUser = getUser;
window.updateUI = updateUI;