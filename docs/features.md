# Feature Tracking & Roadmap

This document tracks the implementation status of features in the project. AI agents should refer to this file to understand what has been completed and what remains to be done.

**Related Documentation:**
- [Project Goals](./project-goals.md)
- [Architecture](./architecture.md)
- [Database Schema](./schema.md)
- [Auth & RBAC](./auth-rbac.md)

## Status Legend
- ✅ **Done**: Feature is fully implemented and tested.
- 🚧 **In Progress**: Feature is currently being worked on.
- 📝 **To Do**: Feature is planned but not yet started.
- ⏸️ **Parked**: Feature is on hold.

## 1. Core Infrastructure & Tenant Isolation
- ✅ **Database Schema**: Implemented Drizzle schema with `tenant_id` constraints, roles, and user_roles tables.
- ✅ **Multi-Tenant Seed Data**: Created seed with 3 realistic tenants (Acme Corporation, TechFlow Solutions, Global Industries).
- 📝 **Tenant Resolution**: Subdomain or path-based resolution (Middleware).
- 📝 **RLS Enforcement**: Row Level Security for tenant isolation.

## 2. Authentication & RBAC
- ✅ **Sign In**: Email/Password login (NextAuth Credentials).
- ✅ **Sign Up & Onboarding**: New tenant creation with admin user.
- ✅ **RBAC Roles**: Admin, Sales, Finance, Viewer roles implemented.
- 📝 **Sign Out**: Logout functionality.
- 📝 **Session-aware Layout**: Layout changes based on auth state.
- 📝 **Permission Mapping**: Map roles to allowed actions.
- 📝 **Basic Admin**: Invite user + assign role.

## 3. Dashboard
- 📝 **Overview Cards**: High-level metrics.
- 📝 **Filters**: URL search params for filtering.
- 📝 **Table View**: Data tables for lists.

## 4. Customers
- 📝 **Customer CRUD**: List, create, edit, archive customers.

## 5. Catalog
- 📝 **Catalog Item CRUD**: Manage SKUs, prices, descriptions.
- 📝 **Custom Fields**: Support for extending schema via JSON.
- 📝 **Schema Configuration**: UI to define custom fields (Tenant settings).

## 6. Quotes (Core Feature)
- 📝 **Quote Builder**: Header + Lines management.
- 📝 **Quote Numbering**: Unique numbering per tenant.
- 📝 **Send Quote**: Email link / PDF generation.
- 📝 **Status Transitions**: Draft → Sent → Accepted/Rejected.

## 7. Reporting
- 📝 **Simple Reporting**: Quotes by status and total value.

## 8. Billing (Future)
- 📝 **Plans Page**: Subscription plans.
- 📝 **Checkout Flow**: Payment integration.

## Completed Items
- ✅ **Theme Support**: Light/Dark mode with `next-themes`.
- ✅ **UI Components**: Basic shadcn/ui setup.
