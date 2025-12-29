"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { roles, tenants, userRoles, users } from "@/db/schema";

interface SignupInput {
    tenantName: string;
    name: string;
    email: string;
    password: string;
}

export async function signupAction(input: SignupInput) {
    try {
        // Generate slug from tenant name
        const slug = input.tenantName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        // Check if tenant slug already exists
        const existingTenant = await db
            .select()
            .from(tenants)
            .where(eq(tenants.slug, slug))
            .limit(1);

        if (existingTenant.length > 0) {
            return {
                success: false,
                error:
                    "A company with this name already exists. Please choose a different name.",
            };
        }

        // Create tenant
        const [tenant] = await db
            .insert(tenants)
            .values({
                name: input.tenantName,
                slug,
            })
            .returning();

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create user
        const [user] = await db
            .insert(users)
            .values({
                tenantId: tenant.id,
                email: input.email,
                name: input.name,
                passwordHash,
                status: "active",
            })
            .returning();

        // Get admin role
        const [adminRole] = await db
            .select()
            .from(roles)
            .where(eq(roles.name, "admin"))
            .limit(1);

        if (!adminRole) {
            throw new Error("Admin role not found. Please run database seed.");
        }

        // Assign admin role to user
        await db.insert(userRoles).values({
            tenantId: tenant.id,
            userId: user.id,
            roleId: adminRole.id,
        });

        return { success: true };
    } catch (error) {
        console.error("Signup error:", error);
        return {
            success: false,
            error: "Failed to create account. Please try again.",
        };
    }
}
