"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenantFieldDefinitions } from "@/db/schema";

export async function deleteCustomField(id: string) {
    try {
        // Soft delete by archiving
        await db
            .update(tenantFieldDefinitions)
            .set({
                isArchived: true,
                updatedAt: new Date(),
            })
            .where(eq(tenantFieldDefinitions.id, id));

        revalidatePath("/settings/custom-fields");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete custom field:", error);
        return { success: false, error: "Failed to delete custom field" };
    }
}
