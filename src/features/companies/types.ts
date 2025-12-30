import { z } from "zod";

export const companySchema = z.object({
    name: z.string().min(1, "Name is required"),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.unknown()).optional(),
    // TODO: These fields don't exist in the database yet
    email: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
});

export type Company = {
    id: string;
    tenantId: string;
    name: string;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    tags: string[] | null;
    customFields: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
    // TODO: These fields don't exist in the database yet
    // They're referenced in the UI but need migration
    email?: string | null;
    phone?: string | null;
    company?: string | null;
};
