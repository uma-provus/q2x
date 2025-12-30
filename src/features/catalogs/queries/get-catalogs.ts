import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { catalogItems, tenants } from "@/db/schema";
import {
    type CatalogSettings,
    DEFAULT_CATALOG_SETTINGS,
} from "@/features/settings/types";
import { auth } from "@/lib/auth";

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

    const [items, totalCount, tenant] = await Promise.all([
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
        db.query.tenants.findFirst({
            where: eq(tenants.id, session.user.tenantId),
            columns: {
                catalogSchema: true,
            },
        }),
    ]);

    const settings =
        (tenant?.catalogSchema as CatalogSettings) || DEFAULT_CATALOG_SETTINGS;

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
