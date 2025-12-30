import { Package } from "lucide-react";
import Link from "next/link";
import { FieldsList } from "@/features/settings/components/fields-list";
import { auth } from "@/lib/auth";
import { getCustomFieldsForEntity } from "@/lib/custom-fields/get-custom-fields";

export default async function CatalogItemsFieldsPage() {
    const session = await auth();
    if (!session?.user?.tenantId) return null;

    const customFields = await getCustomFieldsForEntity(
        session.user.tenantId,
        "catalog_items",
    );

    return (
        <div className="h-full flex flex-col">
            <div className="border-b px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/settings/data-model" className="hover:text-foreground">
                        Data model
                    </Link>
                    <span>/</span>
                    <span>Catalog Items</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-background">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Catalog Items</h1>
                        <p className="text-sm text-muted-foreground">
                            Customize the fields available in the Catalog Item views
                        </p>
                    </div>
                </div>
            </div>

            <FieldsList
                entityType="catalog_items"
                customFields={customFields}
                tenantId={session.user.tenantId}
            />
        </div>
    );
}
