"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import { cn } from "@/lib/utils";

interface CustomFieldsFormSectionProps {
    fields: CustomFieldDefinition[];
    values: Record<string, unknown>;
    onChange: (fieldKey: string, value: unknown) => void;
}

export function CustomFieldsFormSection({
    fields,
    values,
    onChange,
}: CustomFieldsFormSectionProps) {
    if (fields.length === 0) {
        return null;
    }

    const renderField = (field: CustomFieldDefinition) => {
        const value = values[field.fieldKey];

        switch (field.dataType) {
            case "string":
                return (
                    <Input
                        value={(value as string) || ""}
                        onChange={(e) => onChange(field.fieldKey, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-9"
                    />
                );

            case "longtext":
                return (
                    <Textarea
                        value={(value as string) || ""}
                        onChange={(e) => onChange(field.fieldKey, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        rows={3}
                    />
                );

            case "number":
            case "currency":
                return (
                    <Input
                        type="number"
                        value={(value as number) || ""}
                        onChange={(e) =>
                            onChange(field.fieldKey, parseFloat(e.target.value) || 0)
                        }
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-9"
                    />
                );

            case "boolean":
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={(value as boolean) || false}
                            onCheckedChange={(checked) => onChange(field.fieldKey, checked)}
                        />
                        <Label className="text-sm font-normal cursor-pointer">
                            {field.description || field.label}
                        </Label>
                    </div>
                );

            case "date":
            case "datetime":
                return (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-9 w-full pl-3 text-left font-normal",
                                    !value && "text-muted-foreground",
                                )}
                            >
                                {value ? (
                                    format(new Date(value as string), "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={value ? new Date(value as string) : undefined}
                                onSelect={(date) =>
                                    onChange(field.fieldKey, date?.toISOString())
                                }
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                );

            case "email":
                return (
                    <Input
                        type="email"
                        value={(value as string) || ""}
                        onChange={(e) => onChange(field.fieldKey, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-9"
                    />
                );

            case "phone":
                return (
                    <Input
                        type="tel"
                        value={(value as string) || ""}
                        onChange={(e) => onChange(field.fieldKey, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-9"
                    />
                );

            case "url":
                return (
                    <Input
                        type="url"
                        value={(value as string) || ""}
                        onChange={(e) => onChange(field.fieldKey, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-9"
                    />
                );

            case "enum":
                if (!field.optionSet?.options) return null;
                return (
                    <Select
                        value={(value as string) || ""}
                        onValueChange={(val) => onChange(field.fieldKey, val)}
                    >
                        <SelectTrigger className="h-9">
                            <SelectValue
                                placeholder={`Select ${field.label.toLowerCase()}`}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {field.optionSet.options.map((option) => (
                                <SelectItem key={option.id} value={option.optionKey}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case "multienum":
                // For now, render as text input for comma-separated values
                // Could be enhanced with a multi-select component
                return (
                    <Input
                        value={Array.isArray(value) ? value.join(", ") : ""}
                        onChange={(e) =>
                            onChange(
                                field.fieldKey,
                                e.target.value.split(",").map((v) => v.trim()),
                            )
                        }
                        placeholder={`Select ${field.label.toLowerCase()} (comma-separated)`}
                        className="h-9"
                    />
                );

            default:
                return (
                    <Input
                        value={(value as string) || ""}
                        onChange={(e) => onChange(field.fieldKey, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="h-9"
                    />
                );
        }
    };

    return (
        <div className="space-y-4 border-t pt-6">
            <h3 className="text-sm font-medium">Custom Fields</h3>
            <div className="grid gap-4">
                {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                        <Label className="text-sm font-medium">
                            {field.label}
                            {field.required && (
                                <span className="text-destructive ml-1">*</span>
                            )}
                        </Label>
                        {field.description && (
                            <p className="text-xs text-muted-foreground">
                                {field.description}
                            </p>
                        )}
                        {renderField(field)}
                    </div>
                ))}
            </div>
        </div>
    );
}
