import { createDb } from "@ruby/db";
import { buildApp } from "./app";
import { loadEnv } from "./env";

const env = loadEnv();
const db = createDb(env.DATABASE_URL);
const app = await buildApp({ db, env });

app.addHook("onClose", async () => {
	await db.$client.end();
});

// The listen port comes from API_URL so web and API agree on one value.
const port = Number(new URL(env.API_URL).port) || 3333;

for (const signal of ["SIGINT", "SIGTERM"] as const) {
	process.once(signal, () => {
		void app.close().then(() => process.exit(0));
	});
}

try {
	await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
	app.log.error(err);
	process.exit(1);
}
