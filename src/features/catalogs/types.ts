import type { InferSelectModel } from "drizzle-orm";
import type { catalogItems } from "@/db/schema";

export type CatalogItem = InferSelectModel<typeof catalogItems>;
