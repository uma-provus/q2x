"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsTabsProps {
    items: {
        href: string;
        title: string;
        description?: string;
    }[];
}

export function SettingsTabs({ items }: SettingsTabsProps) {
    const pathname = usePathname();

    return (
        <Tabs orientation="vertical" value={pathname} className="w-full">
            <TabsList variant="line" className="w-full justify-start gap-1">
                {items.map((item) => (
                    <TabsTrigger
                        key={item.href}
                        value={item.href}
                        asChild
                        className="justify-start px-4 py-3 h-auto relative overflow-hidden data-[state=active]:after:hidden"
                    >
                        <Link href={item.href} className="flex flex-col items-start gap-1 w-full">
                            <div className="flex items-center w-full relative">
                                {pathname === item.href && (
                                    <div className="absolute -left-4 top-0.5 h-7 w-1 bg-primary rounded-r-full" />
                                )}
                                <span className={pathname === item.href ? "font-medium text-primary" : "font-medium"}>
                                    {item.title}
                                </span>
                            </div>
                            {item.description && (
                                <span className="text-xs text-muted-foreground text-wrap text-left font-normal">
                                    {item.description}
                                </span>
                            )}
                        </Link>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    );
}
