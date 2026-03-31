// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - PERSISTENCIA LOCAL SEGURA
// ═══════════════════════════════════════════════════════════════
 
import { useState, useCallback, useRef } from 'react';
import { useEncryption } from './useEncryption';
 
export function useLocalStorage<T>(key: string, initialValue: T, encrypt = false) {
  const { encrypt: encryptData, decrypt: decryptData } = useEncryption();
  
  // Guardamos initialValue en un ref para que no cambie entre renders
  const initialValueRef = useRef(initialValue);
 
  const readValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValueRef.current;
      
      if (encrypt) {
        const decrypted = decryptData(item) as T;
        return decrypted;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key, encrypt, decryptData]);
 
  const [storedValue, setStoredValue] = useState<T>(readValue);
 
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = typeof value === 'function'
          ? (value as (val: T) => T)(prev)
          : value;
 
        if (encrypt) {
          const encrypted = encryptData(valueToStore);
          window.localStorage.setItem(key, encrypted);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
 
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, encrypt, encryptData]);
 
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValueRef.current);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key]);
 
  return [storedValue, setValue, removeValue] as const;
}
 
export default useLocalStorage;