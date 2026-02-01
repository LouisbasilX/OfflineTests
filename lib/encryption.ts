class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EncryptionError'
  }
}

export async function encryptData(data: any, keyString: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const dataStr = JSON.stringify(data)
    const dataBuffer = encoder.encode(dataStr)
    
    // Derive a key from the test code
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keyString),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('offlinetests-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    )
    
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    )
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    // Convert to base64 for storage
    const charCodes = Array.from(combined, byte => byte)
return btoa(String.fromCharCode(...charCodes))
  } catch (error) {
    console.error('Encryption error:', error)
    throw new EncryptionError('Failed to encrypt data')
  }
}

export async function decryptData(encryptedData: string, keyString: string): Promise<any> {
  try {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    
    // Convert from base64
    const binaryString = atob(encryptedData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Extract IV (first 12 bytes) and data
    const iv = bytes.slice(0, 12)
    const data = bytes.slice(12)
    
    // Derive key
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keyString),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    )
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('offlinetests-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    return JSON.parse(decoder.decode(decrypted))
  } catch (error) {
    console.error('Decryption error:', error)
    throw new EncryptionError('Failed to decrypt data')
  }
}

// Generate a random 6-digit test code
export function generateTestCode(): string {
  const min = 100000
  const max = 999999
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}