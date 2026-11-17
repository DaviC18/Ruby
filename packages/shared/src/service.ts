import { z } from "zod";

const MODALITIES = ["in_person", "online"] as const;

export const serviceInput = z.object({
	name: z.string().trim().min(2).max(80),
	durationMin: z.number().int().min(5).max(480),
	priceBrlCents: z.number().int().min(0).optional(),
	modality: z.enum(MODALITIES),
});

export type ServiceInput = z.infer<typeof serviceInput>;

/** `PATCH /v1/services/:id` body: any subset of the fields; `priceBrlCents: null` clears the price. */
export const servicePatchInput = serviceInput.partial().extend({
	priceBrlCents: z.number().int().min(0).nullable().optional(),
});

export type ServicePatchInput = z.infer<typeof servicePatchInput>;

/** Service as returned by the API (`/v1/services`). */
export const serviceDto = z.object({
	id: z.string(),
	name: z.string(),
	durationMin: z.number().int(),
	priceBrlCents: z.number().int().nullable(),
	modality: z.enum(MODALITIES),
});

export type ServiceDto = z.infer<typeof serviceDto>;
