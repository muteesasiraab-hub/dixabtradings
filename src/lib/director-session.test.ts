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
  test("local development never uses insecure SameSite=None", () => {
    expect(directorSessionCookie(new URL("http://localhost:8080/directors"))).toEqual({
      httpOnly: true, secure: false, sameSite: "lax", partitioned: false, path: "/",
    });
  });
});