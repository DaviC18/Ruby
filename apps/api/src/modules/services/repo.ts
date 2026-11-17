import type { Db } from "@ruby/db";
import { service } from "@ruby/db/schema";
import type { ServiceInput, ServicePatchInput } from "@ruby/shared";
import { and, asc, eq } from "drizzle-orm";

const serviceColumns = {
	id: service.id,
	name: service.name,
	durationMin: service.durationMin,
	priceBrlCents: service.priceBrlCents,
	modality: service.modality,
};

/** Active services of the tenant, ordered by name. */
export function listActiveServices(db: Db, tenantId: string) {
	return db
		.select(serviceColumns)
		.from(service)
		.where(and(eq(service.tenantId, tenantId), eq(service.active, true)))
		.orderBy(asc(service.name));
}

export async function createService(
	db: Db,
	tenantId: string,
	input: ServiceInput,
) {
	const [created] = await db
		.insert(service)
		.values({
			tenantId,
			name: input.name,
			durationMin: input.durationMin,
			priceBrlCents: input.priceBrlCents ?? null,
			modality: input.modality,
		})
		.returning(serviceColumns);
	if (!created) throw new Error("service insert returned no row");
	return created;
}

function activeServiceOf(tenantId: string, id: string) {
	return and(
		eq(service.tenantId, tenantId),
		eq(service.id, id),
		eq(service.active, true),
	);
}

/** Updates an active service of the tenant; null when it does not exist there. */
export async function updateService(
	db: Db,
	tenantId: string,
	id: string,
	patch: ServicePatchInput,
) {
	const values = Object.fromEntries(
		Object.entries(patch).filter(([, v]) => v !== undefined),
	) as ServicePatchInput;
	if (Object.keys(values).length === 0) {
		const [row] = await db
			.select(serviceColumns)
			.from(service)
			.where(activeServiceOf(tenantId, id))
			.limit(1);
		return row ?? null;
	}
	const [row] = await db
		.update(service)
		.set(values)
		.where(activeServiceOf(tenantId, id))
		.returning(serviceColumns);
	return row ?? null;
}

/** Soft delete (`active = false`); false when no active service matched. */
export async function deactivateService(
	db: Db,
	tenantId: string,
	id: string,
): Promise<boolean> {
	const rows = await db
		.update(service)
		.set({ active: false })
		.where(activeServiceOf(tenantId, id))
		.returning({ id: service.id });
	return rows.length > 0;
}
