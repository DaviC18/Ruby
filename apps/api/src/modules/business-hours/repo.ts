import type { Db } from "@ruby/db";
import { businessHours, tenant } from "@ruby/db/schema";
import type { BusinessHoursInput } from "@ruby/shared";
import { asc, eq } from "drizzle-orm";

/** Postgres `time` comes back as "HH:mm:ss"; the API speaks "HH:mm". */
function toHHmm(value: string): string {
	return value.slice(0, 5);
}

/** The tenant's hours as `{ days }`: only weekdays with intervals, sorted by weekday then open. */
export async function getBusinessHours(
	db: Db,
	tenantId: string,
): Promise<BusinessHoursInput> {
	const rows = await db
		.select({
			weekday: businessHours.weekday,
			open: businessHours.open,
			close: businessHours.close,
		})
		.from(businessHours)
		.where(eq(businessHours.tenantId, tenantId))
		.orderBy(asc(businessHours.weekday), asc(businessHours.open));

	const days: BusinessHoursInput["days"] = [];
	for (const row of rows) {
		let day = days[days.length - 1];
		if (!day || day.weekday !== row.weekday) {
			day = { weekday: row.weekday, intervals: [] };
			days.push(day);
		}
		day.intervals.push({ open: toHHmm(row.open), close: toHHmm(row.close) });
	}
	return { days };
}

/** Replaces all of the tenant's hours in one transaction (delete + insert). */
export async function replaceBusinessHours(
	db: Db,
	tenantId: string,
	input: BusinessHoursInput,
): Promise<void> {
	const rows = input.days.flatMap((d) =>
		d.intervals.map((i) => ({
			tenantId,
			weekday: d.weekday,
			open: i.open,
			close: i.close,
		})),
	);
	await db.transaction(async (tx) => {
		// Lock the tenant row so concurrent PUTs serialize; otherwise each
		// delete misses the other's uncommitted inserts and both sets survive.
		await tx
			.select({ id: tenant.id })
			.from(tenant)
			.where(eq(tenant.id, tenantId))
			.for("update");
		await tx.delete(businessHours).where(eq(businessHours.tenantId, tenantId));
		if (rows.length > 0) await tx.insert(businessHours).values(rows);
	});
}
