import { describe, expect, test } from "vitest";
import { PLANS } from "./plans";

describe("PLANS", () => {
	test("free", () => {
		expect(PLANS.free).toMatchObject({
			priceBrlCents: 0,
			attendancesPerMonth: 30,
			broadcastsPerMonth: 0,
		});
	});
	test("pro", () => {
		expect(PLANS.pro).toMatchObject({
			priceBrlCents: 9000,
			attendancesPerMonth: 300,
			broadcastsPerMonth: 500,
		});
	});
	test("business", () => {
		expect(PLANS.business).toMatchObject({
			name: "Empresarial",
			priceBrlCents: 30000,
			attendancesPerMonth: 1500,
			broadcastsPerMonth: 3000,
		});
	});
});
