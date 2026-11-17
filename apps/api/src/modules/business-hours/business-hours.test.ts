import type { Db } from "@ruby/db";
import { tenant, user } from "@ruby/db/schema";
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

async function setup(email: string) {
	const { cookie } = await signUpAndLogin(app, email);
	const t = await createTenantFor(app, cookie, "Salão da Ana");
	return { cookie, tenantId: t.id };
}

function getHours(cookie: string, tenantId: string) {
	return app.inject({
		method: "GET",
		url: "/v1/business-hours",
		headers: { cookie, "x-tenant-id": tenantId },
	});
}

function putHours(cookie: string, tenantId: string, payload: unknown) {
	return app.inject({
		method: "PUT",
		url: "/v1/business-hours",
		headers: { cookie, "x-tenant-id": tenantId },
		payload: payload as object,
	});
}

function issueMessages(body: { issues?: { message: string }[] }): string[] {
	return (body.issues ?? []).map((i) => i.message);
}

describe("business hours", () => {
	it("returns no days for a new tenant", async () => {
		const { cookie, tenantId } = await setup("bh-empty@ruby.dev");
		const res = await getHours(cookie, tenantId);
		expect(res.statusCode).toBe(200);
		expect(res.json()).toEqual({ days: [] });
	});

	it("round-trips PUT then GET, sorted by weekday and open", async () => {
		const { cookie, tenantId } = await setup("bh-rt@ruby.dev");
		const put = await putHours(cookie, tenantId, {
			days: [
				{
					weekday: 3,
					intervals: [
						{ open: "14:00", close: "18:00" },
						{ open: "09:00", close: "12:00" },
					],
				},
				{ weekday: 1, intervals: [{ open: "08:30", close: "17:45" }] },
				{ weekday: 0, intervals: [] },
			],
		});
		expect(put.statusCode).toBe(200);

		const res = await getHours(cookie, tenantId);
		expect(res.statusCode).toBe(200);
		expect(res.json()).toEqual({
			days: [
				{ weekday: 1, intervals: [{ open: "08:30", close: "17:45" }] },
				{
					weekday: 3,
					intervals: [
						{ open: "09:00", close: "12:00" },
						{ open: "14:00", close: "18:00" },
					],
				},
			],
		});
	});

	it("replaces every previous row on PUT", async () => {
		const { cookie, tenantId } = await setup("bh-replace@ruby.dev");
		await putHours(cookie, tenantId, {
			days: [
				{ weekday: 1, intervals: [{ open: "08:00", close: "12:00" }] },
				{ weekday: 2, intervals: [{ open: "08:00", close: "12:00" }] },
			],
		});
		const second = await putHours(cookie, tenantId, {
			days: [{ weekday: 5, intervals: [{ open: "10:00", close: "16:00" }] }],
		});
		expect(second.statusCode).toBe(200);

		const res = await getHours(cookie, tenantId);
		expect(res.json()).toEqual({
			days: [{ weekday: 5, intervals: [{ open: "10:00", close: "16:00" }] }],
		});
	});

	it("rejects close before open with the pt-BR message", async () => {
		const { cookie, tenantId } = await setup("bh-close@ruby.dev");
		const res = await putHours(cookie, tenantId, {
			days: [{ weekday: 1, intervals: [{ open: "18:00", close: "09:00" }] }],
		});
		expect(res.statusCode).toBe(400);
		expect(res.json().error).toBe("validation");
		expect(issueMessages(res.json())).toContain(
			"O horário de fechamento deve ser depois da abertura",
		);
	});

	it("rejects overlapping intervals with the pt-BR message", async () => {
		const { cookie, tenantId } = await setup("bh-overlap@ruby.dev");
		const res = await putHours(cookie, tenantId, {
			days: [
				{
					weekday: 2,
					intervals: [
						{ open: "08:00", close: "12:00" },
						{ open: "11:00", close: "14:00" },
					],
				},
			],
		});
		expect(res.statusCode).toBe(400);
		expect(issueMessages(res.json())).toContain(
			"Os intervalos do mesmo dia não podem se sobrepor",
		);
	});

	it("keeps an invalid PUT from touching existing rows", async () => {
		const { cookie, tenantId } = await setup("bh-keep@ruby.dev");
		const valid = {
			days: [{ weekday: 4, intervals: [{ open: "09:00", close: "17:00" }] }],
		};
		await putHours(cookie, tenantId, valid);
		const invalid = await putHours(cookie, tenantId, {
			days: [{ weekday: 4, intervals: [{ open: "17:00", close: "09:00" }] }],
		});
		expect(invalid.statusCode).toBe(400);
		const res = await getHours(cookie, tenantId);
		expect(res.json()).toEqual(valid);
	});

	it("isolates hours per tenant", async () => {
		const a = await setup("bh-iso-a@ruby.dev");
		const b = await setup("bh-iso-b@ruby.dev");
		const aHours = {
			days: [{ weekday: 1, intervals: [{ open: "09:00", close: "17:00" }] }],
		};
		await putHours(a.cookie, a.tenantId, aHours);
		const res = await getHours(b.cookie, b.tenantId);
		expect(res.json()).toEqual({ days: [] });

		// B's PUT on its own tenant must not touch A's rows.
		const bPut = await putHours(b.cookie, b.tenantId, {
			days: [{ weekday: 6, intervals: [{ open: "10:00", close: "14:00" }] }],
		});
		expect(bPut.statusCode).toBe(200);
		const aAfter = await getHours(a.cookie, a.tenantId);
		expect(aAfter.json()).toEqual(aHours);
	});

	it("requires a session", async () => {
		const res = await app.inject({
			method: "GET",
			url: "/v1/business-hours",
			headers: { "x-tenant-id": "00000000-0000-4000-8000-000000000000" },
		});
		expect(res.statusCode).toBe(401);
	});
});
