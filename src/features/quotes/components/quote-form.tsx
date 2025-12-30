"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { CustomFieldsFormSection } from "@/components/custom-fields-form-section";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import type { QuoteSettings } from "@/features/settings/types";
import type { CustomFieldDefinition } from "@/lib/custom-fields";
import { cn } from "@/lib/utils";
import { quoteSchema } from "../types";

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
    defaultValues?: Partial<QuoteFormValues>;
    onSubmit: (data: QuoteFormValues) => Promise<void>;
    settings: QuoteSettings;
    customFields?: CustomFieldDefinition[];
    isSubmitting?: boolean;
}

export function QuoteForm({
    defaultValues,
    onSubmit,
    settings,
    customFields = [],
    isSubmitting,
}: QuoteFormProps) {
    const form = useForm({
        resolver: zodResolver(quoteSchema),
        defaultValues: {
            quoteNumber: "",
            title: "",
            customerName: "",
            customerId: "",
            status: "",
            totalAmount: "",
            currency: "USD",
            notes: "",
            tags: [],
            customFields: {},
            ...defaultValues,
        },
    }) as ReturnType<typeof useForm<QuoteFormValues>>;

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
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quoteNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Quote Number
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Q-001" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Status</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {settings.statuses.map((status) => (
                                            <SelectItem key={status.key} value={status.key}>
                                                {status.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Quote title" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">
                                Customer Name
                            </FormLabel>
                            <FormControl>
                                <Input placeholder="Customer name" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Total Amount
                                </FormLabel>
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
                        name="validUntil"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">
                                    Valid Until
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "h-9 w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date(new Date().setHours(0, 0, 0, 0))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Additional notes"
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

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="submit" disabled={isSubmitting} className="min-w-24">
                        {isSubmitting ? "Saving..." : "Save Quote"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
