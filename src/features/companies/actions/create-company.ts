"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { auth } from "@/lib/auth";
import { companySchema } from "../types";

export async function createCompany(data: z.infer<typeof companySchema>) {
    const session = await auth();

    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const validatedData = companySchema.parse(data);

    await db.insert(companies).values({
        tenantId: session.user.tenantId,
        name: validatedData.name,
        website: validatedData.website || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        state: validatedData.state || null,
        country: validatedData.country || null,
        postalCode: validatedData.postalCode || null,
        tags: validatedData.tags || null,
    });

    revalidatePath("/companies");
}
