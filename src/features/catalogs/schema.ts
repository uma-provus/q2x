import { z } from "zod";

export const catalogItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    unitCost: z.string().min(1, "Cost is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid cost format"),
    unitPrice: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
    unitType: z.string().min(1, "Unit type is required"),
    tags: z.array(z.string()).optional(),
    currency: z.string().default("USD"),
});

export type CatalogItemFormValues = z.infer<typeof catalogItemSchema>;
