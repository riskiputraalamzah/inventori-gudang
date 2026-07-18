import { cookies } from 'next/headers';
import { createHash } from 'crypto';

// Session payload
export type UserSession = {
  id: number;
  name: string;
  email: string;
  role: string;
};

// Simple XOR/base64 encryption helper to avoid external dependencies (like jose/bcrypt)
// while remaining lightweight, fast, and edge-compatible.
const SECRET_KEY = process.env.SESSION_SECRET || 'secret-gudang-key-2026';

export function encryptSession(session: UserSession): string {
  const str = JSON.stringify({ ...session, exp: Date.now() + 86400000 }); // 24h expiry
  const bytes = new TextEncoder().encode(str);
  const keyBytes = new TextEncoder().encode(SECRET_KEY);
  const encrypted = bytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
  return btoa(String.fromCharCode(...encrypted));
}

export function decryptSession(token: string): UserSession | null {
  try {
    const raw = atob(token);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    const keyBytes = new TextEncoder().encode(SECRET_KEY);
    const decryptedBytes = bytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
    const decrypted = new TextDecoder().decode(decryptedBytes);
    const parsed = JSON.parse(decrypted);

    if (parsed.exp < Date.now()) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    return decryptSession(token);
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}
