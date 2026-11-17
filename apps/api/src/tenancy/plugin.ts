import type { PlanId } from "@ruby/shared";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { findMemberTenant } from "../modules/tenants/repo";

export type RequestTenant = { id: string; timezone: string; planId: PlanId };

declare module "fastify" {
	interface FastifyRequest {
		tenant: RequestTenant | null;
	}
}

export const TENANT_HEADER = "x-tenant-id";

// Canonical UUID text form. Anything else cannot be a tenant id, and passing it
// to Postgres would raise "invalid input syntax for type uuid" (a 500).
const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Decorates every request with `tenant: null`; `requireTenant` fills it. */
export function registerTenancy(app: FastifyInstance): void {
	app.decorateRequest("tenant", null);
}

/**
 * preHandler, used after `requireAuth`: resolves `request.tenant` from the
 * `x-tenant-id` header. Missing header -> 400 { error: "tenant_required" };
 * malformed id, unknown tenant or no membership -> 404 { error: "not_found" },
 * so a tenant's existence never leaks to non-members.
 */
export async function requireTenant(
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> {
	if (reply.sent) return;
	if (!request.session) {
		await reply.status(401).send({ error: "unauthorized" });
		return;
	}
	const header = request.headers[TENANT_HEADER];
	if (typeof header !== "string" || header.length === 0) {
		await reply.status(400).send({ error: "tenant_required" });
		return;
	}
	const found = UUID_RE.test(header)
		? await findMemberTenant(request.server.db, header, request.session.user.id)
		: null;
	if (!found) {
		await reply.status(404).send({ error: "not_found" });
		return;
	}
	request.tenant = found;
}
