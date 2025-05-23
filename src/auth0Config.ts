// Auth0 configuration file that initializes the Auth0 client
import { Auth0ClientOptions } from '@auth0/auth0-react';
import { getEnvVar } from './utils/loadEnvVars';

// Auth0 configuration options
export const auth0Config: Auth0ClientOptions = {
  domain: getEnvVar('VITE_AUTH0_DOMAIN', 'dev-mytcazei5krtbkqw.us.auth0.com'),
  clientId: getEnvVar('VITE_AUTH0_CLIENT_ID'),
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: getEnvVar('VITE_AUTH0_AUDIENCE'),
    scope: 'openid profile email',
  },
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  // Enable Universal Login experience
  useFormData: false,
  // Skip the /authorize endpoint hit before redirecting to Universal Login
  skipRedirectCallback: false,
};

// User roles and permissions
export const USER_ROLE = 'user';
export const ADMIN_ROLE = 'admin';
export const OWNER_ROLE = 'owner';

// Default permissions for different roles
export const DEFAULT_PERMISSIONS = {
  [OWNER_ROLE]: {
    content_management: true,
    user_management: true,
    system_configuration: true,
    media_uploads: true,
    security_settings: true,
    site_customization: true,
  },
  [ADMIN_ROLE]: {
    content_management: true,
    user_management: true,
    system_configuration: false,
    media_uploads: true,
    security_settings: false,
    site_customization: true,
  },
  [USER_ROLE]: {
    content_management: false,
    user_management: false,
    system_configuration: false,
    media_uploads: false,
    security_settings: false,
    site_customization: false,
  },
};

// Helper function to get user role from Auth0 metadata
export const getUserRoleFromMetadata = (metadata: any): string => {
  if (!metadata) return USER_ROLE;

  // Check if user is an owner
  if (metadata.is_owner === true || metadata.is_owner === 'true') {
    return OWNER_ROLE;
  }

  // Check if user is an admin
  if (metadata.role === ADMIN_ROLE) {
    return ADMIN_ROLE;
  }

  // Default to user role
  return USER_ROLE;
};

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: string) => {
  return DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS[USER_ROLE];
};
