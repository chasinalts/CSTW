import { useAuth0Context } from '../contexts/Auth0Context';

/**
 * Gets the current user ID from Auth0 context
 * @returns The current user ID or null if not authenticated
 */
export const getUserId = (): string | null => {
  // Try to get user from window global context first (for non-React contexts)
  if (window.__AUTH0_CONTEXT__?.currentUser?.id) {
    return window.__AUTH0_CONTEXT__.currentUser.id;
  }
  
  // For React components, this won't work outside of component context
  // This is a fallback that will only work if called from within a component using useAuth0Context
  try {
    const { currentUser } = useAuth0Context();
    return currentUser?.id || null;
  } catch (error) {
    console.warn('getUserId called outside React component context');
    return null;
  }
};