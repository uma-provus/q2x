import bcrypt from "bcryptjs";
import {
    CatalogType,
    DEFAULT_CATALOG_SETTINGS,
    DEFAULT_QUOTE_SETTINGS,
} from "@/features/settings/types";
import { db } from "./index";
import { catalogItems, companies, contacts, quotes, roles, tenants, userRoles, users } from "./schema";

async function main() {
    console.log("Seeding database...");

    // Clear existing data
    await db.delete(contacts);
    await db.delete(quotes);
    await db.delete(companies);
    await db.delete(catalogItems);
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

        // Create catalog items
        console.log(`Creating catalog items for ${tenant.name}...`);

        const baseItems = [
            {
                tenantId: tenant.id,
                name: "Senior Consultant",
                description: "Expert strategic advice and implementation",
                type: CatalogType.ResourceRole,
                unitCost: "150.00",
                unitPrice: "250.00",
                unitType: "hourly",
                currency: "USD",
                tags: ["consulting", "senior"],
            },
            {
                tenantId: tenant.id,
                name: "Project Manager",
                description: "Project oversight and delivery management",
                type: CatalogType.ResourceRole,
                unitCost: "120.00",
                unitPrice: "200.00",
                unitType: "hourly",
                currency: "USD",
                tags: ["management", "delivery"],
            },
            {
                tenantId: tenant.id,
                name: "Solution Architect",
                description: "Technical architecture and design",
                type: CatalogType.ResourceRole,
                unitCost: "160.00",
                unitPrice: "275.00",
                unitType: "hourly",
                currency: "USD",
                tags: ["technical", "architecture"],
            },
            {
                tenantId: tenant.id,
                name: "Enterprise Platform License",
                description: "Annual subscription for enterprise features",
                type: CatalogType.Product,
                unitCost: "5000.00",
                unitPrice: "12000.00",
                unitType: "yearly",
                currency: "USD",
                tags: ["software", "subscription"],
            },
            {
                tenantId: tenant.id,
                name: "Premium Support Package",
                description: "24/7 dedicated support access",
                type: CatalogType.AddOn,
                unitCost: "1000.00",
                unitPrice: "2500.00",
                unitType: "monthly",
                currency: "USD",
                tags: ["support", "sla"],
            },
        ];

        // Generate more items
        const extraItems = Array.from({ length: 45 }).map((_, i) => {
            const types = [CatalogType.ResourceRole, CatalogType.Product, CatalogType.AddOn];
            const type = types[i % 3];

            let name = "";
            let unitType = "";
            let tags: string[] = [];

            if (type === CatalogType.ResourceRole) {
                const roles = ["Developer", "QA Engineer", "Designer", "Analyst", "DevOps Engineer"];
                name = `${roles[i % roles.length]} Level ${Math.floor(i / 5) + 1}`;
                unitType = "hourly";
                tags = ["labor", "staffing"];
            } else if (type === CatalogType.Product) {
                const products = ["Module", "Connector", "API Pack", "Storage Unit", "User License"];
                name = `${products[i % products.length]} ${String.fromCharCode(65 + (i % 5))}`;
                unitType = "monthly";
                tags = ["software", "license"];
            } else {
                const addons = ["Training", "Onboarding", "Data Migration", "Custom Report", "Audit"];
                name = `${addons[i % addons.length]} Service`;
                unitType = "flat";
                tags = ["service", "one-time"];
            }

            const cost = (Math.random() * 500 + 50).toFixed(2);
            const price = (parseFloat(cost) * (1.5 + Math.random())).toFixed(2);

            return {
                tenantId: tenant.id,
                name,
                description: `Standard description for ${name}`,
                type,
                unitCost: cost,
                unitPrice: price,
                unitType,
                currency: "USD",
                tags: [type, ...tags],
            };
        });

        await db.insert(catalogItems).values([...baseItems, ...extraItems]);

        // Create sample companies and contacts FIRST (before quotes)
        console.log(`Creating companies and contacts for ${tenant.name}...`);

        const companyData = [
            {
                tenantId: tenant.id,
                name: "Contoso Ltd",
                website: "https://contoso.com",
                address: "123 Main Street",
                city: "Seattle",
                state: "Washington",
                country: "USA",
                postalCode: "98101",
                tags: ["enterprise", "vip"],
            },
            {
                tenantId: tenant.id,
                name: "Northwind Traders",
                website: "https://northwind.com",
                address: "456 Commerce Ave",
                city: "New York",
                state: "New York",
                country: "USA",
                postalCode: "10001",
                tags: ["partner"],
            },
            {
                tenantId: tenant.id,
                name: "Adventure Works",
                website: "https://adventureworks.com",
                address: "789 Mountain Road",
                city: "Denver",
                state: "Colorado",
                country: "USA",
                postalCode: "80202",
                tags: ["enterprise"],
            },
            {
                tenantId: tenant.id,
                name: "Fabrikam Inc",
                website: "https://fabrikam.com",
                address: "321 Tech Boulevard",
                city: "Austin",
                state: "Texas",
                country: "USA",
                postalCode: "73301",
                tags: ["startup"],
            },
            {
                tenantId: tenant.id,
                name: "Wide World Importers",
                website: "https://wideworldimporters.com",
                address: "654 Harbor Street",
                city: "San Francisco",
                state: "California",
                country: "USA",
                postalCode: "94102",
                tags: ["international", "vip"],
            },
            {
                tenantId: tenant.id,
                name: "Tailspin Toys",
                website: "https://tailspintoys.com",
                address: "987 Innovation Way",
                city: "Boston",
                state: "Massachusetts",
                country: "USA",
                postalCode: "02101",
                tags: ["partner", "retail"],
            },
        ];

        const createdCompanies = await db.insert(companies).values(companyData).returning();

        // Create contacts for each company
        const contactData = createdCompanies.map((company, index) => {
            const contactDetails = [
                { firstName: "John", lastName: "Smith", email: "john.smith@contoso.com", phone: "+1 (555) 123-4567", title: "CEO" },
                { firstName: "Sarah", lastName: "Johnson", email: "sarah.j@northwind.com", phone: "+1 (555) 234-5678", title: "VP Sales" },
                { firstName: "Michael", lastName: "Chen", email: "m.chen@adventure.com", phone: "+1 (555) 345-6789", title: "Director of Operations" },
                { firstName: "Emily", lastName: "Rodriguez", email: "emily.r@fabrikam.com", phone: "+1 (555) 456-7890", title: "CTO" },
                { firstName: "David", lastName: "Kim", email: "david.kim@wideworldimporters.com", phone: "+1 (555) 567-8901", title: "Procurement Manager" },
                { firstName: "Lisa", lastName: "Anderson", email: "lisa.a@tailspintoys.com", phone: "+1 (555) 678-9012", title: "Head of Purchasing" },
            ];

            return {
                tenantId: tenant.id,
                companyId: company.id,
                ...contactDetails[index],
                isPrimary: true,
            };
        });

        const createdContacts = await db.insert(contacts).values(contactData).returning();

        // Create sample quotes (referencing companies and contacts)
        console.log(`Creating quotes for ${tenant.name}...`);

        const quoteStatuses = DEFAULT_QUOTE_SETTINGS.statuses;

        const quoteDescriptions = [
            "Annual Software License Renewal",
            "Q1 Professional Services",
            "Enterprise Platform Implementation",
            "Custom Development Package",
            "Training and Support Services",
            "Cloud Infrastructure Setup",
        ];

        const quotesData = Array.from({ length: 15 }).map((_, i) => {
            const statusIndex = i % quoteStatuses.length;
            const companyIndex = i % createdCompanies.length;
            const baseDate = new Date();
            baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 90 days

            const validUntilDate = new Date(baseDate);
            validUntilDate.setDate(validUntilDate.getDate() + 30);

            const amount = (Math.random() * 100000 + 10000).toFixed(2);

            return {
                tenantId: tenant.id,
                quoteNumber: `Q-${String(i + 1).padStart(4, "0")}`,
                title: `${quoteDescriptions[i % quoteDescriptions.length]} - ${createdCompanies[companyIndex].name}`,
                companyId: createdCompanies[companyIndex].id,
                contactId: createdContacts[companyIndex].id,
                status: quoteStatuses[statusIndex].key,
                totalAmount: amount,
                currency: "USD",
                validUntil: validUntilDate,
                notes: `This is a sample quote for ${createdCompanies[companyIndex].name}. Terms and conditions apply.`,
                tags: ["sample", quoteStatuses[statusIndex].key],
                createdBy: adminUser.id,
                createdAt: baseDate,
                updatedAt: baseDate,
            };
        });

        await db.insert(quotes).values(quotesData);

        console.log(`Created users, catalog items, companies, contacts, and quotes for ${tenant.name}`);
    }
    console.log("\nSeeding complete!");
    console.log("\nTest Users:");
    console.log("-".repeat(50));
    console.log("Acme Corporation:");
    console.log("  Admin: admin@acme.com / password123");
    console.log("  Sales: sales@acme.com / password123");
    console.log("\nTechFlow Solutions:");
    console.log("  Admin: admin@techflow.com / password123");
    console.log("  Sales: sales@techflow.com / password123");
    console.log("\nGlobal Industries:");
    console.log("  Admin: admin@global.com / password123");
    console.log("  Sales: sales@global.com / password123");
    console.log("-".repeat(50));

    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
