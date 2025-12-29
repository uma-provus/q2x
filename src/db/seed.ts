import bcrypt from "bcryptjs";
import {
    DEFAULT_CATALOG_SETTINGS,
    DEFAULT_QUOTE_SETTINGS,
} from "@/features/settings/types";
import { db } from "./index";
import { roles, tenants, userRoles, users } from "./schema";

async function main() {
    console.log("Seeding database...");

    // Clear existing data
    await db.delete(userRoles);
    await db.delete(users);
    await db.delete(roles);
    await db.delete(tenants);

    // Create roles
    console.log("Creating roles...");
    const [adminRole, salesRole, financeRole, viewerRole] = await db
        .insert(roles)
        .values([
            {
                name: "admin",
                description: "Full access to all features",
            },
            {
                name: "sales",
                description: "Can create and manage quotes",
            },
            {
                name: "finance",
                description: "Can view and approve quotes",
            },
            {
                name: "viewer",
                description: "Read-only access",
            },
        ])
        .returning();

    // Create tenants with realistic company names
    console.log("Creating tenants...");
    const tenantsSeedData = [
        {
            name: "Acme Corporation",
            slug: "acme",
            adminName: "Alice Johnson",
            salesName: "Bob Smith",
        },
        {
            name: "TechFlow Solutions",
            slug: "techflow",
            adminName: "Charlie Davis",
            salesName: "Diana Evans",
        },
        {
            name: "Global Industries",
            slug: "global",
            adminName: "Evan Wright",
            salesName: "Fiona Green",
        },
    ];

    const createdTenants = await db
        .insert(tenants)
        .values(
            tenantsSeedData.map(({ name, slug }) => ({
                name,
                slug,
                catalogSchema: DEFAULT_CATALOG_SETTINGS,
                quoteSettings: DEFAULT_QUOTE_SETTINGS,
            })),
        )
        .returning();

    const passwordHash = await bcrypt.hash("password123", 10);

    // Create users for each tenant
    console.log("Creating users...");
    for (const tenant of createdTenants) {
        const seedData = tenantsSeedData.find((t) => t.slug === tenant.slug);
        const companyDomain = tenant.slug;

        // Create admin user
        const [adminUser] = await db
            .insert(users)
            .values({
                tenantId: tenant.id,
                email: `admin@${companyDomain}.com`,
                name: seedData?.adminName || `${tenant.name} Admin`,
                passwordHash,
                status: "active",
            })
            .returning();

        // Assign admin role
        await db.insert(userRoles).values({
            tenantId: tenant.id,
            userId: adminUser.id,
            roleId: adminRole.id,
        });

        // Create sales user
        const [salesUser] = await db
            .insert(users)
            .values({
                tenantId: tenant.id,
                email: `sales@${companyDomain}.com`,
                name: seedData?.salesName || `${tenant.name} Sales Rep`,
                passwordHash,
                status: "active",
            })
            .returning();

        // Assign sales role
        await db.insert(userRoles).values({
            tenantId: tenant.id,
            userId: salesUser.id,
            roleId: salesRole.id,
        });

        console.log(`✓ Created users for ${tenant.name}`);
    }

    console.log("\n✅ Seeding complete!");
    console.log("\nTest Users:");
    console.log("─".repeat(50));
    console.log("Acme Corporation:");
    console.log("  Admin: admin@acme.com / password123");
    console.log("  Sales: sales@acme.com / password123");
    console.log("\nTechFlow Solutions:");
    console.log("  Admin: admin@techflow.com / password123");
    console.log("  Sales: sales@techflow.com / password123");
    console.log("\nGlobal Industries:");
    console.log("  Admin: admin@global.com / password123");
    console.log("  Sales: sales@global.com / password123");
    console.log("─".repeat(50));

    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
