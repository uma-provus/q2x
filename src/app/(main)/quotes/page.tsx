import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function QuotesPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="p-6 border rounded-lg shadow-sm bg-card">
                <p className="text-muted-foreground">Quotes management will be implemented here.</p>
            </div>
        </div>
    );
}
