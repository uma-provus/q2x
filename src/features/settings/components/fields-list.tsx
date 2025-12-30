"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import { FieldRow } from "./field-row";
import { NewFieldDialog } from "./new-field-dialog";

const STANDARD_FIELDS = {
    companies: [
        { name: "Name", fieldType: "Standard", dataType: "Text" },
        { name: "Website", fieldType: "Standard", dataType: "Links" },
        { name: "Address", fieldType: "Standard", dataType: "Address" },
        { name: "City", fieldType: "Standard", dataType: "Text" },
        { name: "State", fieldType: "Standard", dataType: "Text" },
        { name: "Country", fieldType: "Standard", dataType: "Text" },
        { name: "Postal Code", fieldType: "Standard", dataType: "Text" },
        { name: "Tags", fieldType: "Standard", dataType: "Multi-select" },
        { name: "Created at", fieldType: "Standard", dataType: "Date and Time" },
        { name: "Updated at", fieldType: "Standard", dataType: "Date and Time" },
    ],
    contacts: [
        { name: "Name", fieldType: "Standard", dataType: "Full Name" },
        { name: "Email", fieldType: "Standard", dataType: "Emails" },
        { name: "Phone", fieldType: "Standard", dataType: "Phones" },
        { name: "Company", fieldType: "Standard", dataType: "Relation" },
        { name: "Title", fieldType: "Standard", dataType: "Text" },
        { name: "Tags", fieldType: "Standard", dataType: "Multi-select" },
        { name: "Created at", fieldType: "Standard", dataType: "Date and Time" },
        { name: "Updated at", fieldType: "Standard", dataType: "Date and Time" },
    ],
    catalog_items: [
        { name: "Name", fieldType: "Standard", dataType: "Text" },
        { name: "Description", fieldType: "Standard", dataType: "Text" },
        { name: "Type", fieldType: "Standard", dataType: "Select" },
        { name: "Unit Cost", fieldType: "Standard", dataType: "Currency" },
        { name: "Unit Price", fieldType: "Standard", dataType: "Currency" },
        { name: "Unit Type", fieldType: "Standard", dataType: "Select" },
        { name: "Tags", fieldType: "Standard", dataType: "Multi-select" },
        { name: "Created at", fieldType: "Standard", dataType: "Date and Time" },
    ],
    quotes: [
        { name: "Quote Number", fieldType: "Standard", dataType: "Text" },
        { name: "Title", fieldType: "Standard", dataType: "Text" },
        { name: "Customer Name", fieldType: "Standard", dataType: "Text" },
        { name: "Status", fieldType: "Standard", dataType: "Select" },
        { name: "Total Amount", fieldType: "Standard", dataType: "Currency" },
        { name: "Currency", fieldType: "Standard", dataType: "Select" },
        { name: "Valid Until", fieldType: "Standard", dataType: "Date" },
        { name: "Notes", fieldType: "Standard", dataType: "Text" },
        { name: "Tags", fieldType: "Standard", dataType: "Multi-select" },
        { name: "Created at", fieldType: "Standard", dataType: "Date and Time" },
    ],
};

const DATA_TYPE_MAP: Record<string, string> = {
    string: "Text",
    longtext: "Text",
    number: "Number",
    currency: "Currency",
    boolean: "True/False",
    date: "Date",
    datetime: "Date and Time",
    email: "Emails",
    phone: "Phones",
    url: "Links",
    enum: "Select",
    multienum: "Multi-select",
    json: "JSON",
};

interface FieldsListProps {
    entityType: "companies" | "contacts" | "catalog_items" | "quotes";
    customFields: CustomFieldDefinition[];
    tenantId: string;
}

export function FieldsList({ entityType, customFields, tenantId }: FieldsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isNewFieldOpen, setIsNewFieldOpen] = useState(false);

    const standardFields = STANDARD_FIELDS[entityType] || [];

    const allFields = [
        ...standardFields.map((field) => ({
            ...field,
            isCustom: false,
            id: field.name,
        })),
        ...customFields.map((field) => ({
            name: field.label,
            fieldType: "Custom",
            dataType: DATA_TYPE_MAP[field.dataType] || field.dataType,
            isCustom: true,
            id: field.id,
            fieldData: field,
        })),
    ];

    const filteredFields = allFields.filter((field) =>
        field.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="flex-1 overflow-y-auto">
                <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-medium">Fields</h2>
                        <Button size="sm" onClick={() => setIsNewFieldOpen(true)}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Field
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search a field..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="border rounded-lg">
                        <div className="grid grid-cols-3 gap-4 px-4 py-2 border-b bg-muted/50 text-sm font-medium text-muted-foreground">
                            <div>Name</div>
                            <div>Field type</div>
                            <div>Data type</div>
                        </div>
                        <div className="divide-y">
                            {filteredFields.map((field) => (
                                <FieldRow
                                    key={field.id}
                                    field={field}
                                    entityType={entityType}
                                    tenantId={tenantId}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <NewFieldDialog
                open={isNewFieldOpen}
                onOpenChange={setIsNewFieldOpen}
                entityType={entityType}
                tenantId={tenantId}
            />
        </>
    );
}
