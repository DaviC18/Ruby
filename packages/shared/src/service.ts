import { z } from "zod";

export const serviceInput = z.object({
	name: z.string().trim().min(2).max(80),
	durationMin: z.number().int().min(5).max(480),
	priceBrlCents: z.number().int().min(0).optional(),
	modality: z.enum(["in_person", "online"]),
});

export type ServiceInput = z.infer<typeof serviceInput>;
