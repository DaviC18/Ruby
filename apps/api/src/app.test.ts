import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { loadEnv } from "./env";
import { testApp } from "./test/helpers";

const VALID_ENV = {
	DATABASE_URL: "postgres://ruby:ruby@localhost:5433/ruby_test",
	API_URL: "http://localhost:3333",
	WEB_URL: "http://localhost:3000",
	BETTER_AUTH_SECRET: "x".repeat(32),
	GOOGLE_CLIENT_ID: "google-id",
	GOOGLE_CLIENT_SECRET: "google-secret",
	NODE_ENV: "test",
};

describe("loadEnv", () => {
	it("parses a valid environment", () => {
		expect(loadEnv(VALID_ENV).WEB_URL).toBe("http://localhost:3000");
	});

	it("throws when BETTER_AUTH_SECRET is missing", () => {
		const { BETTER_AUTH_SECRET: _omit, ...rest } = VALID_ENV;
		expect(() => loadEnv(rest)).toThrow(/BETTER_AUTH_SECRET/);
	});

	it("throws when BETTER_AUTH_SECRET is shorter than 32 chars", () => {
		expect(() =>
			loadEnv({ ...VALID_ENV, BETTER_AUTH_SECRET: "short" }),
		).toThrow(/BETTER_AUTH_SECRET/);
	});

	it("allows missing Google credentials outside production", () => {
		const {
			GOOGLE_CLIENT_ID: _id,
			GOOGLE_CLIENT_SECRET: _secret,
			...rest
		} = VALID_ENV;
		expect(loadEnv({ ...rest, NODE_ENV: "development" }).GOOGLE_CLIENT_ID).toBe(
			"",
		);
	});

	it("requires Google credentials when NODE_ENV=production", () => {
		expect(() =>
			loadEnv({ ...VALID_ENV, NODE_ENV: "production", GOOGLE_CLIENT_ID: "" }),
		).toThrow(/GOOGLE_CLIENT_ID/);
		expect(() =>
			loadEnv({
				...VALID_ENV,
				NODE_ENV: "production",
				GOOGLE_CLIENT_SECRET: undefined,
			}),
		).toThrow(/GOOGLE_CLIENT_SECRET/);
	});
});

describe("app", () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		app = await testApp();
		app.post("/__test/validate", async (req) => {
			const body = z.object({ name: z.string().min(1) }).parse(req.body);
			return { name: body.name };
		});
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it("GET /health returns 200 { status: 'ok' }", async () => {
		const res = await app.inject({ method: "GET", url: "/health" });
		expect(res.statusCode).toBe(200);
		expect(res.json()).toEqual({ status: "ok" });
	});

	it("converts a ZodError into 400 { error: 'validation', issues }", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/__test/validate",
			payload: { name: 123 },
		});
		expect(res.statusCode).toBe(400);
		const body = res.json();
		expect(body.error).toBe("validation");
		expect(Array.isArray(body.issues)).toBe(true);
		expect(body.issues[0].path).toEqual(["name"]);
	});

	it("allows CORS from WEB_URL with credentials", async () => {
		const res = await app.inject({
			method: "GET",
			url: "/health",
			headers: { origin: "http://localhost:3000" },
		});
		expect(res.headers["access-control-allow-origin"]).toBe(
			"http://localhost:3000",
		);
		expect(res.headers["access-control-allow-credentials"]).toBe("true");
	});
});
