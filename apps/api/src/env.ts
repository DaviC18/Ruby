import { z } from "zod";

const envSchema = z
	.object({
		DATABASE_URL: z.url(),
		API_URL: z.url().default("http://localhost:3333"),
		WEB_URL: z.url().default("http://localhost:3000"),
		BETTER_AUTH_SECRET: z.string().min(32),
		// Google OAuth is optional in development/test (the provider is simply left out),
		// but required when NODE_ENV=production; see the refinement below.
		GOOGLE_CLIENT_ID: z.string().default(""),
		GOOGLE_CLIENT_SECRET: z.string().default(""),
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
	})
	.superRefine((env, ctx) => {
		if (env.NODE_ENV !== "production") return;
		for (const key of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const) {
			if (!env[key]) {
				ctx.addIssue({
					code: "custom",
					path: [key],
					message: `${key} is required when NODE_ENV=production`,
				});
			}
		}
	});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(
	source: Record<string, string | undefined> = process.env,
): Env {
	const result = envSchema.safeParse(source);
	if (!result.success) {
		throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
	}
	return result.data;
}
