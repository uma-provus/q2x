"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function deleteQuote(id: string) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    await db.delete(quotes).where(eq(quotes.id, id));

    revalidatePath("/quotes");
}
