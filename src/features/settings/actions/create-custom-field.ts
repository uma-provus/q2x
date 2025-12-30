"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tenantFieldDefinitions } from "@/db/schema";
import type { DataType, EntityType } from "@/lib/custom-fields";

interface CreateCustomFieldInput {
    tenantId: string;
    entityType: EntityType;
    fieldKey: string;
    label: string;
    description?: string;
    dataType: DataType;
    required: boolean;
    searchable: boolean;
    optionSetId?: string;
}

export async function createCustomField(input: CreateCustomFieldInput) {
    try {
        const [newField] = await db
            .insert(tenantFieldDefinitions)
            .values({
                tenantId: input.tenantId,
                entityType: input.entityType,
                fieldKey: input.fieldKey,
                label: input.label,
                description: input.description || null,
                dataType: input.dataType,
                required: input.required,
                searchable: input.searchable,
                optionSetId: input.optionSetId || null,
                isArchived: false,
            })
            .returning();

        revalidatePath("/settings/custom-fields");

        return { success: true, data: newField };
    } catch (error) {
        console.error("Failed to create custom field:", error);
        return { success: false, error: "Failed to create custom field" };
    }
}
