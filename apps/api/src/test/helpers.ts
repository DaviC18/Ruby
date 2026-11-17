import { fileURLToPath } from "node:url";
import { createDb, type Db } from "@ruby/db";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app";
import { type Env, loadEnv } from "../env";

const TEST_URL =
	process.env.DATABASE_URL_TEST ??
	"postgres://ruby:ruby@localhost:5433/ruby_test";

const MIGRATIONS_FOLDER = fileURLToPath(
	new URL("../../../../packages/db/src/migrations", import.meta.url),
);

// Every table wiped between tests.
const TRUNCATED_TABLES = [
	"tenant",
	"membership",
	"business_hours",
	"service",
	"user",
	"session",
	"account",
	"verification",
];

export function testEnv(): Env {
	return loadEnv({
		DATABASE_URL: TEST_URL,
		API_URL: "http://localhost:3333",
		WEB_URL: "http://localhost:3000",
		BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret!",
		GOOGLE_CLIENT_ID: "test-google-client-id",
		GOOGLE_CLIENT_SECRET: "test-google-client-secret",
		NODE_ENV: "test",
	});
}

/** Connects to the test database, applies migrations and truncates every table. Caller must end `db.$client`. */
export async function testDb(): Promise<Db> {
	const db = createDb(TEST_URL);
	await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
	const tables = TRUNCATED_TABLES.map((t) => `"${t}"`).join(", ");
	await db.execute(sql.raw(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`));
	return db;
}

/** Builds the app against a fresh test database; closing the app also closes the DB connection. */
export async function testApp(): Promise<FastifyInstance> {
	const db = await testDb();
	const app = await buildApp({ db, env: testEnv() });
	app.addHook("onClose", async () => {
		await db.$client.end();
	});
	return app;
}

/** Signs up `email` with a fixed valid password through /auth/sign-up/email and returns the session cookie. */
export async function signUpAndLogin(
	app: FastifyInstance,
	email: string,
): Promise<{ cookie: string; userId: string }> {
	const res = await app.inject({
		method: "POST",
		url: "/auth/sign-up/email",
		headers: { origin: "http://localhost:3000" },
		payload: { email, password: "password123", name: email.split("@")[0] },
	});
	if (res.statusCode !== 200) {
		throw new Error(`sign-up failed (${res.statusCode}): ${res.body}`);
	}
	const setCookie = res.headers["set-cookie"];
	const cookies = Array.isArray(setCookie)
		? setCookie
		: setCookie
			? [setCookie]
			: [];
	const cookie = cookies.map((c) => c.split(";")[0]).join("; ");
	return { cookie, userId: res.json().user.id };
}
