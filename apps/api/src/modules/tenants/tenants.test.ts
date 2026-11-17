import type { Db } from "@ruby/db";
import { membership, tenant, user } from "@ruby/db/schema";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTenantFor, signUpAndLogin, testApp } from "../../test/helpers";

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
	await db.delete(tenant);
	await db.delete(user);
});

describe("POST /v1/tenants", () => {
	it("requires a session", async () => {
		const res = await app.inject({
			method: "POST",
			url: "/v1/tenants",
			payload: { name: "Salão da Ana" },
		});
		expect(res.statusCode).toBe(401);
		expect(res.json()).toEqual({ error: "unauthorized" });
	});

	it("creates the tenant and an owner membership", async () => {
		const { cookie, userId } = await signUpAndLogin(app, "ana@ruby.dev");
		const res = await app.inject({
			method: "POST",
			url: "/v1/tenants",
			headers: { cookie },
			payload: { name: "Salão da Ana" },
		});

		expect(res.statusCode).toBe(201);
		const body = res.json();
		expect(body).toEqual({
			id: expect.any(String),
			name: "Salão da Ana",
			slug: "salao-da-ana",
			timezone: "America/Sao_Paulo",
			planId: "free",
		});

		const rows = await db
			.select()
			.from(membership)
			.where(eq(membership.tenantId, body.id));
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({ userId, role: "owner" });
	});

	it("keeps the requested timezone", async () => {
		const { cookie } = await signUpAndLogin(app, "tz@ruby.dev");
		const res = await app.inject({
			method: "POST",
			url: "/v1/tenants",
			headers: { cookie },
			payload: { name: "Barbearia Norte", timezone: "America/Manaus" },
		});
		expect(res.statusCode).toBe(201);
		expect(res.json().timezone).toBe("America/Manaus");
	});

	it("gives two tenants with the same name different slugs", async () => {
		const a = await signUpAndLogin(app, "a@ruby.dev");
		const b = await signUpAndLogin(app, "b@ruby.dev");
		const first = await createTenantFor(app, a.cookie, "Salão da Ana");
		const second = await createTenantFor(app, b.cookie, "Salão da Ana");

		expect(first.slug).toBe("salao-da-ana");
		expect(second.slug).toMatch(/^salao-da-ana-[a-z0-9]+$/);
		expect(second.slug).not.toBe(first.slug);
	});

	it("rejects an invalid body with 400", async () => {
		const { cookie } = await signUpAndLogin(app, "bad@ruby.dev");
		const res = await app.inject({
			method: "POST",
			url: "/v1/tenants",
			headers: { cookie },
			payload: { name: "A", timezone: "Mars/Olympus" },
		});
		expect(res.statusCode).toBe(400);
		expect(res.json().error).toBe("validation");
	});
});

describe("GET /v1/tenants", () => {
	it("lists only the tenants the user belongs to", async () => {
		const a = await signUpAndLogin(app, "list-a@ruby.dev");
		const b = await signUpAndLogin(app, "list-b@ruby.dev");
		const ta1 = await createTenantFor(app, a.cookie, "Studio Um");
		const ta2 = await createTenantFor(app, a.cookie, "Studio Dois");
		await createTenantFor(app, b.cookie, "Studio Três");

		const res = await app.inject({
			method: "GET",
			url: "/v1/tenants",
			headers: { cookie: a.cookie },
		});
		expect(res.statusCode).toBe(200);
		const ids = res.json().map((t: { id: string }) => t.id);
		expect(ids.sort()).toEqual([ta1.id, ta2.id].sort());
	});

	it("requires a session", async () => {
		const res = await app.inject({ method: "GET", url: "/v1/tenants" });
		expect(res.statusCode).toBe(401);
	});
});
