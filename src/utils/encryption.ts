/**
 * AES-GCM encryption & decryption using the Web Crypto API.
 * The passphrase is stretched via PBKDF2 (100 000 iterations, SHA-256)
 * before being used as an AES-256-GCM key.
 *
 * Stored format: base64( salt[16] ‖ iv[12] ‖ ciphertext )
 */

const ENC_META_KEY = "moodjaar.enc.meta";

async function deriveKey(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: 100_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(
  plaintext: string,
  passphrase: string
): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    enc.encode(plaintext)
  );
  // combine: salt ‖ iv ‖ ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ct.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ct), salt.length + iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decrypt(
  encoded: string,
  passphrase: string
): Promise<string> {
  const raw = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const salt = raw.slice(0, 16);
  const iv = raw.slice(16, 28);
  const ct = raw.slice(28);
  const key = await deriveKey(passphrase, salt);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ct.buffer as ArrayBuffer
  );
  return new TextDecoder().decode(pt);
}

/** Check whether the browser supports SubtleCrypto */
export function cryptoAvailable(): boolean {
  try {
    return (
      typeof crypto !== "undefined" &&
      typeof crypto.subtle !== "undefined" &&
      typeof crypto.subtle.encrypt === "function"
    );
  } catch {
    return false;
  }
}

export interface EncryptionMeta {
  enabled: boolean;
  /** A tiny test ciphertext so we can verify the passphrase */
  probe?: string;
}

export function loadEncMeta(): EncryptionMeta {
  try {
    const raw = localStorage.getItem(ENC_META_KEY);
    if (!raw) return { enabled: false };
    return JSON.parse(raw) as EncryptionMeta;
  } catch {
    return { enabled: false };
  }
}

export function saveEncMeta(meta: EncryptionMeta) {
  localStorage.setItem(ENC_META_KEY, JSON.stringify(meta));
}

const PROBE_PLAIN = "moodjaar-ok";

export async function createProbe(passphrase: string): Promise<string> {
  return encrypt(PROBE_PLAIN, passphrase);
}

export async function verifyProbe(
  probe: string,
  passphrase: string
): Promise<boolean> {
  try {
    const result = await decrypt(probe, passphrase);
    return result === PROBE_PLAIN;
  } catch {
    return false;
  }
}
