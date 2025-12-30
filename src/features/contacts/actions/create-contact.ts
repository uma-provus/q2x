"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { validateEntity } from "@/lib/custom-fields";
import { contactSchema } from "../types";

export async function createContact(data: z.infer<typeof contactSchema>) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedData = contactSchema.parse(data);

    // Validate custom fields
    const validation = await validateEntity({
        tenantId: session.user.tenantId,
        entityType: "contact",
        customFields: validatedData.customFields,
    });

    if (!validation.valid) {
        throw new Error(
            `Validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`
        );
    }

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
        customFields: validation.validatedCustomFields || null,
    });

    revalidatePath("/contacts");
}
