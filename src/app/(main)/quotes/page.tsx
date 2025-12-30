import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { quotes, tenants } from "@/db/schema";
import { QuoteTable } from "@/features/quotes/components/quote-table";
import {
    DEFAULT_QUOTE_SETTINGS,
    type QuoteSettings,
} from "@/features/settings/types";
import { auth } from "@/lib/auth";

export default async function QuotesPage() {
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

    const quoteSettings =
        (tenant.quoteSettings as QuoteSettings) || DEFAULT_QUOTE_SETTINGS;

    // Sort statuses by order
    const sortedQuoteSettings = {
        ...quoteSettings,
        statuses: [...quoteSettings.statuses].sort((a, b) => a.order - b.order),
    };

    const allQuotes = await db.query.quotes.findMany({
        where: eq(quotes.tenantId, session.user.tenantId),
        orderBy: (quotes, { desc }) => [desc(quotes.createdAt)],
    });

    // Pagination
    const page = 1;
    const pageSize = 50;
    const total = allQuotes.length;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="flex flex-col gap-4">
            <QuoteTable
                data={allQuotes}
                meta={{
                    page,
                    pageSize,
                    total,
                    totalPages,
                }}
                settings={sortedQuoteSettings}
            />
        </div>
    );
}
