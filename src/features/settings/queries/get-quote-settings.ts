import { auth } from "@/lib/auth";
import { loadQuoteSettings } from "@/lib/settings/load-settings";
import type { QuoteSettings } from "../types";

export async function getQuoteSettings(): Promise<QuoteSettings> {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    return loadQuoteSettings(session.user.tenantId);
}
