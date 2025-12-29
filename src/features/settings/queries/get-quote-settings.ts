import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
    DEFAULT_QUOTE_SETTINGS,
    type QuoteSettings,
    quoteSettingsSchema,
} from "../types";

export async function getQuoteSettings(): Promise<QuoteSettings> {
    const session = await auth();
    if (!session?.user?.tenantId) {
        return DEFAULT_QUOTE_SETTINGS;
    }

    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, session.user.tenantId),
        columns: {
            quoteSettings: true,
        },
    });

    if (!tenant?.quoteSettings) {
        return DEFAULT_QUOTE_SETTINGS;
    }

    const parsed = quoteSettingsSchema.safeParse(tenant.quoteSettings);
    if (parsed.success) {
        return parsed.data;
    }

    return DEFAULT_QUOTE_SETTINGS;
}
