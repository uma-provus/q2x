import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenantOptionSetOptions, tenantOptionSets } from "@/db/schema";

// POST /api/admin/option-sets/:id/options
export async function POST(
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
        const { optionKey, label, description, sortOrder, isActive } = body;

        if (!optionKey || !label) {
            return NextResponse.json(
                { error: "optionKey and label are required" },
                { status: 400 },
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

        const [created] = await db
            .insert(tenantOptionSetOptions)
            .values({
                optionSetId: id,
                optionKey,
                label,
                description: description || null,
                sortOrder: sortOrder || 0,
                isActive: isActive !== undefined ? isActive : true,
            })
            .returning();

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("Error creating option:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
