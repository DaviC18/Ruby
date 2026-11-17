import { describe, expect, test } from "vitest";
import { businessHoursInput } from "./business-hours";

describe("businessHoursInput", () => {
	test("rejeita fechamento antes da abertura", () => {
		const r = businessHoursInput.safeParse({
			days: [{ weekday: 1, intervals: [{ open: "18:00", close: "09:00" }] }],
		});
		expect(r.success).toBe(false);
		expect(r.error?.issues[0]?.message).toBe(
			"O horário de fechamento deve ser depois da abertura",
		);
	});

	test("rejeita intervalos sobrepostos", () => {
		const r = businessHoursInput.safeParse({
			days: [
				{
					weekday: 1,
					intervals: [
						{ open: "09:00", close: "12:00" },
						{ open: "11:00", close: "14:00" },
					],
				},
			],
		});
		expect(r.success).toBe(false);
		expect(r.error?.issues[0]?.message).toBe(
			"Os intervalos do mesmo dia não podem se sobrepor",
		);
	});

	test("aceita dia com almoço", () => {
		expect(
			businessHoursInput.safeParse({
				days: [
					{
						weekday: 1,
						intervals: [
							{ open: "09:00", close: "12:00" },
							{ open: "13:00", close: "18:00" },
						],
					},
				],
			}).success,
		).toBe(true);
	});

	test("rejeita weekday duplicado", () => {
		const r = businessHoursInput.safeParse({
			days: [
				{ weekday: 1, intervals: [{ open: "09:00", close: "12:00" }] },
				{ weekday: 1, intervals: [{ open: "13:00", close: "18:00" }] },
			],
		});
		expect(r.success).toBe(false);
		expect(r.error?.issues[0]?.message).toBe("Dia da semana repetido");
	});
});
