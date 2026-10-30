import { createMiddleware } from "@tanstack/react-start";

export const DIRECTOR_TOKEN_KEY = "dixab-director-token";

export function readDirectorToken() {
  try { return typeof window === "undefined" ? null : window.sessionStorage.getItem(DIRECTOR_TOKEN_KEY); } catch { return null; }
}
export function saveDirectorToken(token: string | undefined) {
  try { if (token) window.sessionStorage.setItem(DIRECTOR_TOKEN_KEY, token); else window.sessionStorage.removeItem(DIRECTOR_TOKEN_KEY); } catch { /* storage blocked */ }
}

// Sends the preview-only director token when the browser blocks iframe cookies.
export const attachDirectorToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = readDirectorToken();
  return next({ headers: token ? { "x-director-token": token } : {} });
});
