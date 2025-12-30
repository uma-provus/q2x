"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map of route segments to their display labels
// This allows us to override the default capitalization
export const routeMapping: Record<string, string> = {
    dashboard: "Dashboard",
    auth: "Authentication",
    login: "Login",
    signup: "Sign Up",
    quotes: "Quotes",
    companies: "Companies",
    contacts: "Contacts",
    catalogs: "Catalogs",
    settings: "Settings",
    general: "General",
    customize: "Customize",
    notifications: "Notifications",
};

export function AppBreadcrumb() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter((item) => item !== "");

    return (
        <Breadcrumb>
            <BreadcrumbList className="text-base sm:text-base">
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {segments.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                {segments.map((segment, index) => {
                    const href = `/${segments.slice(0, index + 1).join("/")}`;
                    const isLast = index === segments.length - 1;

                    // Use mapped title or fallback to capitalized segment
                    const title =
                        routeMapping[segment] ||
                        segment.charAt(0).toUpperCase() +
                        segment.slice(1).replace(/-/g, " ");

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem className="hidden md:block">
                                {isLast ? (
                                    <BreadcrumbPage className="font-semibold text-foreground">{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href} className="text-muted-foreground hover:text-foreground transition-colors">{title}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
