# Database Schema

## Conceptual ERD
- **tenants**
    - 1 → N **users**
    - 1 → N **customers**
    - 1 → N **catalog_items**
    - 1 → N **quotes**
- **roles** (seeded per tenant or global enum)
    - N → N **users** via **user_roles**
- **quotes**
    - 1 → N **quote_lines** referencing **catalog_items**

## Tables (Minimal Columns)

### tenants
- `id` (uuid, pk)
- `name` (text)
- `slug` (text, unique)
- `created_at`, `updated_at`

### users
- `id` (uuid, pk)
- `tenant_id` (uuid, fk → tenants.id)
- `email` (text)
- `name` (text)
- `status` (active, invited, disabled)
- `created_at`, `updated_at`

### roles
- `id` (uuid, pk)
- `name` (text) (Admin, Sales, Finance, Viewer)

### user_roles
- `tenant_id` (uuid)
- `user_id` (uuid, fk → users.id)
- `role_id` (uuid, fk → roles.id)
- **PK**: (`tenant_id`, `user_id`, `role_id`)

### customers
- `id` (uuid, pk)
- `tenant_id` (uuid)
- `name` (text)
- `email` (text, nullable)
- `phone` (text, nullable)
- `billing_address` (jsonb, nullable)
- `created_at`, `updated_at`

### catalog_items
- `id` (uuid, pk)
- `tenant_id` (uuid)
- `sku` (text)
- `name` (text)
- `description` (text, nullable)
- `unit_price` (numeric)
- `currency` (text)
- `active` (boolean)
- `created_at`, `updated_at`

### quotes
- `id` (uuid, pk)
- `tenant_id` (uuid)
- `quote_number` (text)
- `customer_id` (uuid, fk → customers.id)
- `status` (draft, sent, accepted, rejected, expired)
- `valid_until` (date, nullable)
- `subtotal` (numeric)
- `tax` (numeric)
- `total` (numeric)
- `created_by` (uuid, fk → users.id)
- `created_at`, `updated_at`

### quote_lines
- `id` (uuid, pk)
- `tenant_id` (uuid)
- `quote_id` (uuid, fk → quotes.id)
- `catalog_item_id` (uuid, fk → catalog_items.id, nullable)
- `description` (text)
- `quantity` (numeric)
- `unit_price` (numeric)
- `line_total` (numeric)
- `sort_order` (int)

## Critical Constraints (Tenant Safety)
- Add `tenant_id` to *every* tenant-owned table.
- Foreign keys should be **tenant-aware** at the application layer:
    - When loading `customer_id`, always verify the customer is in the same `tenant_id`.
- Unique indexes:
    - `tenants.slug` unique
    - `users(tenant_id, email)` unique
    - `catalog_items(tenant_id, sku)` unique
    - `quotes(tenant_id, quote_number)` unique

## Row Level Security (RLS)
Enable **Postgres RLS** to prevent cross-tenant reads/writes even if an app bug occurs.

**Pattern:**
- Set session variable `app.tenant_id` per request.
- RLS policy enforces `tenant_id = current_setting('app.tenant_id')::uuid`.
