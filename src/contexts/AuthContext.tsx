// Simple authentication context without external auth dependencies
import { createContext, useContext, useState, useEffect, type ReactNode } from '../utils/react-imports';

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

interface AuthContextType {
  currentUser: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, isOwner: boolean) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up a timeout to prevent getting stuck in loading state
    const authTimeout = setTimeout(() => {
      console.log('Auth check timed out after 5 seconds, forcing completion');
      setIsLoading(false);
    }, 5000);

    // Check for an existing user in localStorage
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');

        if (storedUser) {
          console.log('Found user in localStorage');
          setCurrentUser(JSON.parse(storedUser));
        } else {
          console.log('No user found in localStorage');

          // For demo purposes, create a default owner user
          const defaultUser: UserProfile = {
            id: '1',
            email: 'owner@example.com',
            username: 'Owner User',
            is_owner: true,
            role: OWNER_ROLE,
            created_at: new Date().toISOString(),
            permissions: DEFAULT_PERMISSIONS[OWNER_ROLE]
          };

          setCurrentUser(defaultUser);
          localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setCurrentUser(null);
      } finally {
        clearTimeout(authTimeout);
        setIsLoading(false);
      }
    };

    checkSession();

    return () => {
      clearTimeout(authTimeout);
    };
  }, []);

  // Login function - simplified for demo
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);

      // For demo purposes, we'll just set the user based on email
      let role = USER_ROLE;
      let isOwner = false;

      if (email.includes('owner')) {
        role = OWNER_ROLE;
        isOwner = true;
      } else if (email.includes('admin')) {
        role = ADMIN_ROLE;
        isOwner = false;
      }

      const user: UserProfile = {
        id: '1',
        email: email,
        username: email.split('@')[0],
        role: role,
        is_owner: isOwner,
        created_at: new Date().toISOString(),
        permissions: DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS]
      };

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      console.log('Login successful:', user);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function - simplified for demo
  const signup = async (email: string, password: string, isOwner: boolean = false): Promise<void> => {
    setIsLoading(true);

    try {
      console.log('Signing up with email:', email);

      // For demo purposes, create a user with the specified role
      const role = isOwner ? OWNER_ROLE : USER_ROLE;

      const user: UserProfile = {
        id: Math.random().toString(36).substring(2, 9), // Generate a random ID
        email: email,
        username: email.split('@')[0],
        role: role,
        is_owner: isOwner,
        created_at: new Date().toISOString(),
        permissions: DEFAULT_PERMISSIONS[role as keyof typeof DEFAULT_PERMISSIONS]
      };

      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));

      console.log('Signup successful:', user);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    console.log('Logging out');
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Send password reset email - simplified for demo
  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    console.log(`Password reset email would be sent to ${email}`);
    // In a real app, this would call an API to send a reset email
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isLoading,
    sendPasswordResetEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
