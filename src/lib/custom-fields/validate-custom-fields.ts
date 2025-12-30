import type {
    FieldDefinition,
    ValidationError,
    ValidationResult,
} from "./types";

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function isValidPhone(value: string): boolean {
    // Basic phone validation - can be enhanced
    return /^[\d\s\-+()]+$/.test(value);
}

function isValidISODate(value: string): boolean {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && value === date.toISOString();
}

function validateFieldValue(
    field: FieldDefinition,
    value: unknown,
): ValidationError | null {
    const path = `customFields.${field.fieldKey}`;

    // Required check
    if (
        field.required &&
        (value === null || value === undefined || value === "")
    ) {
        return { path, message: `${field.label} is required` };
    }

    // If value is null/undefined and not required, skip other validations
    if (value === null || value === undefined) {
        return null;
    }

    // Type-specific validation
    switch (field.dataType) {
        case "string":
        case "longtext":
            if (typeof value !== "string") {
                return { path, message: "Expected string" };
            }
            break;

        case "number":
        case "currency":
            if (typeof value !== "number" || Number.isNaN(value)) {
                return { path, message: "Expected number" };
            }
            break;

        case "boolean":
            if (typeof value !== "boolean") {
                return { path, message: "Expected boolean" };
            }
            break;

        case "email":
            if (typeof value !== "string" || !isValidEmail(value)) {
                return { path, message: "Expected valid email" };
            }
            break;

        case "phone":
            if (typeof value !== "string" || !isValidPhone(value)) {
                return { path, message: "Expected valid phone number" };
            }
            break;

        case "url":
            if (typeof value !== "string" || !isValidUrl(value)) {
                return { path, message: "Expected valid URL" };
            }
            break;

        case "date":
        case "datetime":
            if (typeof value !== "string" || !isValidISODate(value)) {
                return { path, message: "Expected valid ISO date string" };
            }
            break;

        case "json":
            // Already parsed as object, validate it's not a primitive
            if (typeof value === "string" || typeof value === "number") {
                return { path, message: "Expected object or array" };
            }
            break;

        case "enum": {
            if (typeof value !== "string") {
                return { path, message: "Expected string option key" };
            }

            const validKeys =
                field.optionSet?.options
                    .filter((opt) => opt.isActive)
                    .map((opt) => opt.optionKey) || [];

            if (!validKeys.includes(value)) {
                return {
                    path,
                    message: `Invalid option. Must be one of: ${validKeys.join(", ")}`,
                };
            }
            break;
        }

        case "multienum": {
            if (!Array.isArray(value)) {
                return { path, message: "Expected array of option keys" };
            }

            const validKeys =
                field.optionSet?.options
                    .filter((opt) => opt.isActive)
                    .map((opt) => opt.optionKey) || [];

            for (const item of value) {
                if (typeof item !== "string" || !validKeys.includes(item)) {
                    return {
                        path,
                        message: `Invalid option: ${item}. Must be one of: ${validKeys.join(", ")}`,
                    };
                }
            }
            break;
        }

        default:
            break;
    }

    return null;
}

export async function validateCustomFields(
    customFields: Record<string, unknown> | null | undefined,
    definitions: FieldDefinition[],
): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const validatedData: Record<string, unknown> = {};
    const providedKeys = new Set(Object.keys(customFields || {}));
    const definedKeys = new Set(definitions.map((d) => d.fieldKey));

    // Check for unknown keys (strict mode - reject unknown keys)
    for (const key of providedKeys) {
        if (!definedKeys.has(key)) {
            errors.push({
                path: `customFields.${key}`,
                message: "Unknown custom field",
            });
        }
    }

    // Validate each defined field
    for (const field of definitions) {
        const value = customFields?.[field.fieldKey];
        const error = validateFieldValue(field, value);

        if (error) {
            errors.push(error);
        } else if (value !== undefined) {
            // Only include provided values in validated data
            validatedData[field.fieldKey] = value;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        validatedData: errors.length === 0 ? validatedData : undefined,
    };
}
