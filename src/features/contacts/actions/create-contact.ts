"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { contactSchema } from "../types";

export async function createContact(data: z.infer<typeof contactSchema>) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedData = contactSchema.parse(data);

    await db.insert(contacts).values({
        tenantId: session.user.tenantId,
        companyId: validatedData.companyId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        title: validatedData.title || null,
        isPrimary: validatedData.isPrimary || false,
        tags: validatedData.tags || null,
    });

    revalidatePath("/contacts");
}
