import { CatalogTable } from "@/features/catalogs/components/catalog-table";
import { getCatalogs } from "@/features/catalogs/queries/get-catalogs";

interface CatalogsPageProps {
    searchParams: Promise<{
        page?: string;
    }>;
}

export default async function CatalogsPage({ searchParams }: CatalogsPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const { data, meta, settings } = await getCatalogs({ page, pageSize: 25 });

    return (
        <div className="flex flex-col gap-4">
            <CatalogTable data={data} meta={meta} settings={settings} />
        </div>
    );
}
