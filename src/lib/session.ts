/**
 * Minimal signed-cookie session for a single-user app.
 *
 * Token format: `<expiresAtMillis>.<hex hmac-sha256(expiresAtMillis)>`
 * Uses Web Crypto so it runs in both the Node runtime (API routes) and the
 * Edge runtime (middleware).
 */

export const SESSION_COOKIE = "mariephone_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${await hmacHex(secret, payload)}`;
}

export async function verifySessionToken(
  secret: string,
  token: string | undefined,
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await hmacHex(secret, payload);
  if (signature.length !== expected.length) return false;
  // Constant-time comparison.
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
