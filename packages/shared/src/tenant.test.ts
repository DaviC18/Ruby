import { describe, expect, test } from "vitest";
import { createTenantInput } from "./tenant";

describe("createTenantInput", () => {
	test("timezone inválido", () =>
		expect(
			createTenantInput.safeParse({
				name: "Barbearia X",
				timezone: "Mars/Base",
			}).success,
		).toBe(false));

	test("timezone default", () =>
		expect(createTenantInput.parse({ name: "Barbearia X" }).timezone).toBe(
			"America/Sao_Paulo",
		));
});
