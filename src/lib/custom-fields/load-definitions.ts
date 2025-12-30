import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
    tenantFieldDefinitions,
    tenantOptionSetOptions,
    tenantOptionSets,
} from "@/db/schema";
import type {
    EntityType,
    FieldDefinition,
    OptionSetWithOptions,
} from "./types";

export async function loadFieldDefinitions(
    tenantId: string,
    entityType: EntityType,
): Promise<FieldDefinition[]> {
    const definitions = await db
        .select()
        .from(tenantFieldDefinitions)
        .where(
            and(
                eq(tenantFieldDefinitions.tenantId, tenantId),
                eq(tenantFieldDefinitions.entityType, entityType),
                eq(tenantFieldDefinitions.isArchived, false),
            ),
        );

    // Load option sets for enum/multienum fields
    const definitionsWithOptions: FieldDefinition[] = [];

    for (const def of definitions) {
        let optionSet: OptionSetWithOptions | undefined;

        if (
            def.optionSetId &&
            (def.dataType === "enum" || def.dataType === "multienum")
        ) {
            const [setData] = await db
                .select()
                .from(tenantOptionSets)
                .where(eq(tenantOptionSets.id, def.optionSetId));

            if (setData) {
                const options = await db
                    .select()
                    .from(tenantOptionSetOptions)
                    .where(eq(tenantOptionSetOptions.optionSetId, setData.id))
                    .orderBy(tenantOptionSetOptions.sortOrder);

                optionSet = {
                    ...setData,
                    options,
                };
            }
        }

        definitionsWithOptions.push({
            ...def,
            entityType: def.entityType as EntityType,
            dataType: def.dataType as FieldDefinition["dataType"],
            uiConfig: (def.uiConfig as Record<string, unknown>) || null,
            optionSet,
        });
    }

    return definitionsWithOptions;
}
