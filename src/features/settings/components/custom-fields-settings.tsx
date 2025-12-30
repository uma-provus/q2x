"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomFieldsManagement } from "@/features/settings/components/custom-fields-management";
import type { CustomFieldDefinition, EntityType } from "@/lib/custom-fields";

interface CustomFieldsSettingsProps {
    tenantId: string;
    companyFields: CustomFieldDefinition[];
    contactFields: CustomFieldDefinition[];
    catalogItemFields: CustomFieldDefinition[];
    quoteFields: CustomFieldDefinition[];
}

const entityTabs: Array<{ value: EntityType; label: string }> = [
    { value: "company", label: "Companies" },
    { value: "contact", label: "Contacts" },
    { value: "catalog_item", label: "Catalog Items" },
    { value: "quote", label: "Quotes" },
];

export function CustomFieldsSettings({
    tenantId,
    companyFields,
    contactFields,
    catalogItemFields,
    quoteFields,
}: CustomFieldsSettingsProps) {
    const [activeTab, setActiveTab] = useState<EntityType>("company");

    const fieldsByEntity = {
        company: companyFields,
        contact: contactFields,
        catalog_item: catalogItemFields,
        quote: quoteFields,
    };

    return (
        <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as EntityType)}
        >
            <TabsList className="grid w-full grid-cols-4">
                {entityTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {entityTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-6">
                    <CustomFieldsManagement
                        entityType={tab.value}
                        tenantId={tenantId}
                        initialFields={fieldsByEntity[tab.value]}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}
