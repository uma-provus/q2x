import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="text-lg font-medium">Total Quotes</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h3 className="text-lg font-medium">Active Customers</h3>
                    <p className="text-3xl font-bold">0</p>
                </div>
            </div>
        </div>
    );
}
