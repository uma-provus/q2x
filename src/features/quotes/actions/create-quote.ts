"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { validateEntity } from "@/lib/custom-fields";
import { quoteSchema } from "../types";

export async function createQuote(data: z.infer<typeof quoteSchema>) {
    const session = await auth();

    if (!session?.user?.tenantId || !session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const validatedData = quoteSchema.parse(data);

    // Validate custom fields and quote status
    const validation = await validateEntity({
        tenantId: session.user.tenantId,
        entityType: "quote",
        customFields: validatedData.customFields,
        quoteStatus: validatedData.status,
    });

    if (!validation.valid) {
        throw new Error(
            `Validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`
        );
    }

    await db.insert(quotes).values({
        tenantId: session.user.tenantId,
        quoteNumber: validatedData.quoteNumber,
        title: validatedData.title,
        // Note: Schema mismatch - using companyId/contactId instead of customerName/customerId
        companyId: validatedData.customerId || null,
        contactId: null,
        status: validatedData.status,
        totalAmount: validatedData.totalAmount,
        currency: validatedData.currency,
        validUntil: validatedData.validUntil || null,
        notes: validatedData.notes || null,
        tags: validatedData.tags || null,
        customFields: validation.validatedCustomFields || null,
        createdBy: session.user.id,
    });

    revalidatePath("/quotes");
}
