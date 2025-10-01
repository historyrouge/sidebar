import { StorageItem, StorageType } from '@/types';
import { createError, ERROR_CODES, withErrorHandling } from './error-handler';

// Storage interface
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  get length(): number;
}

// Storage implementations
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }

  key(index: number): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.key(index);
  }

  get length(): number {
    if (typeof window === 'undefined') return 0;
    return localStorage.length;
  }
}

class SessionStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.clear();
  }

  key(index: number): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.key(index);
  }

  get length(): number {
    if (typeof window === 'undefined') return 0;
    return sessionStorage.length;
  }
}

// Memory storage for SSR/fallback
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return keys[index] || null;
  }

  get length(): number {
    return this.storage.size;
  }
}

// Storage manager class
export class StorageManager {
  private adapter: StorageAdapter;

  constructor(type: StorageType = 'localStorage') {
    this.adapter = this.createAdapter(type);
  }

  private createAdapter(type: StorageType): StorageAdapter {
    switch (type) {
      case 'localStorage':
        return new LocalStorageAdapter();
      case 'sessionStorage':
        return new SessionStorageAdapter();
      default:
        return new MemoryStorageAdapter();
    }
  }

  // Get item with optional expiration check
  async get<T = any>(key: string): Promise<T | null> {
    const result = await withErrorHandling(async () => {
      const item = this.adapter.getItem(key);
      if (!item) return null;

      try {
        const parsed: StorageItem<T> = JSON.parse(item);
        
        // Check expiration
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          this.adapter.removeItem(key);
          return null;
        }

        return parsed.value;
      } catch {
        // If parsing fails, assume it's a plain string
        return item as unknown as T;
      }
    });

    return result.data || null;
  }

  // Set item with optional expiration
  async set<T = any>(
    key: string, 
    value: T, 
    expirationMs?: number
  ): Promise<boolean> {
    const result = await withErrorHandling(async () => {
      const item: StorageItem<T> = {
        key,
        value,
        expiresAt: expirationMs ? Date.now() + expirationMs : undefined,
      };

      const serialized = JSON.stringify(item);
      this.adapter.setItem(key, serialized);
      return true;
    });

    if (result.error) {
      console.error('Storage set error:', result.error);
      return false;
    }

    return result.data || false;
  }

  // Remove item
  async remove(key: string): Promise<boolean> {
    const result = await withErrorHandling(async () => {
      this.adapter.removeItem(key);
      return true;
    });

    return result.data || false;
  }

  // Clear all items
  async clear(): Promise<boolean> {
    const result = await withErrorHandling(async () => {
      this.adapter.clear();
      return true;
    });

    return result.data || false;
  }

  // Get all keys
  async keys(): Promise<string[]> {
    const result = await withErrorHandling(async () => {
      const keys: string[] = [];
      for (let i = 0; i < this.adapter.length; i++) {
        const key = this.adapter.key(i);
        if (key) keys.push(key);
      }
      return keys;
    });

    return result.data || [];
  }

  // Get storage size (approximate)
  async size(): Promise<number> {
    const result = await withErrorHandling(async () => {
      let totalSize = 0;
      for (let i = 0; i < this.adapter.length; i++) {
        const key = this.adapter.key(i);
        if (key) {
          const value = this.adapter.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
      return totalSize;
    });

    return result.data || 0;
  }

  // Check if storage is available
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      this.adapter.setItem(testKey, 'test');
      this.adapter.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Cleanup expired items
  async cleanup(): Promise<number> {
    const result = await withErrorHandling(async () => {
      let cleanedCount = 0;
      const keys = await this.keys();
      
      for (const key of keys) {
        const item = this.adapter.getItem(key);
        if (item) {
          try {
            const parsed: StorageItem = JSON.parse(item);
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
              this.adapter.removeItem(key);
              cleanedCount++;
            }
          } catch {
            // Skip non-JSON items
          }
        }
      }
      
      return cleanedCount;
    });

    return result.data || 0;
  }
}

// Default storage instances
export const localStorage = new StorageManager('localStorage');
export const sessionStorage = new StorageManager('sessionStorage');

// Utility functions
export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  cacheTimeMs: number = 5 * 60 * 1000, // 5 minutes default
  storage: StorageManager = localStorage
): Promise<T> {
  // Try to get from cache first
  const cached = await storage.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();
  
  // Cache the result
  await storage.set(key, data, cacheTimeMs);
  
  return data;
}

export async function invalidateCache(
  pattern: string | RegExp,
  storage: StorageManager = localStorage
): Promise<number> {
  const keys = await storage.keys();
  let removedCount = 0;

  for (const key of keys) {
    const shouldRemove = typeof pattern === 'string' 
      ? key.includes(pattern)
      : pattern.test(key);
      
    if (shouldRemove) {
      await storage.remove(key);
      removedCount++;
    }
  }

  return removedCount;
}

// Storage hooks for React components
export function useStorage<T>(
  key: string,
  defaultValue: T,
  storage: StorageManager = localStorage
) {
  const [value, setValue] = React.useState<T>(defaultValue);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadValue = async () => {
      const stored = await storage.get<T>(key);
      setValue(stored !== null ? stored : defaultValue);
      setLoading(false);
    };

    loadValue();
  }, [key, defaultValue, storage]);

  const updateValue = React.useCallback(async (newValue: T) => {
    setValue(newValue);
    await storage.set(key, newValue);
  }, [key, storage]);

  const removeValue = React.useCallback(async () => {
    setValue(defaultValue);
    await storage.remove(key);
  }, [key, defaultValue, storage]);

  return {
    value,
    setValue: updateValue,
    removeValue,
    loading,
  };
}

// Storage quota management
export async function getStorageQuota(): Promise<{
  quota: number;
  usage: number;
  available: number;
}> {
  if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
      };
    } catch {
      // Fallback for browsers that don't support storage estimation
    }
  }

  return {
    quota: 0,
    usage: 0,
    available: 0,
  };
}

// Storage migration helper
export async function migrateStorage(
  oldKey: string,
  newKey: string,
  transform?: (value: any) => any,
  storage: StorageManager = localStorage
): Promise<boolean> {
  const oldValue = await storage.get(oldKey);
  if (oldValue === null) return false;

  const newValue = transform ? transform(oldValue) : oldValue;
  const success = await storage.set(newKey, newValue);
  
  if (success) {
    await storage.remove(oldKey);
  }

  return success;
}

// React import for hooks
import React from 'react';