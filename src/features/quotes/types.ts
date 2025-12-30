import { z } from "zod";

export const quoteSchema = z.object({
    quoteNumber: z.string().min(1, "Quote number is required"),
    title: z.string().min(1, "Title is required"),
    customerName: z.string().min(1, "Customer name is required"),
    customerId: z.string().optional(),
    status: z.string().min(1, "Status is required"),
    totalAmount: z.string().min(1, "Total amount is required"),
    currency: z.string().default("USD"),
    validUntil: z.date().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.unknown()).optional(),
});

export type Quote = {
    id: string;
    tenantId: string;
    quoteNumber: string;
    title: string;
    companyId: string | null;
    contactId: string | null;
    // Legacy fields for backward compatibility
    customerId?: string | null;
    customerName?: string;
    status: string;
    totalAmount: string;
    currency: string;
    validUntil: Date | null;
    notes: string | null;
    tags: string[] | null;
    customFields: Record<string, unknown> | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
};
