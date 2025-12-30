import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { companies, tenants } from "@/db/schema";
import { CompanyTable } from "@/features/companies/components/company-table";
import { auth } from "@/lib/auth";
import { getCustomFieldsForEntity } from "@/lib/custom-fields";

export default async function CompaniesPage() {
    const session = await auth();

    if (!session?.user?.tenantId) {
        redirect("/login");
    }

    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, session.user.tenantId),
    });

    if (!tenant) {
        redirect("/login");
    }

    const allCompanies = await db.query.companies.findMany({
        where: eq(companies.tenantId, session.user.tenantId),
        orderBy: (companies, { desc }) => [desc(companies.createdAt)],
    });

    const customFields = await getCustomFieldsForEntity(session.user.tenantId, "company");

    // Pagination
    const page = 1;
    const pageSize = 50;
    const total = allCompanies.length;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="flex flex-col gap-4">
            <CompanyTable
                data={allCompanies.map(c => ({ ...c, customFields: c.customFields as Record<string, unknown> | null }))}
                meta={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                }}
                customFields={customFields}
            />
        </div>
    );
}
