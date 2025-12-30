import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenantFieldDefinitions } from "@/db/schema";

// PATCH /api/admin/custom-fields/:id
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

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
            label,
            description,
            required,
            searchable,
            defaultValue,
            uiConfig,
            isArchived,
        } = body;

        // Fetch existing definition
        const [existing] = await db
            .select()
            .from(tenantFieldDefinitions)
            .where(eq(tenantFieldDefinitions.id, id));

        if (!existing || existing.tenantId !== tenantId) {
            return NextResponse.json(
                { error: "Field definition not found" },
                { status: 404 },
            );
        }

        const updateData: Partial<typeof tenantFieldDefinitions.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (label !== undefined) updateData.label = label;
        if (description !== undefined) updateData.description = description;
        if (required !== undefined) updateData.required = required;
        if (searchable !== undefined) updateData.searchable = searchable;
        if (defaultValue !== undefined) updateData.defaultValue = defaultValue;
        if (uiConfig !== undefined) updateData.uiConfig = uiConfig;
        if (isArchived !== undefined) updateData.isArchived = isArchived;

        const [updated] = await db
            .update(tenantFieldDefinitions)
            .set(updateData)
            .where(eq(tenantFieldDefinitions.id, id))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating custom field:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// DELETE /api/admin/custom-fields/:id (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        // TODO: Get tenant from session
        const tenantId = request.headers.get("x-tenant-id");
        if (!tenantId) {
            return NextResponse.json(
                { error: "Tenant ID required" },
                { status: 401 },
            );
        }

        // Fetch existing definition
        const [existing] = await db
            .select()
            .from(tenantFieldDefinitions)
            .where(eq(tenantFieldDefinitions.id, id));

        if (!existing || existing.tenantId !== tenantId) {
            return NextResponse.json(
                { error: "Field definition not found" },
                { status: 404 },
            );
        }

        // Soft delete
        await db
            .update(tenantFieldDefinitions)
            .set({
                isArchived: true,
                updatedAt: new Date(),
            })
            .where(eq(tenantFieldDefinitions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting custom field:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
