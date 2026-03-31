// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - SISTEMA DE ENCRIPTACIÓN
// ═══════════════════════════════════════════════════════════════

import { useCallback } from 'react';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'HollyClub_SecureKey_2024!@#';

export function useEncryption() {
  const encrypt = useCallback((data: unknown): string => {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
        iv: CryptoJS.lib.WordArray.random(16),
      });
      return encrypted.toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }, []);

  const decrypt = useCallback((encryptedData: string): unknown => {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }, []);

  const hash = useCallback((data: string): string => {
    return CryptoJS.SHA256(data + SECRET_KEY).toString();
  }, []);

  return { encrypt, decrypt, hash };
}

export default useEncryption;
