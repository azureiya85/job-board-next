export const webCrypto = {
  // Generate random bytes 
  randomBytes: (length: number): Uint8Array => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // Web Crypto API (Edge Runtime compatible)
      return crypto.getRandomValues(new Uint8Array(length));
    }
    throw new Error('Web Crypto API not available');
  },

  // Generate random hex string (equivalent to crypto.randomBytes().toString('hex'))
  randomString: (length: number): string => {
    const bytes = webCrypto.randomBytes(length);
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  },

  // Generate UUID 
  randomUUID: (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generation
    const bytes = webCrypto.randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; 
    bytes[8] = (bytes[8] & 0x3f) | 0x80; 
    
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  },

  // Hash function using Web Crypto API
  hash: async (data: string, algorithm: 'SHA-256' | 'SHA-1' = 'SHA-256'): Promise<string> => {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
      const hashArray = new Uint8Array(hashBuffer);
      return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('Web Crypto API not available');
  }
};

// Universal crypto helper that works in both Edge and Node.js environments
export const universalCrypto = {
  // Generate a secure random token (hex string)
  generateToken: (byteLength: number = 32): string => {
    return webCrypto.randomString(byteLength);
  },

  // Generate UUID
  generateUUID: (): string => {
    return webCrypto.randomUUID();
  },

  // Hash function
  hash: async (data: string, algorithm: 'SHA-256' | 'SHA-1' = 'SHA-256'): Promise<string> => {
    return await webCrypto.hash(data, algorithm);
  }
};