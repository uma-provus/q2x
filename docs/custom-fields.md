# Tenant Custom Fields & Option Sets System

## Overview

This system provides a flexible, tenant-scoped custom fields solution with renameable option sets for a multi-tenant SaaS application.

## Features

- **Tenant-scoped custom field definitions** per entity type (companies, contacts, catalog_items, quotes)
- **Multiple data types** supported: string, number, boolean, date, datetime, currency, email, phone, url, longtext, json, enum, multienum
- **Renameable option sets** - labels can be changed without breaking stored data
- **Built-in field validation** for `catalog_items.type` and `quotes.status` using option sets
- **Strict validation** on entity create/update with structured error messages
- **GIN indexing** support for JSONB custom fields

## Database Schema

### Tables

#### `tenant_option_sets`
Logical named sets of options (for enum fields and built-in enums).

```sql
- id: uuid (PK)
- tenant_id: uuid (FK -> tenants.id)
- name: text (unique per tenant)
- entity_type: text (optional)
- created_at, updated_at: timestamp
```

#### `tenant_option_set_options`
Individual options within an option set.

```sql
- id: uuid (PK)
- option_set_id: uuid (FK -> tenant_option_sets.id)
- option_key: text (stable key, unique per set)
- label: text (tenant-changeable)
- description: text (optional)
- sort_order: integer
- is_active: boolean
- created_at, updated_at: timestamp
```

#### `tenant_field_definitions`
Custom field metadata per tenant and entity type.

```sql
- id: uuid (PK)
- tenant_id: uuid (FK -> tenants.id)
- entity_type: text (company|contact|catalog_item|quote)
- field_key: text (stable, immutable, unique per tenant+entity)
- label: text
- description: text (optional)
- data_type: text (string|number|boolean|date|datetime|currency|email|phone|url|longtext|json|enum|multienum)
- required: boolean
- searchable: boolean
- option_set_id: uuid (FK, required for enum/multienum)
- default_value: jsonb
- ui_config: jsonb (placeholder, columnWidth, helpText, etc.)
- is_archived: boolean
- created_at, updated_at: timestamp
```

**Constraints:**
- UNIQUE(tenant_id, entity_type, field_key)
- CHECK: if data_type IN ('enum','multienum') then option_set_id IS NOT NULL

## Storage Strategy

Custom field values are stored in the existing `customFields` JSONB column on entity tables:
- **Field key mapping**: `{ "lead_score": 87, "linkedin_url": "..." }`
- **Enum fields**: Store option_key as string: `{ "catalog_type": "product" }`
- **Multienum fields**: Store array of option_keys: `{ "regions": ["apac", "emea"] }`
- **Labels NOT stored** - only stable option_keys, allowing renames

## Default Option Sets

### Catalog Item Type (`catalog_item_type`)
Seeded for each tenant with options:
- `product` - "Product"
- `addon` - "Add-on"
- `resource_role` - "Resource Role"

Validates `catalog_items.type` field.

### Quote Status (`quote_status`)
Seeded for each tenant with options:
- `draft` - "Draft"
- `sent` - "Sent"
- `accepted` - "Accepted"
- `rejected` - "Rejected"
- `expired` - "Expired"

Validates `quotes.status` field.

## API Endpoints

### Custom Fields

#### `GET /api/admin/custom-fields?entityType=contact`
List field definitions for an entity type.

**Response:**
```json
[
  {
    "id": "uuid",
    "entityType": "contact",
    "fieldKey": "lead_score",
    "label": "Lead Score",
    "dataType": "number",
    "required": false,
    "optionSet": null
  }
]
```

#### `POST /api/admin/custom-fields`
Create a new field definition.

**Request:**
```json
{
  "entityType": "contact",
  "fieldKey": "lead_score",
  "label": "Lead Score",
  "dataType": "number",
  "required": false,
  "searchable": true
}
```

#### `PATCH /api/admin/custom-fields/:id`
Update field definition (label, required, searchable, defaultValue, uiConfig, isArchived).

**Note:** `fieldKey` is immutable.

#### `DELETE /api/admin/custom-fields/:id`
Soft delete (archives) field definition.

### Option Sets

#### `GET /api/admin/option-sets?name=quote_status`
Get option set by name (or all sets if name omitted).

**Response:**
```json
{
  "id": "uuid",
  "name": "quote_status",
  "options": [
    {
      "id": "uuid",
      "optionKey": "draft",
      "label": "Draft",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

#### `POST /api/admin/option-sets`
Create a new option set.

#### `POST /api/admin/option-sets/:id/options`
Add option to set.

**Request:**
```json
{
  "optionKey": "new_status",
  "label": "New Status",
  "sortOrder": 10
}
```

#### `PATCH /api/admin/option-sets/:id/options/:optionId`
Update option (rename label, reorder, activate/deactivate).

#### `DELETE /api/admin/option-sets/:id/options/:optionId`
Soft delete option (sets isActive=false).

## Validation

### Entity Validation

Validation occurs on all entity create/update operations for:
- Companies
- Contacts
- Catalog Items (+ validates `type` field)
- Quotes (+ validates `status` field)

**Validation Rules:**
1. Custom field keys must be defined for the tenant and entity type
2. Unknown keys are rejected
3. Required fields must be present
4. Data types must match:
   - `number`: must be numeric
   - `boolean`: must be boolean
   - `email`: valid email format
   - `url`: valid URL format
   - `date/datetime`: ISO 8601 string
   - `enum`: must be an active option_key
   - `multienum`: array of active option_keys
5. Catalog `type` must be an active option in `catalog_item_type`
6. Quote `status` must be an active option in `quote_status`

**Error Format:**
```json
{
  "error": "VALIDATION_ERROR",
  "fields": [
    {
      "path": "customFields.lead_score",
      "message": "Expected number"
    },
    {
      "path": "status",
      "message": "Invalid status. Must be one of: draft, sent, accepted, rejected, expired"
    }
  ]
}
```

## Code Usage

### Loading Field Definitions
```typescript
import { loadFieldDefinitions } from "@/lib/custom-fields";

const definitions = await loadFieldDefinitions(tenantId, "contact");
```

### Validating Entity Data
```typescript
import { validateEntity } from "@/lib/custom-fields";

const validation = await validateEntity({
  tenantId: session.user.tenantId,
  entityType: "company",
  customFields: data.customFields,
});

if (!validation.valid) {
  throw new Error(
    `Validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join(", ")}`
  );
}

// Use validation.validatedCustomFields for insert/update
```

### Getting Option Set
```typescript
import { getOptionSet, getActiveOptionKeys } from "@/lib/option-sets";

const optionSet = await getOptionSet(tenantId, "quote_status");
const activeKeys = await getActiveOptionKeys(tenantId, "quote_status");
```

## Indexing

### GIN Index (Applied)
All entity tables have a GIN index on `customFields`:

```sql
CREATE INDEX idx_companies_custom_fields ON companies USING gin(custom_fields jsonb_path_ops);
CREATE INDEX idx_contacts_custom_fields ON contacts USING gin(custom_fields jsonb_path_ops);
CREATE INDEX idx_catalog_items_custom_fields ON catalog_items USING gin(custom_fields jsonb_path_ops);
CREATE INDEX idx_quotes_custom_fields ON quotes USING gin(custom_fields jsonb_path_ops);
```

### Expression Indexes (Manual)
For searchable fields, create expression indexes:

```sql
-- String/enum field
CREATE INDEX idx_contacts_custom_field_lead_source 
ON contacts ((custom_fields->>'lead_source'));

-- Number field
CREATE INDEX idx_contacts_custom_field_lead_score 
ON contacts (((custom_fields->>'lead_score')::numeric));
```

## Integration Points

All entity server actions have been updated to validate custom fields:

- [src/features/companies/actions/create-company.ts](src/features/companies/actions/create-company.ts)
- [src/features/companies/actions/update-company.ts](src/features/companies/actions/update-company.ts)
- [src/features/contacts/actions/create-contact.ts](src/features/contacts/actions/create-contact.ts)
- [src/features/contacts/actions/update-contact.ts](src/features/contacts/actions/update-contact.ts)
- [src/features/catalogs/actions/create-catalog-item.ts](src/features/catalogs/actions/create-catalog-item.ts)
- [src/features/catalogs/actions/update-catalog-item.ts](src/features/catalogs/actions/update-catalog-item.ts)
- [src/features/quotes/actions/create-quote.ts](src/features/quotes/actions/create-quote.ts)
- [src/features/quotes/actions/update-quote.ts](src/features/quotes/actions/update-quote.ts)

## Acceptance Criteria ✅

- ✅ Tenant admin can rename labels for quote statuses and catalog types; existing records remain valid
- ✅ Admin can define enum/multienum custom fields with option sets
- ✅ Entity create/update rejects invalid custom field keys/values with structured errors
- ✅ `catalog_items.type` accepts only valid active option keys
- ✅ `quotes.status` accepts only valid active option keys
- ✅ Field definitions stored per tenant + entity type
- ✅ Custom field values stored in entity.customFields JSONB
- ✅ Enum/multienum values stored as stable option_keys
- ✅ Admin APIs for managing fields and option sets
- ✅ Seed script creates default option sets for each tenant

## Next Steps

### UI Components (Not Implemented)
- Admin interface for managing custom field definitions
- Admin interface for managing option sets
- Dynamic form rendering based on field definitions
- Custom field display in entity views

### Advanced Features (Future)
- Field-level permissions
- Conditional field visibility
- Field dependencies and validation rules
- Bulk import/export of custom field definitions
- Field usage analytics
- Automated expression index generation

## Migration Applied

Migration file: `drizzle/0004_eager_felicia_hardy.sql`

To revert (if needed):
```sql
DROP TABLE tenant_field_definitions;
DROP TABLE tenant_option_set_options;
DROP TABLE tenant_option_sets;
```
