/**
 * Memoization utility for caching expensive function results
 */

interface CacheItem<T> {
  value: T;
  expiry: number | null;
}

interface MemoizeOptions {
  maxCacheSize?: number;
  ttl?: number; // Time to live in milliseconds
}

// Simple LRU cache implementation
class LRUCache<T> {
  private cache: Map<string, CacheItem<T>>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (!item) return undefined;

    // Check if item has expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to the end to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  set(key: string, value: T, ttl: number | null = null): void {
    // If cache is full, remove the least recently used item (first item)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expiry = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expiry });
  }

  clear(): void {
    this.cache.clear();
  }
}

/**
 * Memoizes a function to cache its results
 * @param fn The function to memoize
 * @param options Memoization options
 * @returns Memoized function
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const { maxCacheSize = 100, ttl = null } = options;
  const cache = new LRUCache<ReturnType<T>>(maxCacheSize);

  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    // Create a cache key from the function arguments
    const key = JSON.stringify(args);

    // Check if result is in cache
    const cachedResult = cache.get(key);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    // Calculate result and store in cache
    const result = fn(...args);

    // Handle promises
    if (result instanceof Promise) {
      // For promises, we store the promise in the cache
      // and update it with the resolved value when it completes
      cache.set(key, result as ReturnType<T>, ttl);

      return result.then((value) => {
        cache.set(key, value as ReturnType<T>, ttl);
        return value;
      }).catch((error) => {
        // Remove failed promises from cache
        cache.get(key) === result && cache.set(key, undefined as ReturnType<T>, 0);
        // If you want stricter type safety, you can also use: // cache.delete(key);

        throw error;
      }) as ReturnType<T>;
    }

    // For non-promises, just store the result
    cache.set(key, result as ReturnType<T>, ttl);
    return result as ReturnType<T>;
  }) as T;

  // Add a method to clear the cache
  (memoized as unknown as { clearCache: () => void }).clearCache = () => {
    cache.clear();
  };

  return memoized;
}

// Import debounce from dedicated utility file
import { debounce } from './debounce';
export { debounce };

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every specified wait period.
 * @param fn The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let result: ReturnType<T> | undefined;

  return function(...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    if (now - lastCall >= wait) {
      lastCall = now;
      result = fn.apply(this, args);
    }
    return result;
  };
}
