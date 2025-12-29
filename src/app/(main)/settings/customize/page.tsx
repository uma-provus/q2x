import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { CatalogSettingsForm } from "@/features/settings/components/catalog-settings-form";
import { QuoteSettingsForm } from "@/features/settings/components/quote-settings-form";
import {
    type CatalogSettings,
    DEFAULT_CATALOG_SETTINGS,
    DEFAULT_QUOTE_SETTINGS,
    type QuoteSettings,
} from "@/features/settings/types";
import { auth } from "@/lib/auth";

export default async function SettingsCustomizePage() {
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

    const catalogSettings =
        (tenant.catalogSchema as CatalogSettings) || DEFAULT_CATALOG_SETTINGS;

    const quoteSettings =
        (tenant.quoteSettings as QuoteSettings) || DEFAULT_QUOTE_SETTINGS;

    // Sort statuses by order
    const sortedQuoteSettings = {
        ...quoteSettings,
        statuses: [...quoteSettings.statuses].sort((a, b) => a.order - b.order),
    };

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto">
            <div>
                <h2 className="text-xl font-semibold tracking-tight">Catalog</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure your catalog settings. Manage the types of items available
                    in your catalog and enable or disable pricing units.
                </p>
            </div>
            <CatalogSettingsForm initialData={catalogSettings} />

            <Separator className="my-8" />

            <div>
                <h2 className="text-xl font-semibold tracking-tight">Quote</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Configure quote workflow settings. Manage the statuses available for
                    quotes and customize the quote lifecycle.
                </p>
            </div>
            <QuoteSettingsForm initialData={sortedQuoteSettings} />
        </div>
    );
}
