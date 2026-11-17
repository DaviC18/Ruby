import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { Db } from "@ruby/db";
import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { createAuth } from "./auth/auth";
import { registerAuth, requireAuth } from "./auth/plugin";
import type { Env } from "./env";
import { tenantRoutes } from "./modules/tenants/routes";
import { registerTenancy, requireTenant } from "./tenancy/plugin";

declare module "fastify" {
	interface FastifyInstance {
		db: Db;
	}
}

export type AppDeps = { db: Db; env: Env };

export async function buildApp({ db, env }: AppDeps): Promise<FastifyInstance> {
	const app = Fastify({
		logger: env.NODE_ENV === "test" ? false : { level: "info" },
	});

	await app.register(helmet);
	await app.register(cors, { origin: env.WEB_URL, credentials: true });
	await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

	app.setErrorHandler((error, _request, reply) => {
		if (error instanceof ZodError) {
			return reply
				.status(400)
				.send({ error: "validation", issues: error.issues });
		}
		return reply.send(error);
	});

	app.decorate("db", db);
	await registerAuth(app, createAuth(db, env), env.API_URL);

	app.get("/health", async () => ({ status: "ok" }));

	app.get("/v1/me", { preHandler: requireAuth }, async (request, reply) => {
		// requireAuth already answered 401 without a session; this narrows the type.
		if (!request.session)
			return reply.status(401).send({ error: "unauthorized" });
		const { id, email, name } = request.session.user;
		return { id, email, name };
	});

	registerTenancy(app);
	await app.register(tenantRoutes);

	// Stub until Task 7 implements the services module; it exists so the
	// tenancy isolation test runs through requireAuth + requireTenant.
	app.get(
		"/v1/services",
		{ preHandler: [requireAuth, requireTenant] },
		async () => [],
	);

	return app;
}
