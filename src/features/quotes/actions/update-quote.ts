"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { quoteSchema } from "../types";

export async function updateQuote(
    id: string,
    data: z.infer<typeof quoteSchema>,
) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedData = quoteSchema.parse(data);

    await db
        .update(quotes)
        .set({
            quoteNumber: validatedData.quoteNumber,
            title: validatedData.title,
            customerName: validatedData.customerName,
            customerId: validatedData.customerId || null,
            status: validatedData.status,
            totalAmount: validatedData.totalAmount,
            currency: validatedData.currency,
            validUntil: validatedData.validUntil || null,
            notes: validatedData.notes || null,
            tags: validatedData.tags || null,
            updatedAt: new Date(),
        })
        .where(eq(quotes.id, id));

    revalidatePath("/quotes");
}
