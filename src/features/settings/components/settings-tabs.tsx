"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsTabsProps {
    items: {
        href: string;
        title: string;
    }[];
}

export function SettingsTabs({ items }: SettingsTabsProps) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1">
            {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "relative px-3 py-2 text-sm rounded-md transition-colors",
                            isActive
                                ? "bg-secondary text-secondary-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                    >
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
