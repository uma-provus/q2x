"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { auth } from "@/lib/auth";
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
            updatedAt: new Date(),
        })
        .where(eq(companies.id, id));

    revalidatePath("/companies");
}
