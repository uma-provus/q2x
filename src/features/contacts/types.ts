import { z } from "zod";

export const contactSchema = z.object({
    companyId: z.string().uuid("Invalid company ID"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),
    title: z.string().optional(),
    isPrimary: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    customFields: z.record(z.unknown()).optional(),
});

export type Contact = {
    id: string;
    tenantId: string;
    companyId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    isPrimary: boolean;
    tags: string[] | null;
    customFields: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
};
