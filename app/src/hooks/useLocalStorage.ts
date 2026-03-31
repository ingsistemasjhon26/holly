// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - PERSISTENCIA LOCAL SEGURA
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import { useEncryption } from './useEncryption';

export function useLocalStorage<T>(key: string, initialValue: T, encrypt = false) {
  const { encrypt: encryptData, decrypt: decryptData } = useEncryption();
  
  const readValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      
      if (encrypt) {
        const decrypted = decryptData(item) as T;
        return decrypted;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, encrypt, decryptData]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      let valueToStore: T;
      if (typeof value === 'function') {
        valueToStore = (value as (val: T) => T)(storedValue);
      } else {
        valueToStore = value;
      }
      
      setStoredValue(valueToStore);
      
      if (encrypt) {
        const encrypted = encryptData(valueToStore);
        window.localStorage.setItem(key, encrypted);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, encrypt, encryptData]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue] as const;
}

export default useLocalStorage;
