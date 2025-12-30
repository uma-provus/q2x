import { auth } from "@/lib/auth";
import { loadCatalogSettings } from "@/lib/settings/load-settings";
import type { CatalogSettings } from "../types";

export async function getCatalogSettings(): Promise<CatalogSettings> {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    return loadCatalogSettings(session.user.tenantId);
}
