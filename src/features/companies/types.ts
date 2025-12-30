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
};
