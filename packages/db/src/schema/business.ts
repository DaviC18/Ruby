import {
	boolean,
	index,
	integer,
	pgTable,
	smallint,
	text,
	time,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { tenant } from "./tenant";

export const membership = pgTable(
	"membership",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		tenantId: uuid("tenant_id")
			.notNull()
			.references(() => tenant.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull().default("owner"),
	},
	(t) => [
		unique("membership_tenant_id_user_id_unique").on(t.tenantId, t.userId),
		index("membership_tenant_id_idx").on(t.tenantId),
		index("membership_user_id_idx").on(t.userId),
	],
);

export const businessHours = pgTable(
	"business_hours",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		tenantId: uuid("tenant_id")
			.notNull()
			.references(() => tenant.id, { onDelete: "cascade" }),
		weekday: smallint("weekday").notNull(),
		open: time("open").notNull(),
		close: time("close").notNull(),
	},
	(t) => [index("business_hours_tenant_id_idx").on(t.tenantId)],
);

export const service = pgTable(
	"service",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		tenantId: uuid("tenant_id")
			.notNull()
			.references(() => tenant.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		durationMin: integer("duration_min").notNull(),
		priceBrlCents: integer("price_brl_cents"),
		modality: text("modality").notNull(),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => [index("service_tenant_id_idx").on(t.tenantId)],
);

export type Membership = typeof membership.$inferSelect;
export type NewMembership = typeof membership.$inferInsert;
export type BusinessHours = typeof businessHours.$inferSelect;
export type NewBusinessHours = typeof businessHours.$inferInsert;
export type Service = typeof service.$inferSelect;
export type NewService = typeof service.$inferInsert;
