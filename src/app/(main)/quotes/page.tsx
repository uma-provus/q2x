import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { quotes } from "@/db/schema";
import { QuoteTable } from "@/features/quotes/components/quote-table";
import { auth } from "@/lib/auth";
import { getCustomFieldsForEntity } from "@/lib/custom-fields";
import { loadQuoteSettings } from "@/lib/settings/load-settings";

export default async function QuotesPage() {
    const session = await auth();

    if (!session?.user?.tenantId) {
        redirect("/login");
    }

    const [allQuotes, quoteSettings, customFields] = await Promise.all([
        db.query.quotes.findMany({
            where: eq(quotes.tenantId, session.user.tenantId),
            orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
        }),
        loadQuoteSettings(session.user.tenantId),
        getCustomFieldsForEntity(session.user.tenantId, "quote"),
    ]);

    // Pagination
    const page = 1;
    const pageSize = 50;
    const total = allQuotes.length;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="flex flex-col gap-4">
            <QuoteTable
                data={allQuotes.map(q => ({ ...q, customFields: q.customFields as Record<string, unknown> | null }))}
                meta={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                }}
                settings={quoteSettings}
                customFields={customFields}
            />
        </div>
    );
}
