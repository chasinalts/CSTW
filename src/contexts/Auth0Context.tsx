// Auth0 authentication context for the COMET Scanner Template Wizard
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth0Provider, Auth0ProviderOptions, useAuth0 } from '@auth0/auth0-react';
import { supabaseClient } from '../supabaseConfig';

// User roles
export const USER_ROLE = 'user';
export const ADMIN_ROLE = 'admin';
export const OWNER_ROLE = 'owner';

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  is_owner: boolean;
  created_at?: string;
  last_sign_in_at?: string;
  permissions?: {
    content_management: boolean;
    user_management: boolean;
    system_configuration: boolean;
    media_uploads: boolean;
    security_settings: boolean;
    site_customization: boolean;
  };
  role: typeof USER_ROLE | typeof ADMIN_ROLE | typeof OWNER_ROLE;
}

// Default permissions for each role
export const DEFAULT_PERMISSIONS = {
  [USER_ROLE]: {
    content_management: false,
    user_management: false,
    system_configuration: false,
    media_uploads: false,
    security_settings: false,
    site_customization: false,
  },
  [ADMIN_ROLE]: {
    content_management: true,
    user_management: true,
    system_configuration: false,
    media_uploads: true,
    security_settings: false,
    site_customization: true,
  },
  [OWNER_ROLE]: {
    content_management: true,
    user_management: true,
    system_configuration: true,
    media_uploads: true,
    security_settings: true,
    site_customization: true,
  },
};

// Auth0 context interface
interface Auth0ContextType {
  currentUser: UserProfile | null;
  login: () => void;
  signup: () => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  getAccessToken: () => Promise<string | undefined>;
  syncUserWithSupabase: () => Promise<void>;
}

// Create the Auth0 context
export const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

// Auth0 provider wrapper component
export function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  const redirectUri = window.location.origin;

  if (!domain || !clientId) {
    throw new Error('Auth0 domain and client ID must be defined');
  }

  const providerConfig: Auth0ProviderOptions = {
    domain,
    clientId,
    authorizationParams: {
      redirect_uri: redirectUri,
      audience,
    },
    useRefreshTokens: true,
    cacheLocation: 'localstorage',
  };

  return (
    <Auth0Provider {...providerConfig}>
      {children}
    </Auth0Provider>
  );
}

// Auth0 context provider component
export function Auth0ContextProvider({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isLoading: auth0IsLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Sync Auth0 user with our user profile
  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        try {
          // Check if user exists in Supabase
          const { data: existingUser, error: fetchError } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('email', user.email)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user profile:', fetchError);
          }

          let userProfile: UserProfile;

          if (existingUser) {
            // User exists, update last sign in
            userProfile = {
              id: existingUser.id,
              email: user.email || '',
              username: user.name || user.nickname || user.email?.split('@')[0] || '',
              is_owner: existingUser.is_owner,
              role: existingUser.role || USER_ROLE,
              created_at: existingUser.created_at,
              last_sign_in_at: new Date().toISOString(),
              permissions: existingUser.permissions || DEFAULT_PERMISSIONS[existingUser.role || USER_ROLE],
            };

            // Update last sign in time
            await supabaseClient
              .from('user_profiles')
              .update({ last_sign_in_at: new Date().toISOString() })
              .eq('id', existingUser.id);
          } else {
            // User doesn't exist, create new profile
            // Default to regular user role. Actual roles should come from Auth0 metadata.
            // For this immediate fix, we'll default to USER_ROLE for new users to remove the hardcoded email.
            const role = USER_ROLE; // Default role for new users
            const isOwner = false; // Default is_owner for new users

            userProfile = {
              id: user.sub || '',
              email: user.email || '',
              username: user.name || user.nickname || user.email?.split('@')[0] || '',
              is_owner: isOwner, // Ensure this doesn't default to true
              role: role,       // Ensure this is the default role
              created_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString(),
              permissions: DEFAULT_PERMISSIONS[role],
            };

            // Create user profile in Supabase
            const { error: createError } = await supabaseClient
              .from('user_profiles')
              .insert(userProfile);

            if (createError) {
              console.error('Error creating user profile:', createError);
            }
          }

          setCurrentUser(userProfile);
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      } else if (!isAuthenticated && !auth0IsLoading) {
        setCurrentUser(null);
      }

      setIsLoading(false);
    };

    syncUser();
  }, [isAuthenticated, user, auth0IsLoading]);

  // Sync user with Supabase
  const syncUserWithSupabase = async () => {
    if (!isAuthenticated || !user) return;

    try {
      const token = await getAccessTokenSilently();

      // Set the Auth0 token in Supabase
      const { error } = await supabaseClient.auth.setSession({
        access_token: token,
        refresh_token: '',
      });

      if (error) {
        console.error('Error setting Supabase session:', error);
      }
    } catch (error) {
      console.error('Error syncing user with Supabase:', error);
    }
  };

  // Login function
  const login = () => {
    loginWithRedirect();
  };

  // Signup function
  const signup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  // Logout function
  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
    setCurrentUser(null);
  };

  // Get access token
  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return undefined;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isLoading: isLoading || auth0IsLoading,
    isAuthenticated,
    getAccessToken,
    syncUserWithSupabase,
  };

  // Expose the context to the window object for use in non-React components, only in development
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    window.__AUTH0_CONTEXT__ = value;
  }

  return (
    <Auth0Context.Provider value={value}>
      {children}
    </Auth0Context.Provider>
  );
}

// Hook to use Auth0 context
export function useAuth0Context() {
  const context = useContext(Auth0Context);
  if (context === undefined) {
    throw new Error('useAuth0Context must be used within an Auth0ContextProvider');
  }
  return context;
}
