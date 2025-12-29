import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">Q2X Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {session.user?.name}</span>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium">Total Quotes</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 border rounded-lg shadow-sm">
            <h3 className="text-lg font-medium">Active Customers</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
