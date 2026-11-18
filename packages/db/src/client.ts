import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./schema/relations";

export function createDb(url: string) {
	return drizzle({ client: postgres(url), relations });
}

export type Db = ReturnType<typeof createDb>;
