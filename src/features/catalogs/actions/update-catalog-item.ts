"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { catalogItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { type CatalogItemFormValues, catalogItemSchema } from "../schema";

export async function updateCatalogItem(
    id: string,
    data: CatalogItemFormValues,
) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedFields = catalogItemSchema.safeParse(data);

    if (!validatedFields.success) {
        throw new Error("Invalid fields");
    }

    await db
        .update(catalogItems)
        .set(validatedFields.data)
        .where(
            and(
                eq(catalogItems.id, id),
                eq(catalogItems.tenantId, session.user.tenantId),
            ),
        );

    revalidatePath("/catalogs");
}
