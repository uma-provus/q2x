import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { contacts, tenants } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function ContactsPage() {
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

    const allContacts = await db.query.contacts.findMany({
        where: eq(contacts.tenantId, session.user.tenantId),
        orderBy: (contacts, { desc }) => [desc(contacts.createdAt)],
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Contacts</h1>
            </div>
            <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                    Contacts feature coming soon. Total contacts: {allContacts.length}
                </p>
            </div>
        </div>
    );
}
