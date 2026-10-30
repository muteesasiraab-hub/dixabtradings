import { describe, expect, test } from "bun:test";
import { directorSessionCookie } from "./director-session";

describe("director session cookies", () => {
  test("embedded preview keeps the encrypted session across requests", () => {
    expect(directorSessionCookie(new URL("https://id-preview--example.lovable.app/directors"))).toEqual({
      httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/",
    });
  });
  test("company website retains same-site protections", () => {
    expect(directorSessionCookie(new URL("https://dixabtradings.com/directors"))).toEqual({
      httpOnly: true, secure: true, sameSite: "lax", partitioned: false, path: "/",
    });
  });
  test("live editor preview keeps the director session in its iframe", () => {
    expect(directorSessionCookie(new URL("https://d22d1951-0134-458a-918a-91bcc7a64710.lovableproject.com/directors"))).toEqual({
      httpOnly: true, secure: true, sameSite: "none", partitioned: true, path: "/",
    });
  });
  test("local development never uses insecure SameSite=None", () => {
    expect(directorSessionCookie(new URL("http://localhost:8080/directors"))).toEqual({
      httpOnly: true, secure: false, sameSite: "lax", partitioned: false, path: "/",
    });
  });
});
import { signDirectorToken, verifyDirectorToken, isEmbeddedPreviewHost } from "./director-session";
const SECRET = "x".repeat(40);
describe("director preview token", () => {
  test("a signed token identifies the director", async () => {
    const t = await signDirectorToken(SECRET, "muteesasira abbey", 3600);
    expect(await verifyDirectorToken(SECRET, t)).toBe("muteesasira abbey");
  });
  test("a token expires after 8 hours", async () => {
    const t = await signDirectorToken(SECRET, "muteesasira abbey", 8 * 3600, 0);
    expect(await verifyDirectorToken(SECRET, t, 8 * 3600 * 1000 + 1000)).toBeNull();
  });
  test("a tampered token is rejected", async () => {
    const t = await signDirectorToken(SECRET, "dickson niwagaba", 3600);
    const forged = btoa(JSON.stringify({ d: "dickson niwagaba", exp: 9999999999 })).replace(/=+$/, "") + "." + t.split(".")[1];
    expect(await verifyDirectorToken(SECRET, forged)).toBeNull();
    expect(await verifyDirectorToken("y".repeat(40), t)).toBeNull();
  });
  test("the token fallback is never used on the company website", () => {
    expect(isEmbeddedPreviewHost(new URL("https://dixabtradings.com/directors"))).toBe(false);
    expect(isEmbeddedPreviewHost(new URL("https://dixabtradings.lovable.app/directors"))).toBe(false);
  });
});
