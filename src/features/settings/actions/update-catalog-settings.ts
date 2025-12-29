"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { type CatalogSettings, catalogSettingsSchema } from "../types";

export async function updateCatalogSettings(data: CatalogSettings) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        return { error: "Unauthorized" };
    }

    const parsed = catalogSettingsSchema.safeParse(data);

    if (!parsed.success) {
        return { error: "Invalid data" };
    }

    try {
        await db
            .update(tenants)
            .set({
                catalogSchema: parsed.data,
            })
            .where(eq(tenants.id, session.user.tenantId));

        revalidatePath("/settings/general");
        return { success: true };
    } catch (error) {
        console.error("Failed to update catalog settings:", error);
        return { error: "Failed to update settings" };
    }
}
