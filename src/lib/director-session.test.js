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