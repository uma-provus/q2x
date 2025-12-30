"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { createCustomField } from "@/features/settings/actions/create-custom-field";
import { deleteCustomField } from "@/features/settings/actions/delete-custom-field";
import { updateCustomField } from "@/features/settings/actions/update-custom-field";
import type {
    CustomFieldDefinition,
    DataType,
    EntityType,
} from "@/lib/custom-fields";

const dataTypeOptions: { value: DataType; label: string }[] = [
    { value: "string", label: "Text" },
    { value: "longtext", label: "Long Text" },
    { value: "number", label: "Number" },
    { value: "currency", label: "Currency" },
    { value: "boolean", label: "Yes/No" },
    { value: "date", label: "Date" },
    { value: "datetime", label: "Date & Time" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "url", label: "URL" },
    { value: "enum", label: "Dropdown (Single)" },
    { value: "multienum", label: "Dropdown (Multiple)" },
];

interface CustomFieldsManagementProps {
    entityType: EntityType;
    tenantId: string;
    initialFields: CustomFieldDefinition[];
}

export function CustomFieldsManagement({
    entityType,
    tenantId,
    initialFields,
}: CustomFieldsManagementProps) {
    const [fields, setFields] = useState<CustomFieldDefinition[]>(initialFields);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingField, setEditingField] =
        useState<CustomFieldDefinition | null>(null);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        fieldKey: "",
        label: "",
        description: "",
        dataType: "string" as DataType,
        required: false,
        searchable: false,
    });

    useEffect(() => {
        setFields(initialFields);
    }, [initialFields, entityType]);

    const handleSubmit = async () => {
        if (!formData.label.trim()) {
            toast.error("Please enter a field label");
            return;
        }

        if (!formData.fieldKey.trim()) {
            toast.error("Please enter a field key");
            return;
        }

        startTransition(async () => {
            if (editingField) {
                const result = await updateCustomField({
                    id: editingField.id,
                    label: formData.label,
                    description: formData.description,
                    dataType: formData.dataType,
                    required: formData.required,
                    searchable: formData.searchable,
                });

                if (result.success) {
                    toast.success("Custom field updated successfully");
                    setIsDialogOpen(false);
                    resetForm();
                } else {
                    toast.error(result.error || "Failed to update custom field");
                }
            } else {
                const result = await createCustomField({
                    tenantId,
                    entityType,
                    fieldKey: formData.fieldKey,
                    label: formData.label,
                    description: formData.description,
                    dataType: formData.dataType,
                    required: formData.required,
                    searchable: formData.searchable,
                });

                if (result.success) {
                    toast.success("Custom field created successfully");
                    setIsDialogOpen(false);
                    resetForm();
                } else {
                    toast.error(result.error || "Failed to create custom field");
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            fieldKey: "",
            label: "",
            description: "",
            dataType: "string",
            required: false,
            searchable: false,
        });
        setEditingField(null);
    };

    const handleEdit = (field: CustomFieldDefinition) => {
        setEditingField(field);
        setFormData({
            fieldKey: field.fieldKey,
            label: field.label,
            description: field.description || "",
            dataType: field.dataType,
            required: field.required,
            searchable: field.searchable,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (fieldId: string) => {
        if (!confirm("Are you sure you want to delete this custom field?")) {
            return;
        }

        startTransition(async () => {
            const result = await deleteCustomField(fieldId);

            if (result.success) {
                toast.success("Custom field deleted successfully");
            } else {
                toast.error(result.error || "Failed to delete custom field");
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Custom Fields</h3>
                    <p className="text-muted-foreground text-sm">
                        Add custom fields for additional information.
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} size="sm">
                    <Plus className="mr-2 size-4" />
                    Add Field
                </Button>
            </div>

            {fields.length === 0 ? (
                <div className="border-border bg-muted/50 flex h-48 items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                        <p className="text-muted-foreground text-sm">
                            No custom fields yet
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                            className="mt-2"
                        >
                            <Plus className="mr-2 size-4" />
                            Create your first field
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {fields.map((field) => (
                        <div
                            key={field.id}
                            className="border-border hover:border-foreground/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{field.label}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {
                                            dataTypeOptions.find((t) => t.value === field.dataType)
                                                ?.label
                                        }
                                    </Badge>
                                    {field.required && (
                                        <Badge variant="secondary" className="text-xs">
                                            Required
                                        </Badge>
                                    )}
                                </div>
                                {field.description && (
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {field.description}
                                    </p>
                                )}
                                <p className="text-muted-foreground mt-1 text-xs font-mono">
                                    {field.fieldKey}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(field)}
                                >
                                    <Edit2 className="size-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(field.id)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingField ? "Edit Field" : "Create Custom Field"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingField
                                ? "Update the custom field settings."
                                : "Add a new custom field to capture additional information."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="label">Field Label *</Label>
                            <Input
                                id="label"
                                value={formData.label}
                                onChange={(e) =>
                                    setFormData({ ...formData, label: e.target.value })
                                }
                                placeholder="e.g., Lead Score"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fieldKey">
                                Field Key * {editingField && "(Cannot be changed)"}
                            </Label>
                            <Input
                                id="fieldKey"
                                value={formData.fieldKey}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        fieldKey: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                                    })
                                }
                                placeholder="e.g., lead_score"
                                disabled={!!editingField}
                                className="font-mono"
                            />
                            <p className="text-muted-foreground text-xs">
                                Unique identifier (snake_case, immutable after creation)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataType">Data Type *</Label>
                            <Select
                                value={formData.dataType}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, dataType: value as DataType })
                                }
                                disabled={!!editingField}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {dataTypeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editingField && (
                                <p className="text-muted-foreground text-xs">
                                    Data type cannot be changed after creation
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Optional description or help text"
                                rows={2}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="required">Required field</Label>
                            <Switch
                                id="required"
                                checked={formData.required}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, required: checked })
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="searchable">Searchable</Label>
                            <Switch
                                id="searchable"
                                checked={formData.searchable}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, searchable: checked })
                                }
                            />
                        </div>

                        {(formData.dataType === "enum" ||
                            formData.dataType === "multienum") && (
                                <div className="bg-muted rounded-lg p-4">
                                    <p className="text-muted-foreground text-sm">
                                        Enum fields require an option set. Please create or select an
                                        option set in the Option Sets section.
                                    </p>
                                </div>
                            )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                resetForm();
                            }}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isPending}>
                            {isPending ? "Saving..." : editingField ? "Update Field" : "Create Field"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
