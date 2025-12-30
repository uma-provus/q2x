"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function deleteContact(id: string) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    await db.delete(contacts).where(eq(contacts.id, id));

    revalidatePath("/contacts");
}
