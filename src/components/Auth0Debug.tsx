// Debug component to help identify Auth0 configuration issues
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../contexts/Auth0Context';

export function Auth0Debug() {
  const [showDebug, setShowDebug] = useState(false);
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string | null>(null);

  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    getAccessTokenSilently
  } = useAuth0();

  const { currentUser, isLoading: customAuthLoading } = useAuth();

  useEffect(() => {
    // Collect environment variables
    const vars: Record<string, string> = {};

    // Get all environment variables that start with VITE_AUTH0
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_AUTH0')) {
        vars[key] = import.meta.env[key];
      }
    });

    setEnvVars(vars);

    // Log Auth0 state to console
    console.log('Auth0 State:', {
      isLoading,
      isAuthenticated,
      error,
      user,
      currentUser,
      customAuthLoading,
      envVars: vars
    });

    if (error) {
      console.error('Auth0 Error:', error);
    }

    // Get access token if authenticated
    const getToken = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          console.log('Access token retrieved successfully');
        } catch (err) {
          console.error('Error getting access token:', err);
        }
      }
    };

    getToken();
  }, [isLoading, isAuthenticated, error, user, currentUser, customAuthLoading, getAccessTokenSilently]);

  if (!error && !showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        Debug Auth0
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 bg-gray-900 text-white p-4 max-w-md max-h-96 overflow-auto rounded-tl-lg shadow-lg z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Auth0 Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Auth0 Status:</h4>
        <ul className="ml-4 text-sm">
          <li>Auth0 Loading: {isLoading ? 'Yes' : 'No'}</li>
          <li>Auth0 Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
          <li>Has Error: {error ? 'Yes' : 'No'}</li>
          <li>Custom Auth Loading: {customAuthLoading ? 'Yes' : 'No'}</li>
          <li>Has Custom User: {currentUser ? 'Yes' : 'No'}</li>
        </ul>
      </div>

      {error && (
        <div className="mb-4">
          <h4 className="font-semibold text-red-400">Error:</h4>
          <pre className="ml-4 text-xs text-red-300 whitespace-pre-wrap">
            {error.message || JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-semibold">Environment Variables:</h4>
        <pre className="ml-4 text-xs whitespace-pre-wrap">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>

      {user && (
        <div className="mb-4">
          <h4 className="font-semibold">Auth0 User:</h4>
          <pre className="ml-4 text-xs whitespace-pre-wrap">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      {currentUser && (
        <div className="mb-4">
          <h4 className="font-semibold">Custom User Profile:</h4>
          <pre className="ml-4 text-xs whitespace-pre-wrap">
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </div>
      )}

      {token && (
        <div className="mb-4">
          <h4 className="font-semibold">Access Token:</h4>
          <pre className="ml-4 text-xs whitespace-pre-wrap overflow-hidden text-ellipsis">
            {token.substring(0, 20)}...
          </pre>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        Check the console for more detailed information.
      </div>
    </div>
  );
}

export default Auth0Debug;
