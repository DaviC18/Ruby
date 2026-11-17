import type {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
	RawRequestDefaultExpression,
} from "fastify";
import type { Auth } from "./auth";

export type SessionUser = { id: string; email: string; name: string };
export type RequestSession = { user: SessionUser } | null;

declare module "fastify" {
	interface FastifyRequest {
		session: RequestSession;
	}
	interface FastifyInstance {
		auth: Auth;
	}
}

/** Copies Fastify's raw Node headers into a Web `Headers` object. */
export function toWebHeaders(
	raw: RawRequestDefaultExpression["headers"],
): Headers {
	const headers = new Headers();
	for (const [key, value] of Object.entries(raw)) {
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			for (const v of value) headers.append(key, v);
		} else {
			headers.set(key, value);
		}
	}
	return headers;
}

/**
 * Builds a Web `Request` for Better Auth. Inside the /auth scope every body
 * arrives as the raw Buffer (see registerAuth), so it is forwarded byte for byte.
 */
function toWebRequest(request: FastifyRequest, baseURL: string): Request {
	const body =
		Buffer.isBuffer(request.body) && request.body.length > 0
			? new Uint8Array(request.body)
			: undefined;
	return new Request(new URL(request.url, baseURL), {
		method: request.method,
		headers: toWebHeaders(request.headers),
		body,
	});
}

async function sendWebResponse(
	reply: FastifyReply,
	response: Response,
): Promise<FastifyReply> {
	reply.status(response.status);
	response.headers.forEach((value, key) => {
		if (key !== "set-cookie") reply.header(key, value);
	});
	const cookies = response.headers.getSetCookie();
	if (cookies.length > 0) reply.header("set-cookie", cookies);
	const body = response.body ? Buffer.from(await response.arrayBuffer()) : null;
	return reply.send(body);
}

/**
 * Mounts Better Auth under /auth/* and resolves `request.session` for every
 * other route. The decorators and the onRequest hook live on the root instance
 * so they reach all routes; the /auth/* route sits in its own encapsulated
 * scope so its raw-body parser does not leak to the rest of the API.
 */
export async function registerAuth(
	app: FastifyInstance,
	auth: Auth,
	baseURL: string,
): Promise<void> {
	app.decorate("auth", auth);
	app.decorateRequest("session", null);

	app.addHook("onRequest", async (request, reply) => {
		if (request.url.startsWith("/auth/")) return;
		// returnHeaders: getSession may extend the session (after updateAge) and
		// emit a fresh session cookie; forward it so the browser cookie's
		// lifetime follows the DB expiry.
		const { headers, response } = await auth.api.getSession({
			headers: toWebHeaders(request.headers),
			returnHeaders: true,
		});
		const cookies = headers.getSetCookie();
		if (cookies.length > 0) reply.header("set-cookie", cookies);
		request.session = response
			? {
					user: {
						id: response.user.id,
						email: response.user.email,
						name: response.user.name,
					},
				}
			: null;
	});

	await app.register(async (scope) => {
		// Better Auth parses bodies itself. Taking every content type as a raw
		// Buffer keeps the exact bytes and accepts empty JSON bodies, which
		// Fastify's JSON parser rejects with FST_ERR_CTP_EMPTY_JSON_BODY.
		scope.removeAllContentTypeParsers();
		scope.addContentTypeParser(
			"*",
			{ parseAs: "buffer" },
			(_request, body, done) => done(null, body),
		);
		scope.route({
			method: ["GET", "POST"],
			url: "/auth/*",
			handler: async (request, reply) => {
				const response = await auth.handler(toWebRequest(request, baseURL));
				return sendWebResponse(reply, response);
			},
		});
	});
}

/** preHandler: rejects requests without a valid session with 401 { error: "unauthorized" }. */
export async function requireAuth(
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> {
	if (!request.session) {
		await reply.status(401).send({ error: "unauthorized" });
	}
}
