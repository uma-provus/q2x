import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { companies, tenants } from "@/db/schema";
import { CompanyTable } from "@/features/companies/components/company-table";
import { auth } from "@/lib/auth";

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

    // Pagination
    const page = 1;
    const pageSize = 50;
    const total = allCompanies.length;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="flex flex-col gap-4">
            <CompanyTable
                data={allCompanies}
                meta={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                }}
            />
        </div>
    );
}
