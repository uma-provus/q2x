"use client";

import { Layers, Settings, Type } from "lucide-react";
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
import {
    CatalogTypesSection,
    UnitTypesSection,
} from "@/features/settings/components/catalog-settings-form";
import type { CatalogSettings } from "@/features/settings/types";

const navItems = [
    { name: "Catalog Types", icon: Type, id: "types" },
    { name: "Unit Types", icon: Layers, id: "units" },
];

interface CatalogConfigDialogProps {
    settings: CatalogSettings;
    tenantId: string;
    children?: React.ReactNode;
}

export function CatalogConfigDialog({
    settings,
    tenantId,
    children,
}: CatalogConfigDialogProps) {
    const [open, setOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("types");

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
                <DialogTitle className="sr-only">Catalog Configuration</DialogTitle>
                <DialogDescription className="sr-only">
                    Configure catalog types, units, and custom fields.
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
                                        <BreadcrumbLink>Catalog</BreadcrumbLink>
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
                            {activeSection === "types" && (
                                <CatalogTypesSection settings={settings} />
                            )}
                            {activeSection === "units" && (
                                <UnitTypesSection settings={settings} />
                            )}
                        </div>
                    </main>
                </SidebarProvider>
            </DialogContent>
        </Dialog>
    );
}
