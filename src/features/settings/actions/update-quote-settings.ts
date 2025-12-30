"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenantOptionSetOptions, tenantOptionSets } from "@/db/schema";
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

        // Update statuses in quote_status option set
        const statusSet = await db.query.tenantOptionSets.findFirst({
            where: and(
                eq(tenantOptionSets.tenantId, session.user.tenantId),
                eq(tenantOptionSets.name, "quote_status"),
            ),
        });

        if (statusSet) {
            // Update existing options
            for (const status of validated.data.statuses) {
                await db
                    .update(tenantOptionSetOptions)
                    .set({
                        label: status.name,
                        color: status.color,
                        sortOrder: status.order,
                    })
                    .where(
                        and(
                            eq(tenantOptionSetOptions.optionSetId, statusSet.id),
                            eq(tenantOptionSetOptions.optionKey, status.key),
                        ),
                    );
            }
        }

        revalidatePath("/settings/customize");
        revalidatePath("/settings");
        revalidatePath("/quotes");
        return { success: true };
    } catch (error) {
        console.error("Failed to update quote settings:", error);
        return { error: "Failed to update settings" };
    }
}
