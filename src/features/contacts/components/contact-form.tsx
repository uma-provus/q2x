"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { contactSchema } from "../types";

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
    defaultValues?: Partial<ContactFormValues>;
    onSubmit: (data: ContactFormValues) => Promise<void>;
    isSubmitting?: boolean;
    companies: Array<{ id: string; name: string }>;
}

export function ContactForm({
    defaultValues,
    onSubmit,
    isSubmitting,
    companies,
}: ContactFormProps) {
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            companyId: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            title: "",
            isPrimary: false,
            tags: [],
            ...defaultValues,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="companyId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Company *</FormLabel>
                            <FormControl>
                                <select {...field} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                                    <option value="">Select a company...</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">First Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="First name" {...field} className="h-9" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Last Name *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Last name" {...field} className="h-9" />
                                </FormControl>
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
                            <FormLabel className="text-sm font-medium">Job Title</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., CEO, Sales Manager" {...field} className="h-9" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="email@example.com"
                                        type="email"
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
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Phone</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="+1 (555) 123-4567"
                                        {...field}
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
                    name="isPrimary"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Primary Contact</FormLabel>
                                <div className="text-xs text-muted-foreground">
                                    Mark as the main contact for this company
                                </div>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
