import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenantFieldDefinitions } from "@/db/schema";
import type { EntityType } from "@/lib/custom-fields";
import { loadFieldDefinitions } from "@/lib/custom-fields";

// GET /api/admin/custom-fields?entityType=contact
export async function GET(request: NextRequest) {
    try {
        // TODO: Get tenant from session
        const tenantId = request.headers.get("x-tenant-id");
        if (!tenantId) {
            return NextResponse.json(
                { error: "Tenant ID required" },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const entityType = searchParams.get("entityType") as EntityType | null;

        if (!entityType) {
            return NextResponse.json(
                { error: "entityType query parameter required" },
                { status: 400 },
            );
        }

        const validEntityTypes = ["company", "contact", "catalog_item", "quote"];
        if (!validEntityTypes.includes(entityType)) {
            return NextResponse.json(
                { error: "Invalid entity type" },
                { status: 400 },
            );
        }

        const definitions = await loadFieldDefinitions(tenantId, entityType);

        return NextResponse.json(definitions);
    } catch (error) {
        console.error("Error fetching custom fields:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST /api/admin/custom-fields
export async function POST(request: NextRequest) {
    try {
        // TODO: Get tenant from session
        const tenantId = request.headers.get("x-tenant-id");
        if (!tenantId) {
            return NextResponse.json(
                { error: "Tenant ID required" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const {
            entityType,
            fieldKey,
            label,
            description,
            dataType,
            required,
            searchable,
            optionSetId,
            defaultValue,
            uiConfig,
        } = body;

        // Validation
        if (!entityType || !fieldKey || !label || !dataType) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields: entityType, fieldKey, label, dataType",
                },
                { status: 400 },
            );
        }

        // Validate enum/multienum has optionSetId
        if ((dataType === "enum" || dataType === "multienum") && !optionSetId) {
            return NextResponse.json(
                { error: "optionSetId required for enum/multienum fields" },
                { status: 400 },
            );
        }

        // Check uniqueness
        const existing = await db
            .select()
            .from(tenantFieldDefinitions)
            .where(
                and(
                    eq(tenantFieldDefinitions.tenantId, tenantId),
                    eq(tenantFieldDefinitions.entityType, entityType),
                    eq(tenantFieldDefinitions.fieldKey, fieldKey),
                ),
            );

        if (existing.length > 0) {
            return NextResponse.json(
                {
                    error: "Field key already exists for this entity type",
                },
                { status: 409 },
            );
        }

        const [created] = await db
            .insert(tenantFieldDefinitions)
            .values({
                tenantId,
                entityType,
                fieldKey,
                label,
                description: description || null,
                dataType,
                required: required || false,
                searchable: searchable || false,
                optionSetId: optionSetId || null,
                defaultValue: defaultValue || null,
                uiConfig: uiConfig || null,
            })
            .returning();

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("Error creating custom field:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
