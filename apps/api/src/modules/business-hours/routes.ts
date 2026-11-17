import { businessHoursInput } from "@ruby/shared";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../auth/plugin";
import { requireTenant } from "../../tenancy/plugin";
import { getBusinessHours, replaceBusinessHours } from "./repo";

export async function businessHoursRoutes(app: FastifyInstance): Promise<void> {
	const preHandler = [requireAuth, requireTenant];

	app.get("/v1/business-hours", { preHandler }, async (request, reply) => {
		// requireTenant already answered without a tenant; this narrows the type.
		if (!request.tenant) return reply.status(404).send({ error: "not_found" });
		return getBusinessHours(app.db, request.tenant.id);
	});

	app.put("/v1/business-hours", { preHandler }, async (request, reply) => {
		if (!request.tenant) return reply.status(404).send({ error: "not_found" });
		const input = businessHoursInput.parse(request.body);
		await replaceBusinessHours(app.db, request.tenant.id, input);
		return getBusinessHours(app.db, request.tenant.id);
	});
}
