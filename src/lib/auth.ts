import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getAdminConfig } from "./env";

export const ADMIN_COOKIE = "incel_feedback_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createAdminSessionToken(): string {
  const { sessionSecret } = getAdminConfig();
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt, sessionSecret);
  return `${issuedAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const { sessionSecret } = getAdminConfig();
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expected = sign(issuedAt, sessionSecret);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > MAX_AGE_SECONDS * 1000) {
    return false;
  }

  return true;
}

export function verifyAdminPassword(password: string): boolean {
  const { password: expected } = getAdminConfig();
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function setAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
