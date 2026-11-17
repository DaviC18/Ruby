import { z } from "zod";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
	error: "Horário deve estar no formato HH:mm",
});

const interval = z
	.object({ open: time, close: time })
	.refine((i) => i.close > i.open, {
		error: "O horário de fechamento deve ser depois da abertura",
		path: ["close"],
	});

const day = z
	.object({
		weekday: z.number().int().min(0).max(6),
		intervals: z.array(interval),
	})
	.superRefine((d, ctx) => {
		// "HH:mm" strings compare correctly in lexicographic order.
		const sorted = [...d.intervals].sort((a, b) =>
			a.open.localeCompare(b.open),
		);
		for (let i = 1; i < sorted.length; i++) {
			const prev = sorted[i - 1];
			const curr = sorted[i];
			if (prev && curr && curr.open < prev.close) {
				ctx.addIssue({
					code: "custom",
					message: "Os intervalos do mesmo dia não podem se sobrepor",
					path: ["intervals"],
				});
				return;
			}
		}
	});

export const businessHoursInput = z
	.object({ days: z.array(day) })
	.superRefine((bh, ctx) => {
		const seen = new Set<number>();
		bh.days.forEach((d, index) => {
			if (seen.has(d.weekday)) {
				ctx.addIssue({
					code: "custom",
					message: "Dia da semana repetido",
					path: ["days", index, "weekday"],
				});
			}
			seen.add(d.weekday);
		});
	});

export type BusinessHoursInput = z.infer<typeof businessHoursInput>;
