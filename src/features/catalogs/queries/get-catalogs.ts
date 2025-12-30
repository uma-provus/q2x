import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { catalogItems } from "@/db/schema";
import { auth } from "@/lib/auth";
import { loadCatalogSettings } from "@/lib/settings/load-settings";

export interface GetCatalogsParams {
    page?: number;
    pageSize?: number;
}

export async function getCatalogs({
    page = 1,
    pageSize = 10,
}: GetCatalogsParams = {}) {
    const session = await auth();
    if (!session?.user?.tenantId) {
        throw new Error("Unauthorized");
    }

    const offset = (page - 1) * pageSize;

    const [items, totalCount, settings] = await Promise.all([
        db.query.catalogItems.findMany({
            where: eq(catalogItems.tenantId, session.user.tenantId),
            orderBy: (catalogItems, { desc }) => [desc(catalogItems.createdAt)],
            limit: pageSize,
            offset: offset,
        }),
        db
            .select({ count: count() })
            .from(catalogItems)
            .where(eq(catalogItems.tenantId, session.user.tenantId))
            .then((res) => res[0].count),
        loadCatalogSettings(session.user.tenantId),
    ]);

    return {
        data: items,
        meta: {
            page,
            pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        },
        settings,
    };
}
