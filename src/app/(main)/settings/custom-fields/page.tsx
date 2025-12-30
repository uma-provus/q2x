import type { Metadata } from "next";
import { CustomFieldsSettings } from "@/features/settings/components/custom-fields-settings";
import { auth } from "@/lib/auth";
import { getCustomFieldsForEntity } from "@/lib/custom-fields";

export const metadata: Metadata = {
    title: "Custom Fields - Settings",
    description:
        "Manage custom fields for companies, contacts, catalog items, and quotes.",
};

export default async function CustomFieldsPage() {
    const session = await auth();

    if (!session?.user?.tenantId) {
        return null;
    }

    const [companyFields, contactFields, catalogItemFields, quoteFields] = await Promise.all([
        getCustomFieldsForEntity(session.user.tenantId, "company"),
        getCustomFieldsForEntity(session.user.tenantId, "contact"),
        getCustomFieldsForEntity(session.user.tenantId, "catalog_item"),
        getCustomFieldsForEntity(session.user.tenantId, "quote"),
    ]);

    return (
        <div className="px-8 py-6 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">Custom Fields</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Define custom fields to capture additional information for your
                        business objects
                    </p>
                </div>
                <CustomFieldsSettings
                    tenantId={session.user.tenantId}
                    companyFields={companyFields}
                    contactFields={contactFields}
                    catalogItemFields={catalogItemFields}
                    quoteFields={quoteFields}
                />
            </div>
        </div>
    );
}
