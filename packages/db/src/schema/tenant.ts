import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tenant = pgTable("tenant", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	timezone: text("timezone").notNull().default("America/Sao_Paulo"),
	planId: text("plan_id").notNull().default("free"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export type Tenant = typeof tenant.$inferSelect;
export type NewTenant = typeof tenant.$inferInsert;
