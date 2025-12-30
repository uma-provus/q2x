"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { contactSchema } from "../types";

export async function updateContact(
    id: string,
    data: z.infer<typeof contactSchema>,
) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedData = contactSchema.parse(data);

    await db
        .update(contacts)
        .set({
            companyId: validatedData.companyId,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email || null,
            phone: validatedData.phone || null,
            title: validatedData.title || null,
            isPrimary: validatedData.isPrimary || false,
            tags: validatedData.tags || null,
            updatedAt: new Date(),
        })
        .where(eq(contacts.id, id));

    revalidatePath("/contacts");
}
