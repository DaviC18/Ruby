import { z } from "zod";

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
