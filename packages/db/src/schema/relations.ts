import { defineRelations } from "drizzle-orm";
import { account, session, user, verification } from "./auth";
import { businessHours, membership, service } from "./business";
import { tenant } from "./tenant";

// Drizzle 1.0: every relation is declared here. `relations()` no longer exists.
export const relations = defineRelations(
	{
		user,
		session,
		account,
		verification,
		tenant,
		membership,
		businessHours,
		service,
	},
	(r) => ({
		user: {
			sessions: r.many.session(),
			accounts: r.many.account(),
			memberships: r.many.membership(),
		},
		session: {
			user: r.one.user({ from: r.session.userId, to: r.user.id }),
		},
		account: {
			user: r.one.user({ from: r.account.userId, to: r.user.id }),
		},
		tenant: {
			memberships: r.many.membership(),
			businessHours: r.many.businessHours(),
			services: r.many.service(),
		},
		membership: {
			tenant: r.one.tenant({ from: r.membership.tenantId, to: r.tenant.id }),
			user: r.one.user({ from: r.membership.userId, to: r.user.id }),
		},
		businessHours: {
			tenant: r.one.tenant({
				from: r.businessHours.tenantId,
				to: r.tenant.id,
			}),
		},
		service: {
			tenant: r.one.tenant({ from: r.service.tenantId, to: r.tenant.id }),
		},
	}),
);
