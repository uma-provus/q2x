"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
    {
        value: "light",
        label: "Light",
        description: "Clean, bright interface",
        icon: Sun,
    },
    {
        value: "dark",
        label: "Dark",
        description: "Easy on the eyes",
        icon: Moon,
    },
    {
        value: "system",
        label: "System",
        description: "Match your device settings",
        icon: Monitor,
    },
];

export default function ExperiencePage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="px-8 py-6 max-w-4xl">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-xl font-semibold">Experience</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Customize your workspace appearance and preferences
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-base font-semibold mb-2">Theme</h2>
                            <div className="space-y-3 max-w-2xl">
                                {themes.map((themeOption) => {
                                    const Icon = themeOption.icon;
                                    return (
                                        <div
                                            key={themeOption.value}
                                            className="w-full flex items-center gap-4 rounded-lg border p-4"
                                        >
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground" />
                                            <Icon className="h-5 w-5" />
                                            <div className="flex-1">
                                                <div className="font-medium">{themeOption.label}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {themeOption.description}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-8 py-6 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">Experience</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customize your workspace appearance and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h2 className="text-base font-semibold mb-2">Theme</h2>
                        <div className="space-y-3 max-w-2xl">
                            {themes.map((themeOption) => {
                                const Icon = themeOption.icon;
                                const isSelected = theme === themeOption.value;
                                return (
                                    <button
                                        key={themeOption.value}
                                        type="button"
                                        onClick={() => {
                                            setTheme(themeOption.value);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-4 rounded-lg border p-4 transition-colors text-left",
                                            "hover:bg-accent",
                                            isSelected && "border-primary bg-accent",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                                isSelected
                                                    ? "border-primary"
                                                    : "border-muted-foreground",
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <Icon className="h-5 w-5" />
                                        <div className="flex-1">
                                            <div className="font-medium">{themeOption.label}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {themeOption.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
