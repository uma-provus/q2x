import type { EntityType, ValidationError } from "@/lib/custom-fields";
import {
    loadFieldDefinitions,
    validateCustomFields,
} from "@/lib/custom-fields";
import { getActiveOptionKeys } from "@/lib/option-sets";

export interface EntityValidationInput {
    tenantId: string;
    entityType: EntityType;
    customFields?: Record<string, unknown> | null;
    catalogType?: string; // For catalog_items
    quoteStatus?: string; // For quotes
}

export interface EntityValidationResult {
    valid: boolean;
    errors: ValidationError[];
    validatedCustomFields?: Record<string, unknown>;
}

export async function validateEntity(
    input: EntityValidationInput,
): Promise<EntityValidationResult> {
    const { tenantId, entityType, customFields, catalogType, quoteStatus } =
        input;
    const errors: ValidationError[] = [];

    // 1. Validate custom fields
    const fieldDefinitions = await loadFieldDefinitions(tenantId, entityType);
    const customFieldsResult = await validateCustomFields(
        customFields,
        fieldDefinitions,
    );

    if (!customFieldsResult.valid) {
        errors.push(...customFieldsResult.errors);
    }

    // 2. Validate catalog_items.type if applicable
    if (entityType === "catalog_item" && catalogType !== undefined) {
        const validTypes = await getActiveOptionKeys(tenantId, "catalog_item_type");

        if (!validTypes.has(catalogType)) {
            errors.push({
                path: "type",
                message: `Invalid catalog type. Must be one of: ${Array.from(validTypes).join(", ")}`,
            });
        }
    }

    // 3. Validate quotes.status if applicable
    if (entityType === "quote" && quoteStatus !== undefined) {
        const validStatuses = await getActiveOptionKeys(tenantId, "quote_status");

        if (!validStatuses.has(quoteStatus)) {
            errors.push({
                path: "status",
                message: `Invalid quote status. Must be one of: ${Array.from(validStatuses).join(", ")}`,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        validatedCustomFields:
            errors.length === 0 ? customFieldsResult.validatedData : undefined,
    };
}
