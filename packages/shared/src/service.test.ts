import { describe, expect, test } from "vitest";
import { serviceDto, servicePatchInput } from "./service";

describe("servicePatchInput", () => {
	test("aceita corpo vazio", () =>
		expect(servicePatchInput.parse({})).toEqual({}));

	test("aceita priceBrlCents null para limpar o preço", () =>
		expect(servicePatchInput.parse({ priceBrlCents: null })).toEqual({
			priceBrlCents: null,
		}));

	test("valida campos presentes", () =>
		expect(servicePatchInput.safeParse({ durationMin: 2 }).success).toBe(
			false,
		));
});

describe("serviceDto", () => {
	test("priceBrlCents aceita null", () =>
		expect(
			serviceDto.parse({
				id: "x",
				name: "Corte",
				durationMin: 30,
				priceBrlCents: null,
				modality: "online",
			}).priceBrlCents,
		).toBeNull());

	test("remove campos extras", () =>
		expect(
			serviceDto.parse({
				id: "x",
				name: "Corte",
				durationMin: 30,
				priceBrlCents: 100,
				modality: "in_person",
				tenantId: "t",
				active: true,
			}),
		).toEqual({
			id: "x",
			name: "Corte",
			durationMin: 30,
			priceBrlCents: 100,
			modality: "in_person",
		}));
});
