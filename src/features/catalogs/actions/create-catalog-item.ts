"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { catalogItems } from "@/db/schema";
import { auth } from "@/lib/auth";
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

    await db.insert(catalogItems).values({
        ...validatedFields.data,
        tenantId: session.user.tenantId,
    });

    revalidatePath("/catalogs");
}
