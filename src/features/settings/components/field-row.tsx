"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import { EditFieldDialog } from "./edit-field-dialog";

interface FieldRowProps {
    field: {
        name: string;
        fieldType: string;
        dataType: string;
        isCustom: boolean;
        id: string;
        fieldData?: CustomFieldDefinition;
    };
    entityType: string;
    tenantId: string;
}

export function FieldRow({ field, entityType, tenantId }: FieldRowProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => field.isCustom && setIsEditOpen(true)}
                className="grid grid-cols-3 gap-4 px-4 py-3 text-sm hover:bg-muted/50 transition-colors w-full text-left disabled:cursor-default"
                disabled={!field.isCustom}
            >
                <div className="font-medium">{field.name}</div>
                <div className="text-muted-foreground">
                    <span
                        className={
                            field.fieldType === "Custom"
                                ? "inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"
                                : "inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                        }
                    >
                        {field.fieldType}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{field.dataType}</span>
                    {field.isCustom && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
            </button>

            {field.isCustom && field.fieldData && (
                <EditFieldDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    field={field.fieldData}
                    entityType={entityType}
                    tenantId={tenantId}
                />
            )}
        </>
    );
}
