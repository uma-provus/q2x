"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CustomFieldsFormSection } from "@/components/custom-fields-form-section";
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
import type { CatalogSettings } from "@/features/settings/types";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import { type CatalogItemFormValues, catalogItemSchema } from "../schema";

interface CatalogFormProps {
    defaultValues?: Partial<CatalogItemFormValues>;
    onSubmit: (data: CatalogItemFormValues) => Promise<void>;
    settings: CatalogSettings;
    customFields?: CustomFieldDefinition[];
    isSubmitting?: boolean;
}

export function CatalogForm({
    defaultValues,
    onSubmit,
    settings,
    customFields = [],
    isSubmitting: _isSubmitting,
}: CatalogFormProps) {
    const form = useForm({
        resolver: zodResolver(catalogItemSchema),
        defaultValues: {
            name: "",
            description: "",
            type: "",
            unitCost: "",
            unitPrice: "",
            unitType: "",
            tags: [],
            currency: "USD",
            customFields: {},
            ...defaultValues,
        },
    }) as ReturnType<typeof useForm<CatalogItemFormValues>>;

    const handleCustomFieldChange = (fieldKey: string, value: unknown) => {
        const currentCustomFields = form.getValues("customFields") || {};
        form.setValue("customFields", {
            ...currentCustomFields,
            [fieldKey]: value,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Item name" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {settings.types.map((type) => (
                                        <SelectItem key={type.key} value={type.key}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="unitCost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Cost</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0.00"
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        className="h-9"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Price</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="0.00"
                                        {...field}
                                        type="number"
                                        step="0.01"
                                        className="h-9"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="unitType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Unit Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select a unit type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {settings.unitTypes
                                        .filter((u) => u.enabled)
                                        .map((unit) => (
                                            <SelectItem key={unit.key} value={unit.key}>
                                                {unit.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Item description"
                                    className="resize-none min-h-24"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <CustomFieldsFormSection
                    fields={customFields}
                    values={form.watch("customFields") || {}}
                    onChange={handleCustomFieldChange}
                />
            </form>
        </Form>
    );
}
