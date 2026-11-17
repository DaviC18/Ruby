import type { Db } from "@ruby/db";
import { service, tenant, user } from "@ruby/db/schema";
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

type Ctx = { cookie: string; tenantId: string };

async function setup(email: string): Promise<Ctx> {
	const { cookie } = await signUpAndLogin(app, email);
	const t = await createTenantFor(app, cookie, "Salão da Ana");
	return { cookie, tenantId: t.id };
}

function call(
	ctx: Ctx,
	method: "GET" | "POST" | "PATCH" | "DELETE",
	url: string,
	payload?: object,
) {
	return app.inject({
		method,
		url,
		headers: { cookie: ctx.cookie, "x-tenant-id": ctx.tenantId },
		...(payload ? { payload } : {}),
	});
}

const corte = {
	name: "Corte",
	durationMin: 30,
	priceBrlCents: 5000,
	modality: "in_person",
} as const;

async function create(ctx: Ctx, input: object = corte) {
	const res = await call(ctx, "POST", "/v1/services", input);
	expect(res.statusCode).toBe(201);
	return res.json() as { id: string };
}

describe("services", () => {
	it("creates a service and returns the dto", async () => {
		const ctx = await setup("svc-create@ruby.dev");
		const res = await call(ctx, "POST", "/v1/services", corte);
		expect(res.statusCode).toBe(201);
		const body = res.json();
		expect(body).toEqual({ id: expect.any(String), ...corte });
		expect(Object.keys(body).sort()).toEqual(
			["durationMin", "id", "modality", "name", "priceBrlCents"].sort(),
		);
	});

	it("returns priceBrlCents null when no price is given", async () => {
		const ctx = await setup("svc-noprice@ruby.dev");
		const res = await call(ctx, "POST", "/v1/services", {
			name: "Consulta",
			durationMin: 60,
			modality: "online",
		});
		expect(res.statusCode).toBe(201);
		expect(res.json().priceBrlCents).toBeNull();
	});

	it("rejects an invalid body with 400 validation", async () => {
		const ctx = await setup("svc-invalid@ruby.dev");
		const res = await call(ctx, "POST", "/v1/services", {
			name: "C",
			durationMin: 1,
			modality: "x",
		});
		expect(res.statusCode).toBe(400);
		expect(res.json().error).toBe("validation");
	});

	it("lists only active services, ordered by name", async () => {
		const ctx = await setup("svc-list@ruby.dev");
		await create(ctx, { ...corte, name: "Escova" });
		const removed = await create(ctx, { ...corte, name: "Barba" });
		await create(ctx, { ...corte, name: "Alisamento" });
		await call(ctx, "DELETE", `/v1/services/${removed.id}`);

		const res = await call(ctx, "GET", "/v1/services");
		expect(res.statusCode).toBe(200);
		expect(res.json().map((s: { name: string }) => s.name)).toEqual([
			"Alisamento",
			"Escova",
		]);
	});

	it("patches a service partially", async () => {
		const ctx = await setup("svc-patch@ruby.dev");
		const created = await create(ctx);
		const res = await call(ctx, "PATCH", `/v1/services/${created.id}`, {
			durationMin: 45,
		});
		expect(res.statusCode).toBe(200);
		expect(res.json()).toEqual({ id: created.id, ...corte, durationMin: 45 });
	});

	it("clears the price when PATCH sends priceBrlCents null", async () => {
		const ctx = await setup("svc-clear@ruby.dev");
		const created = await create(ctx);
		const res = await call(ctx, "PATCH", `/v1/services/${created.id}`, {
			priceBrlCents: null,
		});
		expect(res.statusCode).toBe(200);
		expect(res.json().priceBrlCents).toBeNull();
	});

	it("rejects an invalid PATCH body with 400", async () => {
		const ctx = await setup("svc-patch-bad@ruby.dev");
		const created = await create(ctx);
		const res = await call(ctx, "PATCH", `/v1/services/${created.id}`, {
			durationMin: 2,
		});
		expect(res.statusCode).toBe(400);
		expect(res.json().error).toBe("validation");
	});

	it("soft-deletes: 204, row kept inactive, gone from the list", async () => {
		const ctx = await setup("svc-delete@ruby.dev");
		const created = await create(ctx);
		const res = await call(ctx, "DELETE", `/v1/services/${created.id}`);
		expect(res.statusCode).toBe(204);
		expect(res.body).toBe("");

		const [row] = await db
			.select({ active: service.active })
			.from(service)
			.where(eq(service.id, created.id));
		expect(row?.active).toBe(false);

		const list = await call(ctx, "GET", "/v1/services");
		expect(list.json()).toEqual([]);
	});

	it("returns 404 for PATCH/DELETE on an inactive service", async () => {
		const ctx = await setup("svc-inactive@ruby.dev");
		const created = await create(ctx);
		await call(ctx, "DELETE", `/v1/services/${created.id}`);

		const patch = await call(ctx, "PATCH", `/v1/services/${created.id}`, {
			name: "Novo nome",
		});
		expect(patch.statusCode).toBe(404);
		expect(patch.json()).toEqual({ error: "not_found" });

		const del = await call(ctx, "DELETE", `/v1/services/${created.id}`);
		expect(del.statusCode).toBe(404);
		expect(del.json()).toEqual({ error: "not_found" });
	});

	it("returns 404 for an unknown or malformed id", async () => {
		const ctx = await setup("svc-unknown@ruby.dev");
		for (const id of ["00000000-0000-4000-8000-000000000000", "not-a-uuid"]) {
			const patch = await call(ctx, "PATCH", `/v1/services/${id}`, {
				name: "Novo nome",
			});
			expect(patch.statusCode).toBe(404);
			expect(patch.json()).toEqual({ error: "not_found" });
			const del = await call(ctx, "DELETE", `/v1/services/${id}`);
			expect(del.statusCode).toBe(404);
			expect(del.json()).toEqual({ error: "not_found" });
		}
	});

	it("isolates tenants: PATCH/DELETE on another tenant's service is 404", async () => {
		const a = await setup("svc-iso-a@ruby.dev");
		const b = await setup("svc-iso-b@ruby.dev");
		const created = await create(a);

		const patch = await call(b, "PATCH", `/v1/services/${created.id}`, {
			name: "Invadido",
		});
		expect(patch.statusCode).toBe(404);
		expect(patch.json()).toEqual({ error: "not_found" });

		const del = await call(b, "DELETE", `/v1/services/${created.id}`);
		expect(del.statusCode).toBe(404);

		const listB = await call(b, "GET", "/v1/services");
		expect(listB.json()).toEqual([]);

		const listA = await call(a, "GET", "/v1/services");
		expect(listA.json()).toEqual([{ id: created.id, ...corte }]);
	});
});
