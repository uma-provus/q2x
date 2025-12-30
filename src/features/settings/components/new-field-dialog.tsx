"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCustomField } from "@/features/settings/actions/create-custom-field";

const DATA_TYPES = [
    { value: "string", label: "Text", description: "Short text up to 255 characters" },
    { value: "longtext", label: "Long Text", description: "Multi-line text" },
    { value: "number", label: "Number", description: "Numeric value" },
    { value: "currency", label: "Currency", description: "Monetary amount" },
    { value: "boolean", label: "True/False", description: "Yes or no value" },
    { value: "date", label: "Date", description: "Date without time" },
    { value: "datetime", label: "Date and Time", description: "Date with time" },
    { value: "email", label: "Email", description: "Email address" },
    { value: "phone", label: "Phone", description: "Phone number" },
    { value: "url", label: "URL", description: "Web address" },
    { value: "enum", label: "Select", description: "Single choice from options" },
    { value: "multienum", label: "Multi-select", description: "Multiple choices" },
];

const fieldSchema = z.object({
    label: z.string().min(1, "Label is required"),
    fieldKey: z
        .string()
        .min(1, "Field key is required")
        .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
    dataType: z.string().min(1, "Data type is required"),
    description: z.string().optional(),
    required: z.boolean().default(false),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

interface NewFieldDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entityType: string;
    tenantId: string;
}

export function NewFieldDialog({
    open,
    onOpenChange,
    entityType,
    tenantId,
}: NewFieldDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1);
    const [isFieldKeyManuallyEdited, setIsFieldKeyManuallyEdited] = useState(false);

    const form = useForm<FieldFormValues>({
        resolver: zodResolver(fieldSchema),
        defaultValues: {
            label: "",
            fieldKey: "",
            dataType: "",
            description: "",
            required: false,
        },
    });

    const generateFieldKey = (label: string) => {
        return label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
    };

    const handleLabelChange = (value: string) => {
        form.setValue("label", value);
        if (!isFieldKeyManuallyEdited) {
            form.setValue("fieldKey", generateFieldKey(value));
        }
    };

    const handleFieldKeyChange = (value: string) => {
        form.setValue("fieldKey", value);
        setIsFieldKeyManuallyEdited(true);
    };

    const handleSubmit = async (values: FieldFormValues) => {
        startTransition(async () => {
            const result = await createCustomField({
                tenantId,
                entityType,
                fieldKey: values.fieldKey,
                label: values.label,
                description: values.description,
                dataType: values.dataType as any,
                required: values.required,
            });

            if (result.success) {
                toast.success("Field created successfully");
                form.reset();
                setStep(1);
                setIsFieldKeyManuallyEdited(false);
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to create field");
            }
        });
    };

    const selectedType = DATA_TYPES.find((t) => t.value === form.watch("dataType"));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 ? "1. Select a field type" : "2. Configure field"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Choose the type of data this field will store"
                            : "Set the name and properties for your new field"}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {DATA_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        form.setValue("dataType", type.value);
                                        setStep(2);
                                    }}
                                    className="flex flex-col items-start p-3 border rounded-lg hover:bg-muted/50 hover:border-primary transition-colors text-left"
                                >
                                    <span className="font-medium text-sm">{type.label}</span>
                                    <span className="text-xs text-muted-foreground mt-0.5">
                                        {type.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <div className="p-3 bg-muted rounded-md">
                                <div className="text-sm font-medium">Field type</div>
                                <div className="text-sm text-muted-foreground">
                                    {selectedType?.label}
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Label</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onChange={(e) => handleLabelChange(e.target.value)}
                                                placeholder="e.g., Employee Count"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fieldKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Field Key</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                onChange={(e) => handleFieldKeyChange(e.target.value)}
                                                placeholder="e.g., employee_count"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Describe what this field is for"
                                                rows={2}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "Creating..." : "Create Field"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
