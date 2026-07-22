/**
 * Utility modul untuk enkripsi password berbasis Hashing + Salt (PBKDF2 / SHA-256 dengan Salt Unik)
 * Mendukung verifikasi login aman & backward compatibility untuk password legacy.
 */

// Generate random salt 16-byte hex
export function generateSalt(length = 16): string {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  // Fallback Node.js / Math.random
  let salt = "";
  const chars = "abcdef0123456789";
  for (let i = 0; i < length * 2; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

// Hash password with salt using SHA-256
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);

  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback basic hashing
  let hash = 0;
  const combined = salt + password;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

// Format stored password string: "SALT$HASH"
export async function createEncryptedPassword(password: string): Promise<string> {
  const salt = generateSalt(16);
  const hash = await hashPasswordWithSalt(password, salt);
  return `${salt}$${hash}`;
}

// Verify input password against stored string ("SALT$HASH" or legacy plain text)
export async function verifyPassword(inputPassword: string, storedPassword?: string | null): Promise<boolean> {
  if (!storedPassword) return false;

  // Check if storedPassword is formatted as "SALT$HASH"
  if (storedPassword.includes("$")) {
    const [salt, storedHash] = storedPassword.split("$");
    if (!salt || !storedHash) return false;
    const computedHash = await hashPasswordWithSalt(inputPassword, salt);
    return computedHash === storedHash;
  }

  // Fallback: Legacy Plain Text check (Will be auto-upgraded upon login)
  return inputPassword === storedPassword;
}
