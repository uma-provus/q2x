import type { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { SettingsTabs } from "@/features/settings/components/settings-tabs";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your account settings and set e-mail preferences.",
};

const tabItems = [
    {
        title: "General",
        href: "/settings/general",
        description: "Manage your organization profile and settings.",
    },
    {
        title: "Customize",
        href: "/settings/customize",
        description: "Customize your catalog items and units.",
    },
];

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    return (
        <div className="hidden md:block h-[calc(100%+2rem)] -m-4">
            <div className="flex flex-col lg:flex-row h-full">
                <aside className="lg:w-1/5 py-6 px-4">
                    <SettingsTabs items={tabItems} />
                </aside>
                <Separator orientation="vertical" className="hidden h-full lg:block" />
                <div className="flex-1 w-full px-6 py-6">{children}</div>
            </div>
        </div>
    );
}
