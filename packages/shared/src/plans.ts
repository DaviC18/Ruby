export type PlanId = "free" | "pro" | "business";

export type Plan = {
	name: string;
	priceBrlCents: number;
	attendancesPerMonth: number;
	broadcastsPerMonth: number;
};

export const PLANS: Record<PlanId, Plan> = {
	free: {
		name: "Free",
		priceBrlCents: 0,
		attendancesPerMonth: 30,
		broadcastsPerMonth: 0,
	},
	pro: {
		name: "Pro",
		priceBrlCents: 9000,
		attendancesPerMonth: 300,
		broadcastsPerMonth: 500,
	},
	business: {
		name: "Empresarial",
		priceBrlCents: 30000,
		attendancesPerMonth: 1500,
		broadcastsPerMonth: 3000,
	},
};
