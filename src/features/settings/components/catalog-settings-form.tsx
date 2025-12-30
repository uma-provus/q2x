"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateCatalogSettings } from "../actions/update-catalog-settings";
import { type CatalogSettings, catalogSettingsSchema } from "../types";

const PRESET_COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#f59e0b", // amber-500
    "#eab308", // yellow-500
    "#84cc16", // lime-500
    "#22c55e", // green-500
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#0ea5e9", // sky-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#8b5cf6", // violet-500
    "#a855f7", // purple-500
    "#d946ef", // fuchsia-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
];

interface CatalogSettingsFormProps {
    initialData: CatalogSettings;
}

export function CatalogSettingsForm({ initialData }: CatalogSettingsFormProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
            <CatalogTypesSection settings={initialData} />
            <UnitTypesSection settings={initialData} />
        </div>
    );
}

interface SectionProps {
    settings: CatalogSettings;
}

export function CatalogTypesSection({ settings }: SectionProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTypeName, setNewTypeName] = useState("");
    const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);
    const form = useForm({
        resolver: zodResolver(catalogSettingsSchema),
        defaultValues: settings,
    });

    const {
        fields: typeFields,
        append: appendType,
        remove: removeType,
    } = useFieldArray({
        control: form.control,
        name: "types",
    });

    async function onSubmit(data: CatalogSettings) {
        const result = await updateCatalogSettings(data);

        if (result.error) {
            toast.error(result.error);
        }
    }

    const handleSave = () => {
        form.handleSubmit(onSubmit)();
    };

    const handleAddType = () => {
        if (!newTypeName.trim()) return;

        const colorButton = document.getElementById('catalog-color-picker') as HTMLButtonElement;
        const selectedColor = colorButton?.style.backgroundColor || PRESET_COLORS[0];

        const newId = crypto.randomUUID();
        appendType({
            id: newId,
            name: newTypeName,
            key: `custom_${newId.split("-")[0]}`,
            isStandard: false,
            color: selectedColor,
        });
        setNewTypeName("");

        // Reset color picker to first color
        if (colorButton) {
            colorButton.style.backgroundColor = PRESET_COLORS[typeFields.length % PRESET_COLORS.length];
        }

        setTimeout(handleSave, 0);
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">Catalog Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">{typeFields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg min-h-12">
                        <div className="flex-1 mr-4">
                            {editingId === field.id ? (
                                <div className="flex items-center gap-3">
                                    <Controller
                                        control={form.control}
                                        name={`types.${index}.color`}
                                        render={({ field: colorField }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="h-8 w-8 rounded-full border border-muted-foreground/20 shadow-sm transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0"
                                                        style={{ backgroundColor: colorField.value || "#000000" }}
                                                    />
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-3">
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {PRESET_COLORS.map((color) => (
                                                            <button
                                                                key={color}
                                                                type="button"
                                                                className={cn(
                                                                    "h-8 w-8 rounded-full border border-muted-foreground/10 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                                    colorField.value === color && "ring-2 ring-ring ring-offset-2"
                                                                )}
                                                                style={{ backgroundColor: color }}
                                                                onClick={() => {
                                                                    colorField.onChange(color);
                                                                    handleSave();
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    <Controller
                                        control={form.control}
                                        name={`types.${index}.name`}
                                        render={({ field: inputField, fieldState }) => (
                                            <div className="flex-1">
                                                <Input {...inputField} autoFocus className="h-9" />
                                                {fieldState.error && (
                                                    <span className="text-xs text-destructive mt-1">
                                                        {fieldState.error.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setEditingId(null);
                                            handleSave();
                                        }}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-3 w-3 rounded-full shrink-0"
                                        style={{ backgroundColor: form.watch(`types.${index}.color`) || "#000000" }}
                                    />
                                    <span className="text-base font-medium">
                                        {form.watch(`types.${index}.name`)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingId(field.id)}
                                aria-label="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            {form.getValues(`types.${index}.isStandard`) ? (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="h-8 w-8 flex items-center justify-center opacity-25">
                                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Default types cannot be deleted</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => setDeleteTypeId(field.id)}
                                    aria-label="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}</div>

                <div className="flex gap-2 mt-3">
                    <InputGroup className="flex-1 h-10">
                        <InputGroupAddon align="inline-start" className="pl-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        id="catalog-color-picker"
                                        className="h-4 w-4 rounded-full border border-muted-foreground/20 shadow-sm transition-all hover:scale-110 cursor-pointer"
                                        style={{ backgroundColor: PRESET_COLORS[0] }}
                                        aria-label="Select color"
                                    />
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-3">
                                    <div className="grid grid-cols-5 gap-2">
                                        {PRESET_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className="h-8 w-8 rounded-full border border-muted-foreground/10 transition-all hover:scale-110"
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    const colorButton = document.getElementById('catalog-color-picker');
                                                    if (colorButton) {
                                                        (colorButton as HTMLButtonElement).style.backgroundColor = color;
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </InputGroupAddon>
                        <Input
                            placeholder="Add new type..."
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddType();
                                }
                            }}
                            className="border-0 shadow-none focus-visible:ring-0 h-auto px-2"
                            data-slot="input-group-control"
                        />
                    </InputGroup>
                    <Button
                        type="button"
                        size="icon"
                        onClick={handleAddType}
                        disabled={!newTypeName.trim()}
                        className="h-10 w-10 shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <AlertDialog open={!!deleteTypeId} onOpenChange={(open) => !open && setDeleteTypeId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Catalog Type</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this catalog type? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const index = typeFields.findIndex((f) => f.id === deleteTypeId);
                                    if (index !== -1) {
                                        removeType(index);
                                        setTimeout(handleSave, 0);
                                    }
                                    setDeleteTypeId(null);
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

export function UnitTypesSection({ settings }: SectionProps) {
    const form = useForm({
        resolver: zodResolver(catalogSettingsSchema),
        defaultValues: settings,
    });

    const { fields: unitTypeFields } = useFieldArray({
        control: form.control,
        name: "unitTypes",
    });

    async function onSubmit(data: CatalogSettings) {
        const result = await updateCatalogSettings(data);

        if (result.error) {
            toast.error(result.error);
        }
    }

    const handleSave = () => {
        form.handleSubmit(onSubmit)();
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium">Pricing Units</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">{unitTypeFields.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg min-h-12">
                    <span className="text-base font-medium">
                        {form.getValues(`unitTypes.${index}.name`)}
                    </span>
                    <Controller
                        control={form.control}
                        name={`unitTypes.${index}.enabled`}
                        render={({ field }) => (
                            <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    handleSave();
                                }}
                            />
                        )}
                    />
                </div>
            ))}</CardContent>
        </Card>
    );
}
