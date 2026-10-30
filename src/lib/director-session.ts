// Embedded previews need a partitioned cookie; ordinary sites use SameSite=Lax.
export function isEmbeddedPreviewHost(url: URL) {
  const host = url.hostname.toLowerCase();
  if (host === "localhost") return true; // TEMP-TEST
  return url.protocol === "https:" && (
    (/^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(host.split(".")[0]) && host.endsWith(".lovable.app")) ||
    host.endsWith(".lovableproject.com")
  );
}

export function directorSessionCookie(url: URL) {
  const secure = url.protocol === "https:";
  const embeddedPreview = isEmbeddedPreviewHost(url);
  return {
    httpOnly: true,
    secure,
    sameSite: embeddedPreview ? "none" as const : "lax" as const,
    partitioned: embeddedPreview,
    path: "/",
  };
}

// Fallback for editor previews whose browser blocks iframe cookies entirely
// (e.g. Chrome on Android): a short-lived signed token sent in a header.
const enc = new TextEncoder();
function b64url(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
async function hmac(secret: string, payload: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  return key;
}

export async function signDirectorToken(secret: string, director: string, ttlSeconds: number, now = Date.now()) {
  const payload = b64url(enc.encode(JSON.stringify({ d: director, exp: Math.floor(now / 1000) + ttlSeconds })));
  const key = await hmac(secret, payload);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${b64url(sig)}`;
}

export async function verifyDirectorToken(secret: string, token: string | undefined | null, now = Date.now()) {
  if (!token || token.length > 1000) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const key = await hmac(secret, payload);
    const ok = await crypto.subtle.verify("HMAC", key, fromB64url(sig), enc.encode(payload));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as { d?: unknown; exp?: unknown };
    if (typeof data.d !== "string" || typeof data.exp !== "number" || data.exp * 1000 < now) return null;
    return data.d;
  } catch {
    return null;
  }
}
