"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function deleteCompany(id: string) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    await db.delete(companies).where(eq(companies.id, id));

    revalidatePath("/companies");
}
