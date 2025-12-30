"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { catalogItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { validateEntity } from "@/lib/custom-fields";
import { type CatalogItemFormValues, catalogItemSchema } from "../schema";

export async function createCatalogItem(data: CatalogItemFormValues) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedFields = catalogItemSchema.safeParse(data);

    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }

    // Validate custom fields and catalog type
    const validation = await validateEntity({
        tenantId: session.user.tenantId,
        entityType: "catalog_item",
        customFields: validatedFields.data.customFields,
        catalogType: validatedFields.data.type,
    });

    if (!validation.valid) {
        throw new Error(
            `Validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`
        );
    }

    await db.insert(catalogItems).values({
        ...validatedFields.data,
        tenantId: session.user.tenantId,
        customFields: validation.validatedCustomFields || null,
    });

    revalidatePath("/catalogs");
}
