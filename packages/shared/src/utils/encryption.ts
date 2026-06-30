import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCODING: BufferEncoding = "hex";
const SEPARATOR = ":";

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * Returns a colon-delimited string: `iv:encryptedData:authTag`
 * This format allows storing all encryption artifacts in a single DB column.
 *
 * @param plaintext - The text to encrypt
 * @param keyHex - The 256-bit encryption key as a hex string (64 chars)
 * @returns Encrypted string in format `iv:encrypted:authTag`
 */
export function encryptField(plaintext: string, keyHex: string): string {
  if (!plaintext) return plaintext;

  const key = Buffer.from(keyHex, ENCODING);
  if (key.length !== 32) {
    throw new Error(
      "Encryption key must be 32 bytes (64 hex characters). " +
        `Got ${key.length} bytes.`
    );
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag().toString(ENCODING);

  return [iv.toString(ENCODING), encrypted, authTag].join(SEPARATOR);
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 *
 * @param ciphertext - The encrypted string in format `iv:encrypted:authTag`
 * @param keyHex - The 256-bit encryption key as a hex string (64 chars)
 * @returns Decrypted plaintext string
 */
export function decryptField(ciphertext: string, keyHex: string): string {
  if (!ciphertext) return ciphertext;

  const parts = ciphertext.split(SEPARATOR);
  if (parts.length !== 3) {
    throw new Error(
      "Invalid ciphertext format. Expected `iv:encrypted:authTag`."
    );
  }

  const [ivHex, encrypted, authTagHex] = parts as [string, string, string];
  const key = Buffer.from(keyHex, ENCODING);

  if (key.length !== 32) {
    throw new Error(
      "Encryption key must be 32 bytes (64 hex characters). " +
        `Got ${key.length} bytes.`
    );
  }

  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(authTagHex, ENCODING);

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(
      `Invalid auth tag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`
    );
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, ENCODING, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Checks if a string is in the encrypted format (iv:data:tag).
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(SEPARATOR);
  return parts.length === 3 && parts.every((p) => /^[0-9a-f]+$/i.test(p));
}

/**
 * Generates a random 256-bit encryption key as a hex string.
 * Use this to generate the ENCRYPTION_KEY env variable.
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString(ENCODING);
}
