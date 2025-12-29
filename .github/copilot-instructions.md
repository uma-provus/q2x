# Copilot Instructions (Next.js App Router)

These instructions guide GitHub Copilot for this repo. Prioritize correctness, maintainability, and consistency with our conventions.

## Stack & Defaults
- Framework: **Next.js (App Router)** using `app/`
- Language: **TypeScript everywhere** (strict). Avoid `any`.
- Package Manager: **pnpm** (always use pnpm for commands)
- UI: **Tailwind CSS + shadcn/ui** (lean on `components/ui`)
- Auth: **NextAuth**
- DB: **Postgres + Drizzle ORM**
- Formatting/Lint: **Biome**
- Imports: Use `@/` alias (e.g. `@/lib/...`, `@/components/...`)

## Project Status & Documentation
- **Feature Tracking**: Refer to `docs/features.md` for the current status of features and the roadmap.
- **Detailed Documentation**: Check the `docs/` folder for:
  - `docs/project-goals.md`: Vision and problem statement.
  - `docs/architecture.md`: High-level architecture and multi-tenancy.
  - `docs/schema.md`: Database schema and constraints.
  - `docs/auth-rbac.md`: Authentication and roles.
- **Update Policy**: When completing a feature, update `docs/features.md` to reflect the change.

## High-Level Architecture
- Prefer a **hybrid** approach:
  - Use **Server Components** for data fetching and rendering by default.
  - Use **Client Components** only for interactivity, browser APIs, or local UI state.
- Prefer **Next.js route handlers** (and/or server actions if used) over external API services.
- Pages should contain **minimal logic**. Put real logic in:
  - feature-local `lib/`, `services/`, `queries/`, `mutations/`, `schema/`, `types/`
  - root shared `lib/`, `db/`, `context/` (only truly app-wide)

## File Structure Rules
### Root-level shared modules (only app-wide)
- `app/` — routes, layouts, segment-level error/loading boundaries
- `components/ui/` — shadcn primitives (do not modify unless necessary)
- `components/` — shared composed components (built from `components/ui`)
- `lib/` — shared utilities (date, formatting, validation helpers)
- `db/` — drizzle config, schema, db client, migrations
- `context/` — app-wide contexts only (avoid unless necessary)
- `types/` — truly global types only

### Feature-first organization
- Keep feature-specific code **inside the `src/features` folder**.
- Typical feature layout:
  - `src/features/<feature>/components/` (feature UI)
  - `src/features/<feature>/lib/` (feature helpers)
  - `src/features/<feature>/actions/` (server actions if used)
  - `src/features/<feature>/queries/` + `mutations/` (db interactions)
  - `src/features/<feature>/constants.ts` (feature-only constants)
  - `src/features/<feature>/types.ts` (feature-only types)

**Rule of thumb:** if only one feature uses it, keep it local to that feature in `src/features`.

## UI & Styling Conventions
- Use **shadcn/ui** components first; compose them into shared components only when reusable.
- **NEVER modify default shadcn/ui components** in `components/ui/`. If you need to customize them, wrap them or create a new component that composes them.
- Tailwind:
  - Prefer `cn()` utility for conditional classes.
  - Keep class lists readable; extract to components when it gets unwieldy.
- Accessibility:
  - Ensure buttons/inputs/labels are wired correctly.
  - Use semantic HTML when possible.

## Component Conventions
- **Arrow function components only**.
- Prefer small, composable components.
- Naming:
  - Components: `PascalCase`
  - Files: `kebab-case.tsx` for components, or consistent with existing repo conventions
- Client boundaries:
  - Add `"use client"` only where needed.
  - Keep client components leaf-most; avoid making entire pages client unnecessarily.

## Data Fetching & DB
- Prefer server-side data access:
  - Server Components fetch data directly from DB layer (queries in feature `queries/`).
  - Route handlers for external-like endpoints inside the app (no external APIs).
- Drizzle:
  - Keep schema in `db/` (shared).
  - Prefer feature-level query functions that call shared db client.
- Avoid mixing DB logic into UI components. UI should call a query function and render results.

## Auth (NextAuth)
- Centralize auth helpers and session retrieval in shared modules (`lib/auth` or similar).
- Pages should not contain complex auth logic; use helpers and guard patterns.

## State Management
- Prefer **URL as state**:
  - route segments
  - `searchParams`
  - shallow navigation patterns where appropriate
- If not possible:
  - Use **React Context** (only when state is shared across multiple components).
- No external state libraries unless the project becomes significantly complex.

## Error, Loading, and Not Found
- Use App Router conventions **strictly**:
  - `loading.tsx`, `error.tsx`, `not-found.tsx`
- Avoid duplicating boundaries for every page:
  - Place shared boundaries at the **highest sensible segment** (via layouts / route groups)
  - Only add more granular boundaries when a feature truly needs distinct UX
- Use shadcn-friendly skeletons for loading states.

## Code Quality (Very Strict)
- Keep functions small and focused.
- Prefer early returns and guard clauses.
- Avoid unused variables/imports.
- Avoid deep nesting.
- Don’t introduce “clever” abstractions; prefer clear code.
- Ensure types are correct; avoid `as` casts unless justified.
- No `any`. If absolutely unavoidable, use `unknown` and narrow properly.
- Keep server/client separation clear and intentional.

## Comments
- **Minimal comments**.
- Do not comment obvious code.
- Only comment when intent is non-obvious or a workaround is required.

## Output Expectations for Copilot
When generating code, Copilot should:
- Follow this structure and conventions by default
- Create feature-local modules instead of bloating root `lib/`
- Keep `page.tsx` minimal (compose from components + call feature query/action)
- Use `@/` imports consistently
- Produce Biome-friendly formatting (no Prettier-specific assumptions)