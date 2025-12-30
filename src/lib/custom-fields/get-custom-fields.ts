import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tenantFieldDefinitions, tenantOptionSetOptions } from "@/db/schema";
import type { EntityType } from "@/lib/custom-fields";

export async function getCustomFieldsForEntity(
    tenantId: string,
    entityType: EntityType
) {
    return db.query.tenantFieldDefinitions.findMany({
        where: and(
            eq(tenantFieldDefinitions.tenantId, tenantId),
            eq(tenantFieldDefinitions.entityType, entityType),
            eq(tenantFieldDefinitions.isArchived, false)
        ),
        with: {
            optionSet: {
                with: {
                    options: {
                        where: eq(tenantOptionSetOptions.isActive, true),
                        orderBy: [asc(tenantOptionSetOptions.sortOrder)],
                    },
                },
            },
        },
        orderBy: [asc(tenantFieldDefinitions.label)],
    });
}

export type CustomFieldDefinition = Awaited<ReturnType<typeof getCustomFieldsForEntity>>[number];
