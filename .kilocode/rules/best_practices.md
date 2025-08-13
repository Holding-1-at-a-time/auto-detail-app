### 📘 Project Best Practices

#### 1. Project Purpose
A multi-tenant auto-detailing application built with Next.js (App Router) and Convex. It supports:
- Organization management and auth via Clerk
- Client records, services, and assessment workflows
- Public booking by organization slug
- Real-time data with Convex queries/mutations and a strict TypeScript codebase using shadcn/ui, Tailwind, and Zod

Primary domain concerns:
- Strong org scoping for data isolation
- Strict typing end-to-end (no any)
- Accessible, consistent UI with reusable components

#### 2. Project Structure
- app/: Next.js App Router code (server/client components)
  - (app)/[organizationId]/**: Authenticated org-scoped pages (dashboard, clients, services, settings)
  - book/[orgslug]/: Public booking pages
  - layout.tsx, middleware.ts: App-wide layout and auth middleware
- convex/: Convex backend
  - schema.ts: Tables and indexes (services, assessments, users, organizations, subscriptions, clients)
  - public.ts: Public queries/mutations
  - users.ts, organizations.ts, services.ts, assessments.ts, clients.ts: API surfaces
  - models/: Internal business logic helpers (e.g., models/assessments.ts)
- components/: Reusable UI components (shadcn/ui style), navigation
- lib/, utils/, types/: Shared helpers, roles, and types
- Config: tsconfig.json, eslint.config.mjs, .prettierrc, tailwind.config.ts
- Env: .env.local (Clerk/Convex keys)

Entrypoints
- Next.js via app/ with middleware.ts (Clerk integration)
- Convex via files under convex/ and schema-defined indexes

Configuration
- Only expose publishable keys with NEXT_PUBLIC_ prefix
- Server secrets must never be imported by client components
  - Use server components, server actions ("use server"), and route handlers for secret access
- Manage production secrets via your hosting provider’s secrets manager

#### 3. Test Strategy
Current repo has no tests. Adopt the following:
- Frameworks
  - Unit: Vitest or Jest
  - React components: Testing Library + jest-dom
  - E2E: Playwright
- Structure
  - __tests__/ colocated for unit tests
  - tests/ for E2E/integration
- Mocking
  - MSW for network
  - For Convex hooks (useQuery/useMutation), wrap in test providers or mock implementations
- Philosophy
  - Unit test pure utils (formatters, mappers, validation)
  - Integration test data-fetching forms and components
  - E2E for critical flows: org scoping, assessment creation, services CRUD, public booking
- Coverage
  - Aim for ~80%+ with priority on domain-critical flows
- CI
  - Add a GitHub Action to run lint, typecheck, unit, and E2E tests on PRs

#### 4. Code Style
- TypeScript
  - strict: true, noImplicitAny: true; never use any
  - Use Convex generated types Id<"table">, Doc<"table">, WithoutSystemFields<Doc<"table">>
  - Validate args and returns with convex/values validators for all public functions
  - Avoid unsafe casts. Normalize external strings into Convex Ids via queries or ctx.db.normalizeId
- React
  - Function components with explicit prop types
  - Handle loading/error states for useQuery/useMutation
  - Derive orgId from Convex organization doc when needed; don’t cast Clerk orgId to Convex Id
- Naming
  - Files: Next.js conventions and/or kebab-case
  - Components: PascalCase; variables/functions: camelCase; constants: SCREAMING_SNAKE_CASE
- Docs/Comments
  - JSDoc/TSDoc for exported functions and complex logic
- Error Handling
  - Throw explicit errors for unauthorized/forbidden instead of returning empty data
  - UI should show user-friendly messages and log details for diagnosis
- Accessibility
  - Ensure correct ARIA on interactive components (triggers, popovers, comboboxes)
  - Keyboard navigation must be supported
- Formatting
  - Prettier + ESLint; enforce via CI

#### 5. Common Patterns
- Convex functions (new syntax)
  - export const fn = query/mutation/action({ args, returns?, handler })
  - Always include validators for args and returns (v.*). If no return value, use returns: v.null()
  - Public: query/mutation/action; Internal: internalQuery/internalMutation/internalAction
  - Access control: use ctx.auth.getUserIdentity(); throw for unauthorized
- Index-first queries
  - Prefer withIndex or withSearchIndex to avoid .filter scans
  - Add indexes in schema.ts that reflect actual access paths (e.g., by_orgId, by_orgId_and_name)
  - Use .order only when the index supports the sort order; otherwise define composite indexes
  - For large sets, use .paginate with paginationOpts
- Avoid anti-patterns
  - Avoid .collect on unbounded sets; limit, paginate, or add indexes
  - Avoid calling multiple ctx.runQuery/ctx.runMutation sequentially from actions; prefer wrapping logic in a single internal function or helper
  - Use ctx.runAction only when crossing runtimes (e.g., Node-only libraries)
- Thin API surfaces
  - Keep convex/*.ts handlers thin; delegate to convex/models helpers for business logic (e.g., createAssessmentModel)
  - Expose internal-only helpers via internalQuery/internalMutation and call from actions/other functions
- Organization scoping
  - Backend expects Convex Id<"organizations"> for org-scoped operations
  - Don’t cast Clerk orgId directly to Id<"organizations">. Instead, load the Convex organization record first
- Frontend data fetching
  - useQuery(api.fn, args) and pass undefined to skip until required args are ready
  - useMutation(api.fn) with optimistic UI as needed; implement disabled/loading states
- Forms
  - react-hook-form + zodResolver for validation
  - Keep inputs editable if value is missing (avoid blanket readOnly)
- Types
  - Use precise unions (e.g., "pending" | "reviewed" | "complete") and as const when appropriate

#### 6. Do's and Don'ts
- ✅ Do
  - Validate public function args/returns with v.*
  - Enforce org scoping on all org data access and writes
  - Throw explicit Not authenticated/Not authorized errors
  - Create and use indexes for frequent query patterns before shipping
  - Use paginate for potentially large sets
  - Implement consistent loading/disabled/error UI states
  - Keep ARIA attributes correct for interactive components
  - Keep date formatting consistent with toLocaleString and options
- ❌ Don’t
  - Don’t cast arbitrary strings to Id<"table">; only use normalized/queried values
  - Don’t expose server secrets to client bundles or import client-only libs in server components
  - Don’t use .filter on Convex queries for large scans; prefer withIndex/withSearchIndex
  - Don’t use .collect for unbounded results
  - Don’t overuse ctx.runQuery/ctx.runMutation inside actions; prefer single-transaction helpers
  - Don’t return [] to hide authorization issues—throw errors
  
#### 7. Tools & Dependencies
- Core
  - Next.js 15 (App Router), React 19, TypeScript 5 (strict)
  - Convex ^1.25 for backend + real-time data
  - Clerk for auth/org state
  - TailwindCSS 4, shadcn/ui, Radix Primitives
  - zod + react-hook-form for forms
  - sonner (toasts), lucide-react (icons), qrcode.react (QR)
    - qrcode.react is client-only. Ensure files importing it are client components ("use client") or dynamically import with SSR disabled.
- Scripts (package.json)
  - Dev (frontend+backend): pnpm dev (runs Next and convex dev)
  - Build: pnpm build; Start: pnpm start
  - Lint: pnpm lint
- Env (.env.local)
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (safe for client)
  - CLERK_SECRET_KEY and other server-only secrets (never client)
  - ADMIN_USER_ID for admin-only paths if used

#### 8. Other Notes
- IDs and access
  - Use Convex Id types for all org/user references; keep clerk identifiers as strings and map via queries
  - Align index names with fields: by_field_and_other_field
- Server vs Client boundaries
  - Never import client-only libs (like qrcode.react) from server components
  - Keep secrets on server boundaries only
- Convex specifics (concise rules)
  - Use new function syntax; register public/internal correctly; do not call db from actions
  - Only schedule and ctx.run* internal functions
  - For file storage, use ctx.storage.getUrl and query _storage via db.system
  - Pagination: use paginationOptsValidator; return the paginated object shape
- Maintainability
  - Centralize navigation and reusable UI patterns
  - Prefer helper modules in convex/models for shared logic
  - Keep schema indexes current with query patterns to avoid regressions
