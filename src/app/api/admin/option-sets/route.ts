import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenantOptionSetOptions, tenantOptionSets } from "@/db/schema";
import { getOptionSet } from "@/lib/option-sets";

// GET /api/admin/option-sets?name=quote_status
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
        const name = searchParams.get("name");

        if (name) {
            // Get specific option set
            const optionSet = await getOptionSet(tenantId, name);
            if (!optionSet) {
                return NextResponse.json(
                    { error: "Option set not found" },
                    { status: 404 },
                );
            }
            return NextResponse.json(optionSet);
        }

        // Get all option sets for tenant
        const optionSets = await db
            .select()
            .from(tenantOptionSets)
            .where(eq(tenantOptionSets.tenantId, tenantId));

        // Load options for each set
        const optionSetsWithOptions = await Promise.all(
            optionSets.map(async (set) => {
                const options = await db
                    .select()
                    .from(tenantOptionSetOptions)
                    .where(eq(tenantOptionSetOptions.optionSetId, set.id))
                    .orderBy(tenantOptionSetOptions.sortOrder);

                return {
                    ...set,
                    options,
                };
            }),
        );

        return NextResponse.json(optionSetsWithOptions);
    } catch (error) {
        console.error("Error fetching option sets:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST /api/admin/option-sets
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
        const { name, entityType } = body;

        if (!name) {
            return NextResponse.json({ error: "name is required" }, { status: 400 });
        }

        // Check uniqueness
        const existing = await db
            .select()
            .from(tenantOptionSets)
            .where(
                and(
                    eq(tenantOptionSets.tenantId, tenantId),
                    eq(tenantOptionSets.name, name),
                ),
            );

        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Option set with this name already exists" },
                { status: 409 },
            );
        }

        const [created] = await db
            .insert(tenantOptionSets)
            .values({
                tenantId,
                name,
                entityType: entityType || null,
            })
            .returning();

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("Error creating option set:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
