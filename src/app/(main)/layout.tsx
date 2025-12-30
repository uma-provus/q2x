import { eq } from "drizzle-orm";
import { Bell, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { NavUser } from "@/components/layout/nav-user";
import { Button } from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
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
            <AppSidebar tenantName={tenant?.name || "Q2X"} />
            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 px-4 border-b justify-between">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                    </div>

                    <div className="flex-1 flex justify-center max-w-xl mx-auto">
                        <InputGroup className="w-full md:w-75 lg:w-100">
                            <InputGroupAddon>
                                <Search className="h-4 w-4" />
                            </InputGroupAddon>
                            <InputGroupInput placeholder="Search..." />
                        </InputGroup>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                        <NavUser
                            user={{
                                name: session.user.name || "User",
                                email: session.user.email || "",
                                avatar: session.user.image || "",
                            }}
                        />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
