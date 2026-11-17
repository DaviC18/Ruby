import type { Db } from "@ruby/db";
import { tenant, user } from "@ruby/db/schema";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTenantFor, signUpAndLogin, testApp } from "../test/helpers";

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

function getServices(cookie: string, tenantId?: string) {
	return app.inject({
		method: "GET",
		url: "/v1/services",
		headers: tenantId ? { cookie, "x-tenant-id": tenantId } : { cookie },
	});
}

describe("tenancy isolation", () => {
	it("returns 404 when a user targets another user's tenant", async () => {
		const a = await signUpAndLogin(app, "iso-a@ruby.dev");
		const b = await signUpAndLogin(app, "iso-b@ruby.dev");
		const ta = await createTenantFor(app, a.cookie, "Tenant A");
		const tb = await createTenantFor(app, b.cookie, "Tenant B");

		const bOnA = await getServices(b.cookie, ta.id);
		expect(bOnA.statusCode).toBe(404);
		expect(bOnA.json()).toEqual({ error: "not_found" });

		const aOnB = await getServices(a.cookie, tb.id);
		expect(aOnB.statusCode).toBe(404);
		expect(aOnB.json()).toEqual({ error: "not_found" });
	});

	it("lets a member reach their own tenant", async () => {
		const a = await signUpAndLogin(app, "own@ruby.dev");
		const ta = await createTenantFor(app, a.cookie, "Tenant Próprio");
		const res = await getServices(a.cookie, ta.id);
		expect(res.statusCode).toBe(200);
	});

	it("returns 400 tenant_required without the x-tenant-id header", async () => {
		const a = await signUpAndLogin(app, "nohdr@ruby.dev");
		const res = await getServices(a.cookie);
		expect(res.statusCode).toBe(400);
		expect(res.json()).toEqual({ error: "tenant_required" });
	});

	it("treats a malformed tenant id as not found", async () => {
		const a = await signUpAndLogin(app, "bad-id@ruby.dev");
		const res = await getServices(a.cookie, "not-a-uuid");
		expect(res.statusCode).toBe(404);
		expect(res.json()).toEqual({ error: "not_found" });
	});

	it("returns 404 for an unknown tenant id", async () => {
		const a = await signUpAndLogin(app, "unknown@ruby.dev");
		const res = await getServices(
			a.cookie,
			"00000000-0000-4000-8000-000000000000",
		);
		expect(res.statusCode).toBe(404);
		expect(res.json()).toEqual({ error: "not_found" });
	});

	it("still requires a session before the tenant check", async () => {
		const res = await app.inject({
			method: "GET",
			url: "/v1/services",
			headers: { "x-tenant-id": "00000000-0000-4000-8000-000000000000" },
		});
		expect(res.statusCode).toBe(401);
		expect(res.json()).toEqual({ error: "unauthorized" });
	});
});
