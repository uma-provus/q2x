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
    customers: "Customers",
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
            <BreadcrumbList>
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
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
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
