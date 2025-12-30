import { auth } from "@/lib/auth";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) return null;

    return (
        <div className="px-8 py-6 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">Profile</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your personal information and account settings
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                            type="text"
                            defaultValue={session.user.name || ""}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            readOnly
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First name</label>
                            <input
                                type="text"
                                placeholder="First name"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                readOnly
                            />
                            <p className="text-xs text-muted-foreground">Coming soon</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last name</label>
                            <input
                                type="text"
                                placeholder="Last name"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                readOnly
                            />
                            <p className="text-xs text-muted-foreground">Coming soon</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            defaultValue={session.user.email || ""}
                            className="w-full px-3 py-2 border rounded-md bg-background"
                            readOnly
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted"
                            disabled
                        >
                            Reset Password
                        </button>
                        <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
