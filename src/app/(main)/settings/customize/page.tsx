import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { CatalogSettingsForm } from "@/features/settings/components/catalog-settings-form";
import {
    type CatalogSettings,
    DEFAULT_CATALOG_SETTINGS,
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

    return (
        <div className="space-y-6">
            <CatalogSettingsForm initialData={catalogSettings} />
        </div>
    );
}
