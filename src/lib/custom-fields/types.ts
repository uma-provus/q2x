export type EntityType = "company" | "contact" | "catalog_item" | "quote";

export type DataType =
    | "string"
    | "number"
    | "boolean"
    | "date"
    | "datetime"
    | "currency"
    | "email"
    | "phone"
    | "url"
    | "longtext"
    | "json"
    | "enum"
    | "multienum";

export interface FieldDefinition {
    id: string;
    tenantId: string;
    entityType: EntityType;
    fieldKey: string;
    label: string;
    description: string | null;
    dataType: DataType;
    required: boolean;
    searchable: boolean;
    optionSetId: string | null;
    defaultValue: unknown;
    uiConfig: Record<string, unknown> | null;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    optionSet?: OptionSetWithOptions;
}

export interface OptionSet {
    id: string;
    tenantId: string;
    name: string;
    entityType: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface OptionSetOption {
    id: string;
    optionSetId: string;
    optionKey: string;
    label: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface OptionSetWithOptions extends OptionSet {
    options: OptionSetOption[];
}

export interface ValidationError {
    path: string;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    validatedData?: Record<string, unknown>;
}
