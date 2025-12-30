import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenantOptionSetOptions, tenantOptionSets } from "@/db/schema";

// PATCH /api/admin/option-sets/:id/options/:optionId
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; optionId: string }> },
) {
    try {
        const { id, optionId } = await params;

        // TODO: Get tenant from session
        const tenantId = request.headers.get("x-tenant-id");
        if (!tenantId) {
            return NextResponse.json(
                { error: "Tenant ID required" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { label, description, sortOrder, isActive } = body;

        // Verify option set exists and belongs to tenant
        const [optionSet] = await db
            .select()
            .from(tenantOptionSets)
            .where(eq(tenantOptionSets.id, id));

        if (!optionSet || optionSet.tenantId !== tenantId) {
            return NextResponse.json(
                { error: "Option set not found" },
                { status: 404 },
            );
        }

        // Verify option exists
        const [existing] = await db
            .select()
            .from(tenantOptionSetOptions)
            .where(eq(tenantOptionSetOptions.id, optionId));

        if (!existing || existing.optionSetId !== id) {
            return NextResponse.json({ error: "Option not found" }, { status: 404 });
        }

        const updateData: Partial<typeof tenantOptionSetOptions.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (label !== undefined) updateData.label = label;
        if (description !== undefined) updateData.description = description;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
        if (isActive !== undefined) updateData.isActive = isActive;

        const [updated] = await db
            .update(tenantOptionSetOptions)
            .set(updateData)
            .where(eq(tenantOptionSetOptions.id, optionId))
            .returning();

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating option:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// DELETE /api/admin/option-sets/:id/options/:optionId (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; optionId: string }> },
) {
    try {
        const { id, optionId } = await params;

        // TODO: Get tenant from session
        const tenantId = request.headers.get("x-tenant-id");
        if (!tenantId) {
            return NextResponse.json(
                { error: "Tenant ID required" },
                { status: 401 },
            );
        }

        // Verify option set exists and belongs to tenant
        const [optionSet] = await db
            .select()
            .from(tenantOptionSets)
            .where(eq(tenantOptionSets.id, id));

        if (!optionSet || optionSet.tenantId !== tenantId) {
            return NextResponse.json(
                { error: "Option set not found" },
                { status: 404 },
            );
        }

        // Verify option exists
        const [existing] = await db
            .select()
            .from(tenantOptionSetOptions)
            .where(eq(tenantOptionSetOptions.id, optionId));

        if (!existing || existing.optionSetId !== id) {
            return NextResponse.json({ error: "Option not found" }, { status: 404 });
        }

        // Soft delete by setting isActive to false
        await db
            .update(tenantOptionSetOptions)
            .set({
                isActive: false,
                updatedAt: new Date(),
            })
            .where(eq(tenantOptionSetOptions.id, optionId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting option:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
