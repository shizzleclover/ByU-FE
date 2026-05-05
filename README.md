# ByU Connect — Frontend

A student talent directory for Babcock University. Students build a public "canvas" — a profile page showcasing their services, projects, stories, and links — discoverable by peers, employers, and the campus community.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Route Architecture](#route-architecture)
4. [Design System](#design-system)
5. [Component Library](#component-library)
6. [State & Data Fetching](#state--data-fetching)
7. [Authentication Flow](#authentication-flow)
8. [API Integration](#api-integration)
9. [Key Features](#key-features)
10. [Environment Variables](#environment-variables)
11. [Running Locally](#running-locally)
12. [Deployment](#deployment)
13. [Planned Features](#planned-features)
14. [Conventions](#conventions)

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components, file-based routing, image optimisation |
| Language | TypeScript 5.7 | End-to-end type safety with backend API types |
| Styling | Tailwind CSS v4 | Utility-first, design token system via CSS `@theme` |
| Animations | Framer Motion + Lottie | Page transitions, scroll reveals, micro-interactions |
| Smooth Scroll | Lenis | Physics-based scroll, syncs with Framer Motion |
| Data Fetching | TanStack React Query v5 | Caching, optimistic updates, infinite scroll |
| Forms | React Hook Form + Zod | Schema-validated forms, minimal re-renders |
| HTTP Client | Axios | Interceptors for token refresh, typed responses |
| Drag & Drop | @dnd-kit | Sortable lists (canvas layout, services, links) |
| Markdown | @uiw/react-md-editor | Rich markdown editing for projects and stories |
| Toasts | Sonner | Non-blocking notifications |
| Icons | Lucide React | Consistent stroke-based icon set |
| Analytics | Vercel Analytics | Page views, production only |

---

## Project Structure

```
frontend/
├── app/                        # Next.js App Router pages
│   ├── (admin)/                # Admin-only pages (role === 'admin')
│   │   └── admin/
│   │       ├── featured/       # Manage featured profiles
│   │       ├── reports/        # Content moderation
│   │       └── users/          # User management + bulk import
│   ├── (auth)/                 # Unauthenticated auth pages
│   │   ├── signin/
│   │   ├── signup/
│   │   ├── verify-email/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── onboarding/         # Post-signup profile setup wizard
│   ├── (authed)/               # Authenticated dashboard pages
│   │   └── dashboard/
│   │       ├── page.tsx        # Overview with stats + verification status
│   │       ├── profile/        # Edit profile info + avatar
│   │       ├── canvas-layout/  # Drag to reorder canvas sections
│   │       ├── services/       # Add/edit/delete services
│   │       ├── projects/       # Projects CRUD + ProjectEditor
│   │       ├── links/          # Links manager with drag reorder
│   │       ├── stories/        # Stories CRUD + StoryEditor (markdown)
│   │       ├── contacts/       # Contact methods (WhatsApp, email, etc.)
│   │       ├── resume/         # PDF upload
│   │       ├── saved/          # Saved profiles
│   │       ├── analytics/      # View/outreach charts
│   │       └── settings/
│   │           ├── account/    # Change email, password, username
│   │           ├── verification/ # Student email verification flow
│   │           └── danger/     # Delete account
│   └── (public)/               # Public-facing pages, no auth required
│       ├── page.tsx            # Landing page
│       ├── discover/           # Student discovery with filters
│       └── [username]/         # Public canvas pages
│           ├── page.tsx        # Main canvas
│           ├── projects/[slug]/
│           └── stories/[slug]/
├── components/
│   ├── editorial/              # Typography + layout primitives
│   ├── icons/                  # Logo and brand icons
│   ├── layout/                 # Nav, sidebar, topbar, footer
│   ├── motion/                 # Animation wrappers
│   ├── ui/                     # General UI components
│   └── Providers.tsx           # QueryClient + Lenis provider root
├── features/
│   └── canvas/                 # Canvas view + reach-out modal
├── hooks/                      # Custom React hooks
├── lib/                        # API client, utilities, constants
├── public/
│   └── animations/             # Lottie JSON files
└── types/
    └── api.ts                  # TypeScript interfaces matching backend
```

---

## Route Architecture

The app uses **Next.js route groups** — folders wrapped in `(parentheses)` that group pages under a shared layout without adding to the URL.

### `(public)` — No authentication required
Layout: `PublicNav` + `LenisProvider` + `PublicFooter`

| URL | Page |
|---|---|
| `/` | Landing page |
| `/discover` | Student discovery grid/list |
| `/discover/[category]` | Category-filtered discovery |
| `/:username` | Student canvas (public profile) |
| `/:username/projects/:slug` | Individual project page |
| `/:username/stories/:slug` | Individual story page |

### `(auth)` — Unauthenticated only
Layout: Centered single-column, no nav. Authenticated users are redirected to `/dashboard` by middleware.

| URL | Page |
|---|---|
| `/signin` | Sign in |
| `/signup` | Create account |
| `/verify-email` | OTP verification after signup |
| `/onboarding` | 3-step profile setup wizard |
| `/forgot-password` | Request password reset email |
| `/reset-password` | Set new password via token |

### `(authed)` — Requires authentication
Layout: `DashboardSidebar` (desktop) + `DashboardMobileNav` (mobile) + `DashboardTopbar`. The layout checks `useAuth()` client-side and redirects to `/signin` if unauthenticated. The outer container is `h-screen overflow-hidden` so the main column scrolls independently of the sidebar.

All `/dashboard/*` routes live here.

### `(admin)` — Requires `role === 'admin'`
Layout: Admin shell. Middleware checks cookie presence; layout checks role. Double-gated.

| URL | Page |
|---|---|
| `/admin` | Admin overview |
| `/admin/users` | User management table |
| `/admin/users/import` | Bulk import from Excel |
| `/admin/reports` | Content moderation |
| `/admin/featured` | Manage featured profiles |

### Middleware (`middleware.ts`)
Runs at the edge before every request. Checks for an `auth_present` cookie (a plain JS-accessible cookie set by the frontend on sign-in). This is separate from the httpOnly `refreshToken` cookie set by the backend — since the backend is on a different domain (`onrender.com`), the browser cannot send its httpOnly cookie to the Next.js server. `auth_present` is the cross-domain-safe solution.

- `/dashboard/*` without `auth_present` → redirect to `/signin?redirect=<path>`
- `/admin/*` without `auth_present` → redirect to `/signin`
- `/signin`, `/signup` with `auth_present` → redirect to `/dashboard`

---

## Design System

The design language is editorial/brutalist — inspired by high-fashion publishing (Detroit, Acne Studios). Minimal ornamentation, strong typography, off-white background.

### Palette (defined in `globals.css` via CSS `@theme`)

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FAFAF7` | Page background |
| `--color-bg-elevated` | `#F5F4F0` | Sidebar, cards |
| `--color-bg-sunken` | `#EEEDE8` | Input backgrounds, skeletons |
| `--color-ink` | `#0F0F0E` | Primary text |
| `--color-ink-soft` | `#2C2C2A` | Secondary text |
| `--color-ink-muted` | `#6B6B68` | Labels, captions |
| `--color-ink-faint` | `#A8A8A4` | Placeholders |
| `--color-ink-ghost` | `#D4D3CE` | Disabled, decorative |
| `--color-line` | `#E8E7E2` | Borders, dividers |
| `--color-state-success` | `#1A7F4B` | Verified badge (green), success states |
| `--color-state-error` | `#C0392B` | Error states |

Blue (`#4A90E2` / Tailwind `blue-500`) is used exclusively for the verified student badge. It is not part of the core palette.

### Typography Scale (composite CSS classes in `globals.css`)

All text uses **Space Grotesk** (loaded via `next/font/google`, variable `--font-space-grotesk`).

| Class | Size | Weight | Usage |
|---|---|---|---|
| `.text-display` | `clamp(96px, 15vw, 220px)` | 700 | Hero headlines |
| `.text-h1` | `clamp(48px, 6vw, 80px)` | 700 | Page titles |
| `.text-h2` | `clamp(36px, 4vw, 56px)` | 700 | Section headers |
| `.text-h3` | `clamp(28px, 3vw, 40px)` | 700 | Dashboard greeting |
| `.text-h4` | `24px` | 700 | Card titles |
| `.text-h5` | `20px` | 700 | Sub-section titles |
| `.text-h6` | `16px` | 700 | Sidebar nav, topbar |
| `.text-lead` | `18px` | 400 | Canvas bio |
| `.text-body` | `16px` | 400 | General body text |
| `.text-meta` | `14px` | 400 | Metadata rows |
| `.text-caption` | `13px` | 400 | Captions, helper text |
| `.text-overline` | `11px / tracking 0.1em / uppercase` | 700 | Labels, buttons, badges |

### Layout Containers

`Container.tsx` accepts a `variant` prop:

| Variant | Max Width | Usage |
|---|---|---|
| `content` | `1440px` | Standard page sections |
| `narrow` | `840px` | Medium content |
| `prose` | `640px` | Story/article body |
| `wide` | `1680px` | Full-bleed sections |

All variants include `px-6 md:px-12 lg:px-16` horizontal padding. Use the CSS class `container-content` for the most common case.

### Motion System (`lib/motion.ts`)

```ts
ease.out      // [0.22, 1, 0.36, 1]   — standard ease out
ease.inOut    // [0.65, 0, 0.35, 1]   — page transitions
ease.in       // [0.64, 0, 0.78, 0]   — exit animations
ease.expoOut  // [0.16, 1, 0.3, 1]    — snappy entrances

duration.fast   // 0.2s
duration.base   // 0.4s
duration.slow   // 0.6s
duration.page   // 0.8s
```

Import these everywhere instead of hardcoding values to keep motion consistent.

---

## Component Library

### Editorial (`components/editorial/`)

| Component | Props | Purpose |
|---|---|---|
| `Display` | `as`, `className` | Renders `.text-display` headline |
| `Overline` | `className` | Uppercase label/eyebrow text |
| `Hairline` | `className` | Full-width `1px` border separator |
| `EditorialList` | `profiles`, `className` | Detroit-style hover list — ghosted names, cursor-tracked preview pane on hover |

### Layout (`components/layout/`)

| Component | Notes |
|---|---|
| `PublicNav` | Fixed top nav for public pages. Logo left, nav links right, mobile hamburger. |
| `PublicFooter` | 3-column links + copyright. |
| `Container` | Max-width wrapper, see variants above. |
| `DashboardSidebar` | 240px fixed sidebar. Logo, user info, completeness bar, nav items, settings + sign-out at bottom. Desktop only. |
| `DashboardTopbar` | 56px header. Page title left, "View canvas" link right. `shrink-0` — never scrolls. |
| `DashboardMobileNav` | Bottom tab bar, mobile only. |

### Motion (`components/motion/`)

| Component | Props | Purpose |
|---|---|---|
| `Loader` | — | Full-viewport intro animation. Plays once per session (sessionStorage gate). Marks + curtain slide. |
| `PageTransition` | `children` | `AnimatePresence` wrapper for route transitions. Wrap at root layout level. |
| `Reveal` | `delay`, `as`, `className` | Scroll-triggered fade + slide up (y: 40→0, opacity: 0→1). Wrap any content block. |
| `ScrollMask` | `className` | Clip-path reveal on scroll: `inset(0 0 100%)` → `inset(0 0 0%)`. Good for images. |

### UI (`components/ui/`)

Custom components worth noting (the rest are standard shadcn/ui):

| Component | Notes |
|---|---|
| `AppSelect` | Custom styled select dropdown. Two variants: `default` (borderless) and `form` (bottom-border editorial style). Used everywhere instead of the native `<select>`. |
| `VerifiedAnimation` | Wraps `lottie-react` with the verified badge animation. `size` prop (default 100px), `loop` prop (default false). Dynamically imported — no SSR. |
| `Stepper` | Multi-step form wizard with animated step transitions. Used in onboarding. |

### Icons (`components/icons/`)

| Component | Notes |
|---|---|
| `Logo` | The ByU Connect mark SVG. Accepts `size` and `href` props. |

---

## State & Data Fetching

**TanStack React Query** handles all server state. No Redux, no Zustand.

### Query Keys Convention

Keys follow a `[resource, scope]` pattern:

```ts
['auth', 'me']            // current user
['profile', 'me']         // current user's profile
['projects', 'me']        // current user's projects
['discovery', { ...params }]  // discovery results (infinite)
['analytics', 'overview'] // analytics data
```

Invalidate by resource prefix after mutations:
```ts
qc.invalidateQueries({ queryKey: ['profile', 'me'] })
```

### React Query Client (`lib/queryClient.ts`)

```ts
staleTime: 60_000     // data fresh for 1 minute
retry: 1              // retry once on failure
refetchOnWindowFocus: false
```

### `Providers.tsx`

Wraps the entire app with `QueryClientProvider` and `LenisProvider`. Lives in `app/layout.tsx`. All query clients share the same instance.

---

## Authentication Flow

### Sign Up
1. `POST /auth/signup` → receives `{ user, accessToken }`
2. Token stored in memory + `sessionStorage` (for tab refresh)
3. `auth_present=1` cookie set on the frontend domain
4. Redirect to `/verify-email` → 6-digit OTP → `POST /auth/verify-email`
5. On OTP success → redirect to `/onboarding` (3-step wizard: name/bio, department/year, services)
6. On onboarding complete → redirect to `/dashboard`

### Sign In
1. `POST /auth/signin` → receives `{ user, accessToken }` + sets httpOnly `refreshToken` cookie on backend domain
2. `setAccessToken(token)` — stores in memory, sessionStorage, sets `auth_present` cookie
3. `qc.setQueryData(AUTH_KEY, user)` — no refetch needed
4. `router.push('/dashboard')`

### Token Refresh
The Axios response interceptor in `lib/api.ts` intercepts any 401 response:
1. Queues all in-flight requests
2. `POST /auth/refresh` using the httpOnly `refreshToken` cookie (sent automatically by browser since it's a same-origin request to the API)
3. On success: update access token, drain queue, retry original requests
4. On failure: clear tokens, redirect to `/signin`

### `useAuth` Hook (`hooks/useAuth.ts`)
- Calls `GET /auth/me` on mount → returns fresh access token + user object
- Exposes: `user`, `isLoading`, `isAuthenticated`, `isAdmin`, `signOut()`
- `signOut()` calls `POST /auth/signout`, clears all tokens and cookies, hard-redirects to `/signin`

### Student Verification
Separate from account email verification. Flow:
1. User enters `@student.babcock.edu.ng` address on `/dashboard/settings/verification`
2. `POST /verification/student-email/start` → OTP sent to student inbox
3. User enters 6-digit code → `POST /verification/student-email/confirm`
4. `studentEmailVerifiedAt` set on user, `isVerified: true` on profile
5. Blue animated badge appears on canvas, dashboard overview, and discover cards

---

## API Integration

All requests go through `lib/api.ts`.

### Base URL
Set via `NEXT_PUBLIC_API_URL` env var. Falls back to `http://localhost:5000/api/v1`.

### Helper Functions

```ts
apiGet<T>(path, params?)        // GET request, returns T (unwraps data.data)
apiPost<T>(path, body?)         // POST request
apiPatch<T>(path, body?)        // PATCH request
apiDelete<T>(path)              // DELETE request
```

Always use these instead of calling `api.get()` directly — they unwrap the backend's `{ success: true, data: T }` envelope.

### File Uploads (Cloudinary)
The app uses **signed direct uploads** — the backend never handles the file itself:

1. `POST /upload/sign` with `{ type: 'cover' | 'gallery' | 'avatar' | 'story' }` → returns `{ signature, timestamp, apiKey, cloudName, folder }`
2. Client posts the file directly to `https://api.cloudinary.com/v1_1/{cloudName}/image/upload` with the signature
3. Cloudinary returns `{ secure_url, public_id }`
4. Client saves the URL via the relevant PATCH endpoint

### Backend Response Envelope
Every response from the API is shaped as:
```ts
{ success: true, data: T }           // success
{ success: false, error: { message, code } }  // error
```
The helpers unwrap `data.data` so callers receive `T` directly.

---

## Key Features

### Canvas (`features/canvas/`)
A user's public profile page. Sections render in the order stored in `profile.canvasLayout` (configured via drag-and-drop in `/dashboard/canvas-layout`). Available sections: `services`, `projects`, `links`, `stories`, `resume`. Empty sections are skipped.

**Mobile**: avatar shown as a full-bleed hero image at the top of the page (aspect 4:3), fading to the background colour via gradient.

**Desktop**: avatar shown as 128px square alongside the name.

**Contacts**: render as direct-action buttons (WhatsApp → `wa.me/`, email → `mailto:`, etc.) logged to analytics on click. Primary contact renders filled black, others outlined.

### Discovery (`app/(public)/discover/`)
Infinite scroll grid of student profiles. Portrait `aspect-[3/4]` cards with full-bleed images and gradient overlay. Supports:
- Keyword search (debounced)
- Category filter (horizontal chip scroll on mobile)
- Verified-only toggle
- Sort: featured first / most complete / recently active
- View toggle: grid (default) / editorial list (desktop)

Cursor-based pagination — `nextCursor` from each page response feeds into the next query.

### Onboarding (`app/(auth)/onboarding/`)
3-step wizard built with `Stepper` component and `react-hook-form`. Steps:
1. Full name + bio
2. Department + year level (Babcock: 100L–800L + PG)
3. Service categories (multi-select)

On completion: `POST /auth/onboarding`. On error or form validation failure, routes to `/dashboard` rather than staying stuck.

---

## Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://byu-connect-api.onrender.com/api/v1
NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN=student.babcock.edu.ng
```

For local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN=student.babcock.edu.ng
```

On **Vercel**, set these in Project Settings → Environment Variables. `NEXT_PUBLIC_*` variables are inlined at build time so they must be set before deployment.

---

## Running Locally

**Prerequisites:** Node 20+, pnpm

```bash
# Install dependencies
cd frontend
pnpm install

# Start dev server
pnpm dev
```

The backend must be running at the URL specified in `NEXT_PUBLIC_API_URL`. See the backend README for setup.

### Type Checking

```bash
# Standard (may OOM on low-RAM machines)
npx tsc --noEmit

# If it crashes with OOM
node --max-old-space-size=4096 node_modules/typescript/bin/tsc --noEmit
```

---

## Deployment

The frontend is deployed on **Vercel** connected to the GitHub repository (`shizzleclover/ByU-FE`). Every push to `main` triggers an automatic deployment.

**Required Vercel environment variables:**
```
NEXT_PUBLIC_API_URL              = https://byu-connect-api.onrender.com/api/v1
NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN = student.babcock.edu.ng
```

**Production URL:** `https://www.byu-connect.com`

The backend is deployed separately on **Render** as a Node web service (`byu-connect-api.onrender.com`). The backend README covers its deployment.

---

## Planned Features

### Admin Bulk Import (`/admin/users/import`)
Upload an Excel/CSV spreadsheet to mass-create student accounts. Flow:
1. Admin uploads `.xlsx` / `.csv` with columns: `fullName`, `email`, `username` (optional — derived from name), `department`, `level`
2. Sheet is parsed client-side for preview — each row shown with validation state (valid / duplicate / bad data)
3. On confirm: `POST /admin/bulk-import` — backend creates User + Profile per row, generates a temporary password, sends a branded welcome email to each student
4. Results summary: Created X · Skipped Y (duplicates) · Failed Z (bad data)
5. Duplicate handling: skip rows where email already exists, flag them in results

### Admin Overview (`/admin`)
Platform metrics dashboard: total users, verified users, pending reports, recent signups.

### Admin Reports (`/admin/reports`)
Moderation queue for flagged profiles. Split-panel UI — report details left, profile summary right. Actions: dismiss, warn, suspend.

### Admin Featured (`/admin/featured`)
Drag-to-reorder list of featured profiles. Search to add. Featured profiles appear on the landing page image rail.

### `needsPasswordReset` Flow
Accounts created via bulk import are flagged `needsPasswordReset: true`. On first sign-in these users are redirected to `/reset-password` to set a permanent password.

---

## Conventions

### File Naming
- Pages: `page.tsx` (Next.js convention)
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`

### Imports
Path alias `@/` maps to the `frontend/` root. Always use `@/` — no relative `../` imports.

### Forms
All forms use `react-hook-form` + `zod`. Define the schema first, derive the type with `z.infer<typeof schema>`, pass to `zodResolver`. Error messages render below the relevant field as `text-caption text-state-error`.

### API Calls in Components
Never call `api.get()` / `api.post()` directly in component files. Always use `apiGet` / `apiPost` / `apiPatch` / `apiDelete` from `lib/api.ts`. For mutations that need special headers (e.g. file uploads), use `api.post()` directly and handle the envelope manually.

### Adding a New Dashboard Page
1. Create `app/(authed)/dashboard/your-page/page.tsx`
2. Start with `<DashboardTopbar title="Your Page" />`
3. Wrap content in `<div className="flex-1 px-6 md:px-8 py-10 overflow-auto">`
4. Add the route to `NAV_ITEMS` in `components/layout/DashboardSidebar.tsx`

### Toast Notifications
Always use `toast.success()` / `toast.error()` from `sonner`. For error messages from API calls, surface the actual error message:
```ts
onError: (err: unknown) => {
  const msg = err instanceof Error ? err.message : 'Something went wrong.'
  toast.error(msg)
}
```

### Comments
Write no comments unless the *why* is non-obvious. Never describe what the code does — the code does that. Only document hidden constraints, non-obvious invariants, or workarounds.
