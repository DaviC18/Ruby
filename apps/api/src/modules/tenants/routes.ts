import { createTenantInput, tenantDto } from "@ruby/shared";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../auth/plugin";
import { createTenantWithOwner, listTenantsForUser } from "./repo";

export async function tenantRoutes(app: FastifyInstance): Promise<void> {
	app.post(
		"/v1/tenants",
		{ preHandler: requireAuth },
		async (request, reply) => {
			// requireAuth already answered 401 without a session; this narrows the type.
			if (!request.session)
				return reply.status(401).send({ error: "unauthorized" });
			const input = createTenantInput.parse(request.body);
			const created = await createTenantWithOwner(
				app.db,
				request.session.user.id,
				input,
			);
			return reply.status(201).send(tenantDto.parse(created));
		},
	);

	app.get(
		"/v1/tenants",
		{ preHandler: requireAuth },
		async (request, reply) => {
			if (!request.session)
				return reply.status(401).send({ error: "unauthorized" });
			const rows = await listTenantsForUser(app.db, request.session.user.id);
			return rows.map((row) => tenantDto.parse(row));
		},
	);
}
