import type { Db } from "@ruby/db";
import * as schema from "@ruby/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Env } from "../env";

export function createAuth(db: Db, env: Env) {
	// Google is optional outside production (loadEnv enforces it there); without
	// credentials the provider is left out instead of failing at sign-in time.
	const googleEnabled = Boolean(
		env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
	);

	return betterAuth({
		database: drizzleAdapter(db, { provider: "pg", schema }),
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.API_URL,
		basePath: "/auth",
		trustedOrigins: [env.WEB_URL],
		emailAndPassword: { enabled: true, minPasswordLength: 8 },
		socialProviders: googleEnabled
			? {
					google: {
						clientId: env.GOOGLE_CLIENT_ID,
						clientSecret: env.GOOGLE_CLIENT_SECRET,
						scope: ["openid", "email", "profile"],
					},
				}
			: {},
		// Google is trusted to vouch for e-mail ownership. Better Auth still refuses
		// implicit linking onto a local account whose e-mail is unverified
		// (requireLocalEmailVerified defaults to true), which blocks pre-account hijacking.
		account: {
			accountLinking: { enabled: true, trustedProviders: ["google"] },
		},
	});
}

export type Auth = ReturnType<typeof createAuth>;
