"use client";

import { FileText, Settings } from "lucide-react";
import { useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar";
import { QuoteStatusesSection } from "@/features/settings/components/quote-settings-form";
import type { QuoteSettings } from "@/features/settings/types";

const navItems = [
    { name: "Quote Statuses", icon: FileText, id: "statuses" },
    { name: "Custom Fields", icon: Settings, id: "fields" },
];

interface QuoteConfigDialogProps {
    settings: QuoteSettings;
    children?: React.ReactNode;
}

export function QuoteConfigDialog({ settings, children }: QuoteConfigDialogProps) {
    const [open, setOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("statuses");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[700px] lg:max-w-[900px]">
                <DialogTitle className="sr-only">Quote Configuration</DialogTitle>
                <DialogDescription className="sr-only">
                    Configure quote workflow settings and statuses.
                </DialogDescription>
                <SidebarProvider className="items-start">
                    <Sidebar collapsible="none" className="hidden md:flex">
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupLabel>Setup</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu className="gap-1">
                                        {navItems.map((item) => (
                                            <SidebarMenuItem key={item.id}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={item.id === activeSection}
                                                >
                                                    <button onClick={() => setActiveSection(item.id)}>
                                                        <item.icon />
                                                        <span>{item.name}</span>
                                                    </button>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                    <main className="flex h-[540px] flex-1 flex-col overflow-hidden">
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink>Quote</BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>
                                            {navItems.find((item) => item.id === activeSection)?.name}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </header>
                        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                            {activeSection === "statuses" && (
                                <QuoteStatusesSection initialData={settings} />
                            )}
                            {activeSection === "fields" && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium">Custom Fields</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Add custom fields to your quotes for additional
                                            information.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-dashed p-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Custom fields feature coming soon
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
    );
}
