// Utility to load environment variables from Netlify function
interface EnvVars {
  VITE_AUTH0_DOMAIN?: string;
  VITE_AUTH0_CLIENT_ID?: string;
  VITE_AUTH0_AUDIENCE?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  [key: string]: string | undefined;
}

declare global {
  interface Window {
    ENV?: EnvVars;
  }
}

/**
 * Load environment variables from Netlify function
 * This is used in production to get environment variables that are set in the Netlify dashboard
 */
export async function loadEnvVars(): Promise<EnvVars> {
  // In development, use import.meta.env
  if (import.meta.env.DEV) {
    return {
      VITE_AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
      VITE_AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
      VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE,
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
  }

  // In production, try to get from window.ENV (set by runtime-env.js)
  if (window.ENV) {
    return window.ENV;
  }

  // If not found, fetch from Netlify function
  try {
    const response = await fetch('/.netlify/functions/get-env-vars');
    if (response.ok) {
      const data = await response.json();
      window.ENV = data; // Cache for future use
      return data;
    } else {
      console.error('Failed to load environment variables:', response.status);
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }

  // Return empty object if all else fails
  return {};
}

/**
 * Get a specific environment variable
 * @param key The environment variable key
 * @param defaultValue Default value to return if the key is not found
 */
export function getEnvVar(key: string, defaultValue: string = ''): string {
  // In development, use import.meta.env
  if (import.meta.env.DEV) {
    return import.meta.env[key] || defaultValue;
  }

  // In production, try to get from window.ENV
  if (window.ENV && window.ENV[key]) {
    return window.ENV[key] || defaultValue;
  }

  return defaultValue;
}

export default {
  loadEnvVars,
  getEnvVar,
};
