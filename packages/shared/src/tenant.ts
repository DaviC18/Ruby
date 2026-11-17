import { z } from "zod";
import type { PlanId } from "./plans";

const timeZones = new Set(Intl.supportedValuesOf("timeZone"));

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export const createTenantInput = z.object({
	name: z.string().trim().min(2).max(80),
	timezone: z
		.string()
		.refine((tz) => timeZones.has(tz), { error: "Fuso horário inválido" })
		.default(DEFAULT_TIMEZONE),
});

export type CreateTenantInput = z.infer<typeof createTenantInput>;

const PLAN_IDS = [
	"free",
	"pro",
	"business",
] as const satisfies readonly PlanId[];

/** Tenant as returned by the API (`POST /v1/tenants`, `GET /v1/tenants`). */
export const tenantDto = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	timezone: z.string(),
	planId: z.enum(PLAN_IDS),
});

export type TenantDto = z.infer<typeof tenantDto>;
