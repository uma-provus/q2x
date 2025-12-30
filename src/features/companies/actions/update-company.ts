"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { auth } from "@/lib/auth";
import { validateEntity } from "@/lib/custom-fields";
import { companySchema } from "../types";

export async function updateCompany(
    id: string,
    data: z.infer<typeof companySchema>,
) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedData = companySchema.parse(data);

    // Validate custom fields
    const validation = await validateEntity({
        tenantId: session.user.tenantId,
        entityType: "company",
        customFields: validatedData.customFields,
    });

    if (!validation.valid) {
        throw new Error(
            `Validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`
        );
    }

    await db
        .update(companies)
        .set({
            name: validatedData.name,
            website: validatedData.website || null,
            address: validatedData.address || null,
            city: validatedData.city || null,
            state: validatedData.state || null,
            country: validatedData.country || null,
            postalCode: validatedData.postalCode || null,
            tags: validatedData.tags || null,
            customFields: validation.validatedCustomFields || null,
            updatedAt: new Date(),
        })
        .where(eq(companies.id, id));

    revalidatePath("/companies");
}
