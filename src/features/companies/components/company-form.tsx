"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import { companySchema } from "../types";

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
    defaultValues?: Partial<CompanyFormValues>;
    onSubmit: (data: CompanyFormValues) => Promise<void>;
    customFields?: CustomFieldDefinition[];
    isSubmitting?: boolean;
}

export function CompanyForm({
    defaultValues,
    onSubmit,
    customFields = [],
    isSubmitting: _isSubmitting,
}: CompanyFormProps) {
    const form = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            name: "",
            website: "",
            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
            tags: [],
            customFields: {},
            ...defaultValues,
        },
    });

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
                            <FormLabel className="text-sm font-medium">
                                Company Name *
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Company name" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Website</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="https://example.com"
                                    {...field}
                                    className="h-9"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Address</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Street address"
                                    className="resize-none min-h-20"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">City</FormLabel>
                                <FormControl>
                                    <Input placeholder="City" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    State/Province
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="State" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Postal Code
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="12345" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Country</FormLabel>
                                <FormControl>
                                    <Input placeholder="Country" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <CustomFieldsFormSection
                    fields={customFields}
                    values={form.watch("customFields") || {}}
                    onChange={handleCustomFieldChange}
                />
            </form>
        </Form>
    );
}
