import { Building2, FileText, Package, Users } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";

const objects = [
    {
        id: "companies",
        name: "Companies",
        icon: Building2,
        description: "Organizations and business entities",
        href: "/settings/data-model/companies",
        fieldCount: 17,
    },
    {
        id: "contacts",
        name: "Contacts",
        icon: Users,
        description: "People and individual contacts",
        href: "/settings/data-model/contacts",
        fieldCount: 15,
    },
    {
        id: "catalog_items",
        name: "Catalog Items",
        icon: Package,
        description: "Products, services, and resources",
        href: "/settings/data-model/catalog_items",
        fieldCount: 12,
    },
    {
        id: "quotes",
        name: "Quotes",
        icon: FileText,
        description: "Proposals and quotations",
        href: "/settings/data-model/quotes",
        fieldCount: 14,
    },
];

export default async function DataModelPage() {
    const session = await auth();
    if (!session?.user) return null;

    return (
        <div className="px-8 py-6 max-w-4xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">Data model</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customize fields for your business objects
                    </p>
                </div>

                <div className="space-y-1">
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">
                        Existing objects
                    </h2>
                    <div className="border rounded-lg divide-y">
                        {objects.map((object) => {
                            const Icon = object.icon;
                            return (
                                <Link
                                    key={object.id}
                                    href={object.href}
                                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background">
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{object.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {object.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground">
                                            {object.fieldCount} fields
                                        </span>
                                        <svg
                                            className="h-5 w-5 text-muted-foreground"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
