"use client";
import { createAuthClient } from "@neondatabase/auth/next";

// Talks to this app's /api/auth proxy, which forwards to Neon Auth.
export const authClient = createAuthClient();
