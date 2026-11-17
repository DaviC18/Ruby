import { createAuthClient } from "better-auth/react";

// Better Auth runs on the Fastify API (apps/api) under /auth.
export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333"}/auth`,
});
