"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { auth } from "@/lib/auth";
import { type NotificationsSettings, notificationsSettingsSchema } from "../types";

export async function updateNotificationSettings(data: NotificationsSettings) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        return { error: "Unauthorized" };
    }

    const parsed = notificationsSettingsSchema.safeParse(data);

    if (!parsed.success) {
        return { error: "Invalid data" };
    }

    try {
        await db
            .update(tenants)
            .set({
                notificationSettings: parsed.data,
            })
            .where(eq(tenants.id, session.user.tenantId));

        revalidatePath("/settings/notifications");
        return { success: true };
    } catch (error) {
        console.error("Failed to update notification settings:", error);
        return { error: "Failed to update settings" };
    }
}
