"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { type QuoteSettings, quoteSettingsSchema } from "../types";

export async function updateQuoteSettings(data: QuoteSettings) {
    try {
        const session = await auth();
        if (!session?.user?.tenantId) {
            return { error: "Unauthorized" };
        }

        const validated = quoteSettingsSchema.safeParse(data);
        if (!validated.success) {
            return { error: "Invalid settings data" };
        }

        await db
            .update(tenants)
            .set({
                quoteSettings: validated.data,
                updatedAt: new Date(),
            })
            .where(eq(tenants.id, session.user.tenantId));

        revalidatePath("/settings/customize");
        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Failed to update quote settings:", error);
        return { error: "Failed to update settings" };
    }
}
