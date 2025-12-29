import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { NotificationsForm } from "@/features/settings/components/notifications-form";
import {
    DEFAULT_NOTIFICATIONS_SETTINGS,
    type NotificationsSettings,
} from "@/features/settings/types";
import { auth } from "@/lib/auth";

export default async function SettingsNotificationsPage() {
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

    const notificationSettings =
        (tenant.notificationSettings as NotificationsSettings) ||
        DEFAULT_NOTIFICATIONS_SETTINGS;

    return (
        <div className="space-y-6">
            <NotificationsForm initialData={notificationSettings} />
        </div>
    );
}
