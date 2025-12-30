import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { TenantSettingsForm } from "@/features/settings/components/tenant-settings-form";
import { auth } from "@/lib/auth";

export default async function SettingsGeneralPage() {
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

    return (
        <div className="px-8 py-6 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">General</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your organization settings
                    </p>
                </div>
                <TenantSettingsForm
                    initialData={{
                        name: tenant.name,
                        slug: tenant.slug,
                    }}
                />
            </div>
        </div>
    );
}
