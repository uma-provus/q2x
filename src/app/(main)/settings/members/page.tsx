import { auth } from "@/lib/auth";

export default async function MembersPage() {
    const session = await auth();
    if (!session?.user) return null;

    return (
        <div className="px-8 py-6 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">Members</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage organization members and their roles
                    </p>
                </div>

                <div className="border rounded-lg p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Member management coming soon
                    </p>
                </div>
            </div>
        </div>
    );
}
