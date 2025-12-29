import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch tenant information
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, session.user.tenantId),
    });

    return (
        <SidebarProvider>
            <AppSidebar
                tenantName={tenant?.name || "Q2X"}
                user={{
                    name: session.user.name || "User",
                    email: session.user.email || "",
                    avatar: session.user.image || "",
                }}
            />
            <SidebarInset>
                <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4 mt-4"
                    />
                    <AppBreadcrumb />
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
