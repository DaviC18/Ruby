import type { Db } from "@ruby/db";
import { account, session, user } from "@ruby/db/schema";
import { count, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { signUpAndLogin, testApp } from "../test/helpers";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

let app: FastifyInstance;
let db: Db;

beforeAll(async () => {
	app = await testApp();
	db = app.db;
	await app.ready();
});

afterAll(async () => {
	await app.close();
});

beforeEach(async () => {
	await db.delete(user);
});

afterEach(() => {
	vi.restoreAllMocks();
});

/** Joins every Set-Cookie of a response into one Cookie request header. */
function cookieHeader(setCookie: string | string[] | undefined): string {
	const list = Array.isArray(setCookie)
		? setCookie
		: setCookie
			? [setCookie]
			: [];
	return list.map((c) => c.split(";")[0]).join("; ");
}

/** Unsigned JWT: the Google provider only decodes the id_token from the token endpoint response. */
function fakeIdToken(claims: Record<string, unknown>): string {
	const b64 = (o: unknown) =>
		Buffer.from(JSON.stringify(o)).toString("base64url");
	return `${b64({ alg: "RS256", typ: "JWT", kid: "test" })}.${b64(claims)}.signature`;
}

/**
 * Runs the real Google OAuth flow through the API: /auth/sign-in/social issues the
 * authorization URL and state cookie, then /auth/callback/google completes it.
 * Only the network call to Google's token endpoint is mocked.
 */
async function googleSignIn(email: string, sub: string) {
	const start = await app.inject({
		method: "POST",
		url: "/auth/sign-in/social",
		headers: { origin: "http://localhost:3000" },
		payload: { provider: "google", callbackURL: "http://localhost:3000/" },
	});
	expect(start.statusCode).toBe(200);
	const authUrl = new URL(start.json().url);
	expect(authUrl.origin).toBe("https://accounts.google.com");
	const state = authUrl.searchParams.get("state");
	if (!state) throw new Error("missing state");

	const now = Math.floor(Date.now() / 1000);
	const realFetch = globalThis.fetch;
	const fetchSpy = vi
		.spyOn(globalThis, "fetch")
		.mockImplementation(async (input, init) => {
			const url = input instanceof Request ? input.url : String(input);
			if (url.startsWith(GOOGLE_TOKEN_ENDPOINT)) {
				return Response.json({
					access_token: "google-access-token",
					token_type: "Bearer",
					expires_in: 3600,
					scope: "openid email profile",
					id_token: fakeIdToken({
						iss: "https://accounts.google.com",
						aud: "test-google-client-id",
						sub,
						email,
						email_verified: true,
						name: "Ana Google",
						iat: now,
						exp: now + 3600,
					}),
				});
			}
			return realFetch(input, init);
		});

	const callback = await app.inject({
		method: "GET",
		url: `/auth/callback/google?code=fake-code&state=${encodeURIComponent(state)}`,
		headers: { cookie: cookieHeader(start.headers["set-cookie"]) },
	});
	expect(fetchSpy).toHaveBeenCalled();
	return callback;
}

async function countRows() {
	const [users] = await db.select({ n: count() }).from(user);
	const [accounts] = await db.select({ n: count() }).from(account);
	return { users: users?.n, accounts: accounts?.n };
}

describe("email/password auth", () => {
	it("signs up, sets a session cookie and GET /v1/me returns the user", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/auth/sign-up/email",
			headers: { origin: "http://localhost:3000" },
			payload: { email: "bia@x.com", password: "password123", name: "Bia" },
		});
		expect(res.statusCode).toBe(200);
		const cookie = cookieHeader(res.headers["set-cookie"]);
		expect(cookie).toMatch(/session_token=/);

		const me = await app.inject({
			method: "GET",
			url: "/v1/me",
			headers: { cookie },
		});
		expect(me.statusCode).toBe(200);
		expect(me.json()).toEqual({
			id: res.json().user.id,
			email: "bia@x.com",
			name: "Bia",
		});
	});

	it("GET /v1/me without a cookie returns 401", async () => {
		const res = await app.inject({ method: "GET", url: "/v1/me" });
		expect(res.statusCode).toBe(401);
		expect(res.json()).toEqual({ error: "unauthorized" });
	});

	it("GET /v1/me with a forged cookie returns 401", async () => {
		const res = await app.inject({
			method: "GET",
			url: "/v1/me",
			headers: { cookie: "better-auth.session_token=forged.value" },
		});
		expect(res.statusCode).toBe(401);
	});

	it("rejects a 7-character password with 400", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/auth/sign-up/email",
			headers: { origin: "http://localhost:3000" },
			payload: { email: "short@x.com", password: "1234567", name: "Short" },
		});
		expect(res.statusCode).toBe(400);
		expect((await countRows()).users).toBe(0);
	});

	it("signUpAndLogin returns a working cookie and the user id", async () => {
		const { cookie, userId } = await signUpAndLogin(app, "helper@x.com");
		const me = await app.inject({
			method: "GET",
			url: "/v1/me",
			headers: { cookie },
		});
		expect(me.json().id).toBe(userId);
	});
});

describe("session lifecycle through the bridge", () => {
	it("forwards the refreshed session cookie when /v1/* triggers a session refresh", async () => {
		const { cookie, userId } = await signUpAndLogin(app, "refresh@x.com");
		// Defaults: expiresIn 7 days, updateAge 1 day. Leaving 5 days on the clock
		// means the session was last refreshed 2 days ago, so getSession extends it.
		const staleExpiry = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
		await db
			.update(session)
			.set({ expiresAt: staleExpiry })
			.where(eq(session.userId, userId));

		const me = await app.inject({
			method: "GET",
			url: "/v1/me",
			headers: { cookie },
		});
		expect(me.statusCode).toBe(200);
		const setCookie = [me.headers["set-cookie"] ?? []].flat();
		const refreshed = setCookie.find((c) => c.includes("session_token="));
		expect(refreshed).toBeDefined();
		expect(refreshed).toMatch(/Max-Age=604800/);

		const [row] = await db
			.select({ expiresAt: session.expiresAt })
			.from(session)
			.where(eq(session.userId, userId));
		expect(row?.expiresAt.getTime()).toBeGreaterThan(staleExpiry.getTime());
	});

	it("does not set a cookie on /v1/* when no refresh is due", async () => {
		const { cookie } = await signUpAndLogin(app, "fresh@x.com");
		const me = await app.inject({
			method: "GET",
			url: "/v1/me",
			headers: { cookie },
		});
		expect(me.headers["set-cookie"]).toBeUndefined();
	});

	it("signs out with an empty application/json body", async () => {
		const { cookie } = await signUpAndLogin(app, "out@x.com");
		const res = await app.inject({
			method: "POST",
			url: "/auth/sign-out",
			headers: {
				cookie,
				origin: "http://localhost:3000",
				"content-type": "application/json",
			},
			body: "",
		});
		expect(res.statusCode).toBe(200);

		const me = await app.inject({
			method: "GET",
			url: "/v1/me",
			headers: { cookie },
		});
		expect(me.statusCode).toBe(401);
	});

	it("signs out with the body the better-auth client sends ({})", async () => {
		const { cookie } = await signUpAndLogin(app, "out2@x.com");
		const res = await app.inject({
			method: "POST",
			url: "/auth/sign-out",
			headers: { cookie, origin: "http://localhost:3000" },
			payload: {},
		});
		expect(res.statusCode).toBe(200);
	});
});

describe("Google account linking (Review Focus #2)", () => {
	it("links Google to an existing verified password account with the same email", async () => {
		const { userId } = await signUpAndLogin(app, "ana@x.com");
		// Better Auth refuses implicit linking onto an unverified local account
		// (requireLocalEmailVerified defaults to true), so ana's e-mail is verified first.
		await db
			.update(user)
			.set({ emailVerified: true })
			.where(eq(user.id, userId));

		const callback = await googleSignIn("ana@x.com", "google-sub-ana");
		expect(callback.statusCode).toBe(302);
		expect(callback.headers.location).toBe("http://localhost:3000/");

		expect(await countRows()).toEqual({ users: 1, accounts: 2 });
		const providers = await db
			.select({ providerId: account.providerId, userId: account.userId })
			.from(account);
		expect(providers.map((p) => p.providerId).sort()).toEqual([
			"credential",
			"google",
		]);
		expect(providers.every((p) => p.userId === userId)).toBe(true);

		const cookie = cookieHeader(callback.headers["set-cookie"]);
		const me = await app.inject({
			method: "GET",
			url: "/v1/me",
			headers: { cookie },
		});
		expect(me.json().id).toBe(userId);
	});

	it("does not link Google onto an unverified password account (pre-hijack protection)", async () => {
		await signUpAndLogin(app, "ana@x.com");

		const callback = await googleSignIn("ana@x.com", "google-sub-ana");
		expect(callback.statusCode).toBe(302);
		expect(callback.headers.location).toMatch(/error=account_not_linked/);
		expect(await countRows()).toEqual({ users: 1, accounts: 1 });
	});

	it("creates a new user on first Google sign-in", async () => {
		const callback = await googleSignIn("new@x.com", "google-sub-new");
		expect(callback.statusCode).toBe(302);
		expect(await countRows()).toEqual({ users: 1, accounts: 1 });
	});
});
