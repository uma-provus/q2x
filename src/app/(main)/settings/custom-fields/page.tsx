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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Custom Fields</h3>
                <p className="text-muted-foreground text-sm">
                    Define custom fields to capture additional information for your
                    business objects.
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
    );
}
