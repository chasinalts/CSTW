import { useState, useCallback } from '../utils/react-imports';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

interface RetryState {
  attemptCount: number;
  isRetrying: boolean;
  error: Error | null;
}

export function useRetry<T>(
  operation: () => Promise<T>,
  {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
    shouldRetry = () => true
  }: RetryOptions = {}
) {
  const [state, setState] = useState<RetryState>({
    attemptCount: 0,
    isRetrying: false,
    error: null
  });

  const calculateDelay = (attempt: number) => {
    const delay = initialDelay * Math.pow(backoffFactor, attempt);
    return Math.min(delay, maxDelay);
  };

  const reset = useCallback(() => {
    setState({
      attemptCount: 0,
      isRetrying: false,
      error: null
    });
  }, []);

  const execute = useCallback(async (): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          setState(prev => ({
            ...prev,
            isRetrying: true,
            attemptCount: attempt
          }));

          // Wait before retrying
          const delay = calculateDelay(attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await operation();
        reset();
        return result;
      } catch (error) {
        lastError = error as Error;

        if (!shouldRetry(lastError) || attempt === maxAttempts - 1) {
          setState({
            attemptCount: attempt + 1,
            isRetrying: false,
            error: lastError
          });
          throw lastError;
        }

        onRetry?.(attempt + 1, lastError);
      }
    }

    // This should never be reached due to the throw above
    throw lastError;
  }, [operation, maxAttempts, initialDelay, maxDelay, backoffFactor, shouldRetry, onRetry, reset]);

  return {
    execute,
    reset,
    attemptCount: state.attemptCount,
    isRetrying: state.isRetrying,
    error: state.error,
    hasError: !!state.error
  };
}

// Example usage:
/*
const retryableOperation = useRetry(
  async () => {
    // Your async operation here
    const response = await api.submitForm(data);
    return response;
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 2,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt} after error:`, error);
    },
    shouldRetry: (error) => {
      // Only retry on network errors or 5xx errors
      return error.name === 'NetworkError' || error.status >= 500;
    }
  }
);

// Usage in component:
try {
  const result = await retryableOperation.execute();
  console.log('Success:', result);
} catch (error) {
  console.error('All retry attempts failed:', error);
}
*/