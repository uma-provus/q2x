"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { catalogItems } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function deleteCatalogItem(id: string) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    await db
        .delete(catalogItems)
        .where(
            and(
                eq(catalogItems.id, id),
                eq(catalogItems.tenantId, session.user.tenantId),
            ),
        );

    revalidatePath("/catalogs");
}
