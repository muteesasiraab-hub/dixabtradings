// Embedded previews need a partitioned cookie; ordinary sites use SameSite=Lax.
export function directorSessionCookie(url: URL) {
  const secure = url.protocol === "https:";
  const embeddedPreview = secure && url.hostname.startsWith("id-preview--") && url.hostname.endsWith(".lovable.app");
  return {
    httpOnly: true,
    secure,
    sameSite: embeddedPreview ? "none" as const : "lax" as const,
    partitioned: embeddedPreview,
    path: "/",
  };
}