// Hook for using Context7 MCP Server in React components
import { useState, useCallback } from 'react';
import context7Client, { Context7Client } from '../utils/context7Client';

/**
 * Interface for documentation request options
 */
interface DocRequestOptions {
  libraryId: string;
  topic?: string;
  maxTokens?: number;
}

/**
 * Interface for the useContext7 hook return value
 */
interface UseContext7Return {
  loading: boolean;
  error: string | null;
  documentation: any | null;
  getDocumentation: (options: DocRequestOptions) => Promise<void>;
  searchCode: (query: string) => Promise<any>;
  getFileInfo: (filePath: string) => Promise<any>;
}

/**
 * Hook for using Context7 MCP Server in React components
 * @param customClient Optional custom Context7 client
 * @returns Object with documentation data and functions to interact with Context7 MCP Server
 */
export const useContext7 = (customClient?: Context7Client): UseContext7Return => {
  const client = customClient || context7Client;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [documentation, setDocumentation] = useState<any | null>(null);

  /**
   * Get documentation from the Context7 MCP Server
   * @param options Documentation request options
   */
  const getDocumentation = useCallback(async (options: DocRequestOptions): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.getDocumentation(options);

      if (response.success && response.data) {
        setDocumentation(response.data);
      } else {
        setError(response.error || 'Failed to fetch documentation');
        setDocumentation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDocumentation(null);
    } finally {
      setLoading(false);
    }
  }, [client]);

  /**
   * Search for code in the codebase
   * @param query The search query
   * @returns Promise with the search results
   */
  const searchCode = useCallback(async (query: string): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.searchCode(query);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to search code');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [client]);

  /**
   * Get information about a specific file
   * @param filePath The path to the file
   * @returns Promise with the file information
   */
  const getFileInfo = useCallback(async (filePath: string): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.getFileInfo(filePath);

      if (response.success) {
        return response.data;
      } else {
        setError(response.error || 'Failed to get file info');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return {
    loading,
    error,
    documentation,
    getDocumentation,
    searchCode,
    getFileInfo
  };
};

export default useContext7;
