# Architecture & Multi-tenancy

## Domain Model (High Level)
- **Tenant (Company)**
    - Users (Roles: Admin, Sales, Finance, Viewer)
    - Customers
    - Catalog
    - Quotes

## Multi-tenancy Approach
**Single database, shared tables + `tenant_id` on every tenant-owned row.**

### Why
- Simple operations and cost.
- Easy to run locally.
- Works well for early stage and most SaaS workloads.

### Core Rule
- Every query is scoped by `tenant_id`.
- Every unique index includes `tenant_id`.

## Next.js Architecture (App Router)

### Edge / Web
- **Next.js App Router**
- **Middleware**: Resolve tenant + auth.
- **Server Components**: For data-heavy pages.
- **Route Handlers**: For writes.

### Core Backend (In App)
- **Auth Integration**: NextAuth (or custom).
- **Authorization**: `authorize(action, context)`.
- **Data Access Layer**: Drizzle ORM.
- **Postgres + RLS**.

### Request Flow
1. Request comes in.
2. **Middleware** resolves `tenant` from host or path and validates session.
3. Server-side loads roles for the user (scoped to tenant).
4. For DB calls, set `app.tenant_id` in the DB session/transaction.
5. RLS enforces tenant isolation.

## Tenant Resolution Options
- **Subdomain**: `acme.yourapp.com` (Recommended)
- **Path prefix**: `yourapp.com/t/acme/...`
