import { fileURLToPath } from "node:url";
import { eq, like, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "./client";
import { membership, service, tenant, user } from "./schema";

const TEST_URL =
	process.env.DATABASE_URL_TEST ??
	"postgres://ruby:ruby@localhost:5433/ruby_test";

const db = createDb(TEST_URL);
const SLUG_PREFIX = "schema-test-";

// Deleting the tenants cascades to every business table, so this cleans all rows the test created.
async function cleanup() {
	await db.delete(tenant).where(like(tenant.slug, `${SLUG_PREFIX}%`));
	await db.delete(user).where(like(user.id, `${SLUG_PREFIX}%`));
}

async function insertUser(suffix: string) {
	const [u] = await db
		.insert(user)
		.values({
			id: `${SLUG_PREFIX}${suffix}`,
			name: "Schema Test",
			email: `${SLUG_PREFIX}${suffix}@x.com`,
		})
		.returning();
	if (!u) throw new Error("user not inserted");
	return u;
}

beforeAll(async () => {
	await migrate(db, {
		migrationsFolder: fileURLToPath(new URL("./migrations", import.meta.url)),
	});
	await cleanup();
});

afterAll(async () => {
	await cleanup();
	await db.$client.end();
});

describe("tenant schema", () => {
	it("cascades service deletion when the tenant is deleted", async () => {
		const [t] = await db
			.insert(tenant)
			.values({
				name: "Studio Cascade",
				slug: `${SLUG_PREFIX}cascade`,
				timezone: "America/Sao_Paulo",
			})
			.returning();
		if (!t) throw new Error("tenant not inserted");
		expect(t.planId).toBe("free");

		await db.insert(service).values({
			tenantId: t.id,
			name: "Corte",
			durationMin: 30,
			priceBrlCents: 5000,
			modality: "presencial",
		});
		expect(
			await db.select().from(service).where(eq(service.tenantId, t.id)),
		).toHaveLength(1);

		await db.delete(tenant).where(eq(tenant.id, t.id));

		expect(
			await db.select().from(service).where(eq(service.tenantId, t.id)),
		).toHaveLength(0);
	});

	it("rejects duplicate membership for the same tenant and user", async () => {
		const [t] = await db
			.insert(tenant)
			.values({
				name: "Studio Membership",
				slug: `${SLUG_PREFIX}membership`,
				timezone: "America/Sao_Paulo",
			})
			.returning();
		if (!t) throw new Error("tenant not inserted");

		const u = await insertUser("dup");
		await db.insert(membership).values({ tenantId: t.id, userId: u.id });

		await expect(
			db.insert(membership).values({ tenantId: t.id, userId: u.id }),
		).rejects.toMatchObject({ cause: { code: "23505" } });
	});

	it("rejects a membership for a user that does not exist", async () => {
		const [t] = await db
			.insert(tenant)
			.values({ name: "Studio FK", slug: `${SLUG_PREFIX}fk` })
			.returning();
		if (!t) throw new Error("tenant not inserted");

		await expect(
			db.insert(membership).values({ tenantId: t.id, userId: "ghost-user" }),
		).rejects.toMatchObject({ cause: { code: "23503" } });
	});

	it("cascades membership deletion when the user is deleted", async () => {
		const [t] = await db
			.insert(tenant)
			.values({
				name: "Studio User Cascade",
				slug: `${SLUG_PREFIX}user-cascade`,
			})
			.returning();
		if (!t) throw new Error("tenant not inserted");
		const u = await insertUser("cascade");
		await db.insert(membership).values({ tenantId: t.id, userId: u.id });

		await db.delete(user).where(eq(user.id, u.id));

		expect(
			await db.select().from(membership).where(eq(membership.tenantId, t.id)),
		).toHaveLength(0);
	});

	it("defaults tenant.timezone to America/Sao_Paulo in the database", async () => {
		const rows = await db.execute<{ timezone: string }>(
			sql`insert into tenant (name, slug) values ('Studio TZ', ${`${SLUG_PREFIX}tz`}) returning timezone`,
		);
		expect(rows[0]?.timezone).toBe("America/Sao_Paulo");
	});
});
