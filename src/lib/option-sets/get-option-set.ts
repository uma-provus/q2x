import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tenantOptionSetOptions, tenantOptionSets } from "@/db/schema";
import type { OptionSetWithOptions } from "@/lib/custom-fields/types";

export async function getOptionSet(
    tenantId: string,
    name: string,
): Promise<OptionSetWithOptions | null> {
    const [optionSet] = await db
        .select()
        .from(tenantOptionSets)
        .where(
            and(
                eq(tenantOptionSets.tenantId, tenantId),
                eq(tenantOptionSets.name, name),
            ),
        );

    if (!optionSet) {
        return null;
    }

    const options = await db
        .select()
        .from(tenantOptionSetOptions)
        .where(eq(tenantOptionSetOptions.optionSetId, optionSet.id))
        .orderBy(tenantOptionSetOptions.sortOrder);

    return {
        ...optionSet,
        options,
    };
}

export async function getActiveOptionKeys(
    tenantId: string,
    name: string,
): Promise<Set<string>> {
    const optionSet = await getOptionSet(tenantId, name);

    if (!optionSet) {
        return new Set();
    }

    return new Set(
        optionSet.options.filter((opt) => opt.isActive).map((opt) => opt.optionKey),
    );
}
