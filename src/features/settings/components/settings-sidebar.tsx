"use client";

import {
    Building2,
    Database,
    Palette,
    Settings,
    User,
    Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type * as React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const settingsNav = [
    {
        title: "User",
        items: [
            {
                title: "Profile",
                href: "/settings/profile",
                icon: User,
            },
            {
                title: "Experience",
                href: "/settings/experience",
                icon: Palette,
            },
        ],
    },
    {
        title: "Organization",
        items: [
            {
                title: "General",
                href: "/settings/general",
                icon: Settings,
            },
            {
                title: "Data model",
                href: "/settings/data-model",
                icon: Database,
            },
            {
                title: "Members",
                href: "/settings/members",
                icon: Users,
            },
        ],
    },
];

export function SettingsSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar
            collapsible="none"
            className="border-r bg-transparent h-full"
            {...props}
        >
            <SidebarContent className="bg-transparent h-full gap-2">
                {settingsNav.map((section) => {
                    return (
                        <SidebarGroup key={section.title} className="py-2">
                            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 h-7">
                                {section.title}
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu className="gap-0.5">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <SidebarMenuItem key={item.href}>
                                                <SidebarMenuButton
                                                    asChild
                                                    isActive={pathname === item.href}
                                                    className="h-9"
                                                >
                                                    <Link href={item.href}>
                                                        <Icon className="h-4 w-4" />
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>
        </Sidebar>
    );
}
