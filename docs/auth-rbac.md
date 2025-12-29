# Authentication & RBAC

## RBAC Model
**Role-based, coarse permissions** (no fine-grained ABAC).

### Roles
- **Admin**: Manage tenant settings, users, roles, full access.
- **Sales**: CRUD customers, catalog, quotes. Can send quotes.
- **Finance**: Read all quotes, update pricing fields, approve/mark accepted (optional).
- **Viewer**: Read-only access.

### Implementation
- Store roles via `user_roles`.
- Derive permissions in code with a single mapping table (role → allowed actions).

## Authentication
- **NextAuth** (or similar) for identity.
- Middleware resolves tenant and validates session.
