import { useEffect, useCallback, useRef } from '../utils/react-imports';
import { useToast } from '../components/ui/Toast';

declare global {
  interface Window {
    localStorage: Storage;
  }
}

interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  debounce?: number;
  enabled?: boolean;
  saveKey?: string;
}

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Use a safe storage abstraction
const storage: Storage = (typeof window !== 'undefined' && window.localStorage) ? {
  getItem: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      console.warn('localStorage is not available');
    }
  },
  removeItem: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      console.warn('localStorage is not available');
    }
  }
} : {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

const safeSetTimeout = (callback: () => void, delay: number): number => {
  if (typeof window !== 'undefined') {
    return window.setTimeout(callback, delay);
  }
  return 0;
};

const safeClearTimeout = (id: number): void => {
  if (typeof window !== 'undefined') {
    window.clearTimeout(id);
  }
};

const safeSetInterval = (callback: () => void, delay: number): number => {
  if (typeof window !== 'undefined') {
    return window.setInterval(callback, delay);
  }
  return 0;
};

const safeClearInterval = (id: number): void => {
  if (typeof window !== 'undefined') {
    window.clearInterval(id);
  }
};

export function useAutosave<T>({
  data,
  onSave,
  interval = 30000, // 30 seconds
  debounce = 1000,  // 1 second
  enabled = true,
  saveKey = 'formAutosave'
}: AutosaveOptions<T>) {
  const { showToast } = useToast();
  const lastSavedData = useRef<T | null>(null);
  const debounceTimeout = useRef<number>();
  const initialLoad = useRef(true);

  // Load saved data from storage
  const loadSavedData = useCallback((): T | null => {
    try {
      const saved = storage.getItem(saveKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading autosaved data:', error);
      return null;
    }
  }, [saveKey]);

  // Save data to storage
  const saveToStorage = useCallback((dataToSave: T) => {
    try {
      storage.setItem(saveKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [saveKey]);

  // Check if data has changed
  const hasDataChanged = useCallback((newData: T) => {
    if (!lastSavedData.current) return true;
    return JSON.stringify(newData) !== JSON.stringify(lastSavedData.current);
  }, []);

  // Handle the actual save operation
  const handleSave = useCallback(async (dataToSave: T) => {
    if (!hasDataChanged(dataToSave)) return;

    try {
      await onSave(dataToSave);
      lastSavedData.current = dataToSave;
      saveToStorage(dataToSave);
      showToast('success', 'Draft saved automatically');
    } catch (error) {
      console.error('Autosave failed:', error);
      showToast('error', 'Failed to save draft');
    }
  }, [onSave, hasDataChanged, saveToStorage, showToast]);

  // Debounced save
  const debouncedSave = useCallback((dataToSave: T) => {
    if (debounceTimeout.current) {
      safeClearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = safeSetTimeout(() => {
      handleSave(dataToSave);
    }, debounce);
  }, [handleSave, debounce]);

  // Set up interval autosave
  useEffect(() => {
    if (!enabled) return;

    const intervalId = safeSetInterval(() => {
      if (hasDataChanged(data)) {
        handleSave(data);
      }
    }, interval);

    return () => safeClearInterval(intervalId);
  }, [enabled, interval, data, hasDataChanged, handleSave]);

  // Handle data changes with debounce
  useEffect(() => {
    if (!enabled || initialLoad.current) {
      initialLoad.current = false;
      return;
    }

    debouncedSave(data);

    return () => {
      if (debounceTimeout.current) {
        safeClearTimeout(debounceTimeout.current);
      }
    };
  }, [enabled, data, debouncedSave]);

  // Load saved data on mount
  const getSavedData = useCallback(() => {
    const saved = loadSavedData();
    if (saved) {
      lastSavedData.current = saved;
    }
    return saved;
  }, [loadSavedData]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    storage.removeItem(saveKey);
    lastSavedData.current = null;
  }, [saveKey]);

  return {
    getSavedData,
    clearSavedData,
    hasSavedData: !!loadSavedData()
  };
}