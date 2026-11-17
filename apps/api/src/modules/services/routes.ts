import { serviceDto, serviceInput, servicePatchInput } from "@ruby/shared";
import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../auth/plugin";
import { requireTenant, UUID_RE } from "../../tenancy/plugin";
import {
	createService,
	deactivateService,
	listActiveServices,
	updateService,
} from "./repo";

type IdParams = { Params: { id: string } };

export async function serviceRoutes(app: FastifyInstance): Promise<void> {
	const preHandler = [requireAuth, requireTenant];

	app.get("/v1/services", { preHandler }, async (request, reply) => {
		// requireTenant already answered without a tenant; this narrows the type.
		if (!request.tenant) return reply.status(404).send({ error: "not_found" });
		const rows = await listActiveServices(app.db, request.tenant.id);
		return rows.map((row) => serviceDto.parse(row));
	});

	app.post("/v1/services", { preHandler }, async (request, reply) => {
		if (!request.tenant) return reply.status(404).send({ error: "not_found" });
		const input = serviceInput.parse(request.body);
		const created = await createService(app.db, request.tenant.id, input);
		return reply.status(201).send(serviceDto.parse(created));
	});

	app.patch<IdParams>(
		"/v1/services/:id",
		{ preHandler },
		async (request, reply) => {
			if (!request.tenant)
				return reply.status(404).send({ error: "not_found" });
			const patch = servicePatchInput.parse(request.body ?? {});
			// A non-UUID id cannot match a row; checking here avoids a Postgres 500.
			const updated = UUID_RE.test(request.params.id)
				? await updateService(
						app.db,
						request.tenant.id,
						request.params.id,
						patch,
					)
				: null;
			if (!updated) return reply.status(404).send({ error: "not_found" });
			return serviceDto.parse(updated);
		},
	);

	app.delete<IdParams>(
		"/v1/services/:id",
		{ preHandler },
		async (request, reply) => {
			if (!request.tenant)
				return reply.status(404).send({ error: "not_found" });
			const removed =
				UUID_RE.test(request.params.id) &&
				(await deactivateService(app.db, request.tenant.id, request.params.id));
			if (!removed) return reply.status(404).send({ error: "not_found" });
			return reply.status(204).send();
		},
	);
}
