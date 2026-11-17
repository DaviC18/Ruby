import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		// Every test file truncates/deletes rows in the shared ruby_test database,
		// so files must not run concurrently.
		fileParallelism: false,
	},
});
