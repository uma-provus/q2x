"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateQuoteSettings } from "../actions/update-quote-settings";
import { type QuoteSettings, quoteSettingsSchema } from "../types";

interface QuoteSettingsFormProps {
    initialData: QuoteSettings;
}

function StatusItem({
    status,
    onEdit,
    onDelete,
}: {
    status: QuoteSettings["statuses"][number];
    onEdit: (newName: string) => void;
    onDelete: () => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(status.name);

    const handleSave = () => {
        if (editValue.trim()) {
            onEdit(editValue.trim());
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: status.color || "#3b82f6" }}
            />
            {isEditing ? (
                <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") {
                            setEditValue(status.name);
                            setIsEditing(false);
                        }
                    }}
                    className="h-8 flex-1"
                    autoFocus
                />
            ) : (
                <span className="flex-1">{status.name}</span>
            )}
            <div className="flex items-center gap-2">
                {!isEditing && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsEditing(true)}
                        aria-label="Edit"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
                {status.isStandard ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="h-8 w-8 flex items-center justify-center opacity-25">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Default statuses cannot be deleted</p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={onDelete}
                        aria-label="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export function QuoteSettingsForm({ initialData }: QuoteSettingsFormProps) {
    const colors = [
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#f59e0b",
        "#10b981",
        "#06b6d4",
        "#6366f1",
        "#f97316",
    ];

    const router = useRouter();
    const [deleteStatusId, setDeleteStatusId] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState(colors[0]);
    const [newStatusName, setNewStatusName] = useState("");
    const form = useForm({
        resolver: zodResolver(quoteSettingsSchema),
        defaultValues: initialData,
        mode: "onChange",
    });

    const {
        fields: statusFields,
        append: appendStatus,
        remove: removeStatus,
        update: updateStatus,
    } = useFieldArray({
        control: form.control,
        name: "statuses",
    });

    // Reset form when initialData changes (e.g., after refresh)
    useEffect(() => {
        form.reset(initialData);
    }, [initialData, form]);

    const handleSave = async (data: QuoteSettings) => {
        await updateQuoteSettings(data);
        router.refresh();
    };

    return (
        <TooltipProvider>
            <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
                    <Card className="h-full md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">
                                Quote Statuses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                {statusFields.map((field, index) => (
                                    <StatusItem
                                        key={field.id}
                                        status={field as QuoteSettings["statuses"][number]}
                                        onEdit={(newName) => {
                                            const updatedStatus = { ...field, name: newName };
                                            updateStatus(index, updatedStatus);
                                            handleSave(form.getValues() as QuoteSettings);
                                        }}
                                        onDelete={() => setDeleteStatusId(field.id)}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <InputGroup className="flex-1 h-10">
                                    <InputGroupAddon align="inline-start" className="pl-3">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="h-4 w-4 rounded-full border border-muted-foreground/20 shadow-sm transition-all hover:scale-110 cursor-pointer"
                                                    style={{ backgroundColor: selectedColor }}
                                                    aria-label="Select color"
                                                />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 p-3">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {colors.map((color) => (
                                                        <button
                                                            key={color}
                                                            type="button"
                                                            className={cn(
                                                                "h-8 w-8 rounded-full border border-muted-foreground/10 transition-all hover:scale-110",
                                                                selectedColor === color && "ring-2 ring-ring ring-offset-2"
                                                            )}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => setSelectedColor(color)}
                                                        />
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </InputGroupAddon>
                                    <Input
                                        placeholder="New status name"
                                        value={newStatusName}
                                        onChange={(e) => setNewStatusName(e.target.value)}
                                        className="border-0 shadow-none focus-visible:ring-0 h-auto px-2"
                                        data-slot="input-group-control"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                if (newStatusName.trim()) {
                                                    const newStatus = {
                                                        id: crypto.randomUUID(),
                                                        name: newStatusName.trim(),
                                                        key: newStatusName
                                                            .trim()
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "_"),
                                                        color: selectedColor,
                                                        isStandard: false,
                                                        order: statusFields.length,
                                                    };
                                                    appendStatus(newStatus);
                                                    handleSave(form.getValues() as QuoteSettings);
                                                    setNewStatusName("");
                                                    setSelectedColor(colors[(statusFields.length + 1) % colors.length]);
                                                }
                                            }
                                        }}
                                    />
                                </InputGroup>
                                <Button
                                    type="button"
                                    size="icon"
                                    onClick={() => {
                                        if (newStatusName.trim()) {
                                            const newStatus = {
                                                id: crypto.randomUUID(),
                                                name: newStatusName.trim(),
                                                key: newStatusName
                                                    .trim()
                                                    .toLowerCase()
                                                    .replace(/\s+/g, "_"),
                                                color: selectedColor,
                                                isStandard: false,
                                                order: statusFields.length,
                                            };
                                            appendStatus(newStatus);
                                            handleSave(form.getValues() as QuoteSettings);
                                            setNewStatusName("");
                                            setSelectedColor(colors[(statusFields.length + 1) % colors.length]);
                                        }
                                    }}
                                    disabled={!newStatusName.trim()}
                                    className="h-10 w-10 shrink-0"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <AlertDialog open={!!deleteStatusId} onOpenChange={(open) => !open && setDeleteStatusId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quote Status</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this quote status? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    const index = statusFields.findIndex((f) => f.id === deleteStatusId);
                                    if (index !== -1) {
                                        removeStatus(index);
                                        handleSave(form.getValues() as QuoteSettings);
                                    }
                                    setDeleteStatusId(null);
                                }}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </form>
        </TooltipProvider>
    );
}
