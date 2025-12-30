"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenantFieldDefinitions } from "@/db/schema";
import type { DataType } from "@/lib/custom-fields";

interface UpdateCustomFieldInput {
    id: string;
    label: string;
    description?: string;
    dataType: DataType;
    required: boolean;
    searchable: boolean;
    optionSetId?: string;
}

export async function updateCustomField(input: UpdateCustomFieldInput) {
    try {
        const [updatedField] = await db
            .update(tenantFieldDefinitions)
            .set({
                label: input.label,
                description: input.description || null,
                dataType: input.dataType,
                required: input.required,
                searchable: input.searchable,
                optionSetId: input.optionSetId || null,
                updatedAt: new Date(),
            })
            .where(eq(tenantFieldDefinitions.id, input.id))
            .returning();

        revalidatePath("/settings/custom-fields");

        return { success: true, data: updatedField };
    } catch (error) {
        console.error("Failed to update custom field:", error);
        return { success: false, error: "Failed to update custom field" };
    }
}
