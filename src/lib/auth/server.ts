import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";

// Neon Auth (managed Better Auth). Users live in the neon_auth schema of the
// beesyde Neon project; this app stores no passwords or Google tokens itself.
const baseUrl = process.env.NEON_AUTH_BASE_URL;
const secret = process.env.NEON_AUTH_COOKIE_SECRET;
if (!baseUrl || !secret)
  throw new Error("NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set");

export const auth = createNeonAuth({ baseUrl, cookies: { secret } });
