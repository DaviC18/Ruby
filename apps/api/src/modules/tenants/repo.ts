import { randomBytes } from "node:crypto";
import type { Db } from "@ruby/db";
import { membership, tenant } from "@ruby/db/schema";
import type { CreateTenantInput, PlanId } from "@ruby/shared";
import { and, asc, eq } from "drizzle-orm";

// Tenant rows are the root of the tenant scope, so these functions are keyed by
// user (creation/listing) or by (tenantId, userId) for membership checks.

const SLUG_FALLBACK = "negocio";
const SLUG_ATTEMPTS = 5;

const tenantColumns = {
	id: tenant.id,
	name: tenant.name,
	slug: tenant.slug,
	timezone: tenant.timezone,
	planId: tenant.planId,
};

/** Kebab-case ASCII slug: "Salão da Ana" -> "salao-da-ana". */
export function slugify(name: string): string {
	const slug = name
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60)
		.replace(/-+$/, "");
	return slug || SLUG_FALLBACK;
}

function slugSuffix(): string {
	// 6 hex chars; a collision is retried with a new suffix.
	return randomBytes(4).toString("hex").slice(0, 6);
}

/**
 * Creates the tenant and the creator's owner membership in one transaction.
 * The slug is the kebab name; when the unique slug is taken, a short random
 * suffix is appended. ON CONFLICT DO NOTHING keeps the transaction usable on a
 * collision (a raised unique violation would abort it), so concurrent creators
 * of the same name just retry with another suffix.
 */
export async function createTenantWithOwner(
	db: Db,
	userId: string,
	input: CreateTenantInput,
) {
	const base = slugify(input.name);
	return db.transaction(async (tx) => {
		for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt++) {
			const slug = attempt === 0 ? base : `${base}-${slugSuffix()}`;
			const [created] = await tx
				.insert(tenant)
				.values({ name: input.name, slug, timezone: input.timezone })
				.onConflictDoNothing({ target: tenant.slug })
				.returning(tenantColumns);
			if (!created) continue;
			await tx
				.insert(membership)
				.values({ tenantId: created.id, userId, role: "owner" });
			return created;
		}
		throw new Error(`could not allocate a unique slug for "${base}"`);
	});
}

/** Tenants the user is a member of, ordered by name. */
export function listTenantsForUser(db: Db, userId: string) {
	return db
		.select(tenantColumns)
		.from(membership)
		.innerJoin(tenant, eq(tenant.id, membership.tenantId))
		.where(eq(membership.userId, userId))
		.orderBy(asc(tenant.name));
}

/** The tenant context for `userId` inside `tenantId`, or null when the user is not a member. */
export async function findMemberTenant(
	db: Db,
	tenantId: string,
	userId: string,
): Promise<{ id: string; timezone: string; planId: PlanId } | null> {
	const [row] = await db
		.select({
			id: tenant.id,
			timezone: tenant.timezone,
			planId: tenant.planId,
		})
		.from(membership)
		.innerJoin(tenant, eq(tenant.id, membership.tenantId))
		.where(
			and(eq(membership.tenantId, tenantId), eq(membership.userId, userId)),
		)
		.limit(1);
	return row ? { ...row, planId: row.planId as PlanId } : null;
}
