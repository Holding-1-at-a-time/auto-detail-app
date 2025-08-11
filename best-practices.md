### 📘 Project Best Practices

#### 1. Project Purpose
This repository contains a Next.js (App Router) application for an auto-detailing business with multi-organization support. It provides:
- Client assessments, services management, and booking links
- Authentication and organization management via Clerk
- Real-time data and persistence via Convex
- A TypeScript-first codebase using shadcn/ui, TailwindCSS, and Zod for forms

Primary domain concerns:
- Multi-tenant data isolation (org scoping)
- Strong typing and validation across client and server
- Consistent UX with accessible, reusable UI components

#### 2. Project Structure
- app/: Next.js App Router code (server and client components)
  - (app)/[organizationSlug]/…: Authenticated, org-scoped pages (dashboard, settings)
  - (client)/…: Client-facing pages (e.g., assessment creation)
  - book/[organizationSlug]/: Public booking pages
  - layout.tsx: App-wide layout(s)
- components/: Reusable UI and navigation components (shadcn/ui style)
- convex/: Convex backend (public file-based query/mutation/action route files)
  - convex/models/: internal helpers only (not route handlers; do not export queries/mutations/actions from here)
- lib/, utils/, types/: Shared helpers, types, and role definitions
- .env.local: Environment configuration for Clerk/Convex
- ESLint/Prettier/Tailwind configs: eslint.config.mjs, .prettierrc, tailwind.config.ts, postcss.config.mjs
- tsconfig.json: Strict TypeScript configuration

Entrypoints:
- Next.js runtime via app/ with middleware.ts (Clerk integration)
- Convex runtime via convex files with schema-defined tables and indexes

Configuration:
  - Environment variables:
    - Only publishable keys (e.g., variables prefixed with NEXT_PUBLIC_) may be exposed to the client/browser.
    - Server secrets (API keys, admin tokens, etc.) must never use the NEXT_PUBLIC_ prefix and must only be accessed on the server. In the App Router, use server-only patterns such as:
      - Server components
      - "use server" functions
      - Server-only modules
      - API/route handlers (app/api/*)
      - Server actions
    - Never expose server secrets to client bundles.
    - Example:
      - Store Clerk publishable key as NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local (safe for client use).
      - Store Clerk secret key or admin API keys as CLERK_SECRET_KEY or ADMIN_USER_ID (never exposed to client, only used server-side).
    - For production, use environment access controls and a secrets manager (e.g., Vercel/Netlify/Cloud provider secrets) to protect sensitive values.
- Tailwind and shadcn/ui for consistent design system

#### 3. Test Strategy
Current repo does not include tests; adopt the following:
- Frameworks:
  - Unit: Vitest or Jest
  - React components: Testing Library + jest-dom
  - E2E: Playwright
- Structure:
  - tests/ for E2E and integration
  - __tests__/ colocated with modules for unit tests
  - Mocks: Use MSW for network mocks; for Convex, stub hooks (useQuery/useMutation) via wrappers or mock providers
- Philosophy:
  - Unit tests for pure utilities (formatters, mappers, validators)
  - Integration tests for components with data fetching and forms
  - E2E critical flows: organization scoping, creating assessments, managing services, and booking link display
- Coverage:
  - Aim for 80%+ where feasible; prioritize domain-critical flows
- CI:
  - Add a GitHub Action to run lint, typecheck, unit tests, and E2E (on PRs to main branches)

#### 4. Code Style
- TypeScript:
  - Strict mode on; do not use any
  - Use generated Convex types: Id<"table">, Doc<"table">, WithoutSystemFields<Doc<"table">>
  - Validate arguments/returns with convex/values v.* validators for every public function
  - Avoid unsafe casts; normalize external strings into Convex Ids using Convex queries (never cast Clerk IDs to Convex Id types)
- React:
  - Prefer function components with explicit prop types
  - Manage loading/error states explicitly for useQuery/useMutation
  - Derive IDs and state from single sources of truth; prefer deriving orgId from Convex org doc rather than Clerk orgId
- Naming:
  - Files: kebab-case or Next.js segment conventions
  - Constants: SCREAMING_SNAKE_CASE
  - Functions/variables: camelCase; React components: PascalCase
- Comments/Docs:
  - Use JSDoc/TSDoc for exported functions and complex logic
  - Keep comments up to date; prefer self-documenting code with good naming
- Error Handling:
  - For unauthorized/forbidden, prefer throwing explicit errors over returning empty data
  - In UI, display user-friendly messages and log details for debugging
- Accessibility:
  - Ensure ARIA attributes are correct (e.g., dropdown triggers with aria-haspopup, aria-expanded, aria-controls)
  - Keyboard navigation support for interactive widgets
- Formatting:
  - Prettier for formatting; ESLint for linting; run both in CI

#### 5. Common Patterns
- Convex function patterns:
  - Use new syntax: export const fn = query/mutation/action({ args, returns?, handler })
  - Always validate args and, when applicable, returns
  - Prefer withIndex over filter; design indexes in schema.ts for frequent access paths
  - Throw explicit errors for auth/authorization, distinguish from “no data”
  - Keep public functions thin; delegate to model helpers in convex/models
  - Use internalQuery/internalMutation/internalAction for internal-only execution paths
- Organization scoping:
  - UI must retrieve Convex organization document first (e.g., api.organizations.getOrganization), then pass its _id to all queries/mutations that expect Id<"organizations">
  - Never cast Clerk orgId to Convex Id type
- React data fetching:
  - useQuery(api.fn, args) and pass undefined as args when inputs are incomplete (e.g., useQuery(api.fn, undefined)). This prevents execution until valid args are available.
  - useMutation(api.fn) for writes; implement optimistic UI carefully if needed
- Forms:
  - react-hook-form + zodResolver for typesafe validation
  - Show loading/disabled states and error messages
  - Keep inputs editable unless persistently locked; avoid blanket readOnly based on unrelated selection state
- UI consistency:
  - Centralize navigation config; map to links to avoid duplication and enable unified active-state styling
  - Unify fallback text across pages (“Not provided”)
  - Format dates with toLocaleString using locale options for clarity and potential timezone awareness
- Typing:
  - Use precise union types for statuses: "pending" | "reviewed" | "complete" | "cancelled"
  - Prefer readonly arrays and as const where appropriate
- Indexing and performance:
  - Query with exact indexes (e.g., by_orgId); only use .order when the sort keys match an existing index.
    - Ensure any .order clause is backed by an index (or create a composite index that covers both the filter and sort columns).
    - Prefer querying by exact indexed columns and avoid .order unless you have an index that supports the sort.
    - Add composite indexes to cover common filter+sort patterns to avoid full table or index scans.
  - Use paginate for potentially large result sets

#### 6. Do's and Don'ts
- ✅ Do
  - Derive and pass Convex org document IDs (_id) to backend functions
  - Validate all public function args/returns with v.*
  - Throw explicit “Not authenticated/Not authorized” errors for authz failures
  - Add indexes before using withIndex; avoid filter for large collections
  - Use "skip" in useQuery until required args are available
  - Implement loading, disabled, and error states for forms/mutations
  - Keep inputs editable if their value is missing (e.g., client contact info)
  - Use ARIA attributes correctly in interactive components
  - Keep date formatting consistent with toLocaleString and options
- ❌ Don’t
  - Don’t pass Clerk organization IDs where Convex expects Id<"organizations">
  - Don’t cast strings to Id<"table"> unless normalized by Convex (e.g., ctx.db.normalizeId or via queries)
  - Don’t return [] to hide authorization issues—throw explicit errors
  - Don’t overuse ctx.runQuery/ctx.runMutation; prefer plain helpers inside a single transaction
  - Don’t use .collect() on unbounded queries; prefer withIndex + paginate where needed
  - Don’t use any or rely on implicit any; maintain strict types

#### 7. Tools & Dependencies
- Frameworks/Libs:
  - Next.js (App Router), React, TypeScript
  - Convex (data + backend functions)
  - Clerk (authentication and organizations)
  - TailwindCSS, shadcn/ui (UI components)
  - Zod, react-hook-form (forms and validation)
  - Sonner (toasts), lucide-react (icons), qrcode.react (QR code)
    - ⚠️ qrcode.react is a client-only dependency and must not be imported in server components. Always:
      - Mark any file using qrcode.react with "use client" at the top.
      - Move QR code rendering into a dedicated client component if needed.
      - Or use a dynamic client-side import (e.g., Next.js dynamic import with SSR disabled) to ensure server components never import qrcode.react.
- Setup:
  - Install: pnpm install
  - Dev:
    - In one terminal: npx convex dev
    - In another: pnpm dev (Next.js)
  - Env (.env.local):
    - Clerk keys (publishable/secret)
    - Any Convex environment settings
    - ADMIN_USER_ID if used for admin-only queries
- Quality:
  - pnpm lint, pnpm typecheck, pnpm format
  - Add CI with lint/typecheck/test jobs

#### 8. Other Notes
- ID correctness is critical: always use Convex document IDs for orgId/userId in Convex function calls.
- Keep schema.ts indexes aligned with real query patterns; rename indexes with by_field_and_other_field for clarity and correctness.
- Prefer central model helpers (convex/models) for business logic; keep API surfaces thin and consistent.
- For public booking links, derive via organization.slug; for protected operations, scope by Convex orgId.
- When introducing new components (e.g., Combobox), keep props and event types strict and reflect nullable states (e.g., onChange: (value: string | null) => void).
- Maintain accessibility and consistent design tokens via shadcn/ui and Tailwind; avoid inline magic values when a token exists.
