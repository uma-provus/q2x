import { CatalogTable } from "@/features/catalogs/components/catalog-table";
import { getCatalogs } from "@/features/catalogs/queries/get-catalogs";
import { auth } from "@/lib/auth";
import { getCustomFieldsForEntity } from "@/lib/custom-fields";

interface CatalogsPageProps {
    searchParams: Promise<{
        page?: string;
    }>;
}

export default async function CatalogsPage({ searchParams }: CatalogsPageProps) {
    const session = await auth();
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const { data, meta, settings } = await getCatalogs({ page, pageSize: 25 });

    const customFields = session?.user?.tenantId
        ? await getCustomFieldsForEntity(session.user.tenantId, "catalog_item")
        : [];

    return (
        <div className="flex flex-col gap-4">
            <CatalogTable
                data={data}
                meta={meta}
                settings={settings}
                tenantId={session?.user?.tenantId || ""}
                customFields={customFields}
            />
        </div>
    );
}
