// Global type declarations for the application

interface Window {
  __AUTH0_CONTEXT__?: {
    currentUser?: {
      id: string;
      email: string;
      is_owner: boolean | string;
      role?: string;
      permissions?: {
        [key: string]: boolean;
      };
    };
    isAuthenticated?: boolean;
  };
}
