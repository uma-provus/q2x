import type { Metadata } from "next";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SettingsSidebar } from "@/features/settings/components/settings-sidebar";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your account settings and preferences.",
};

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="h-[calc(100%+2rem)] -m-4">
            <SidebarProvider
                className="h-full"
                style={
                    {
                        "--sidebar-width": "280px",
                    } as React.CSSProperties
                }
            >
                <SettingsSidebar />
                <SidebarInset className="h-full">
                    <div className="flex-1 overflow-y-auto">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
