# BeyondAgency

## Project: BeyondAgency

**Brief:** Nigeria's trust platform for direct deals — a mixed Platform-as-a-Service. Phase 1: residential rentals — landlords and tenants connect, agree, and legalize their tenancy entirely free. Monetization comes from the service-bid marketplace: vetted lawyers and insurers compete for optional jobs (lawyer review, rent-protection insurance), and BeyondAgency earns a commission on winning bids plus provider subscriptions — never a fee on the base deal.

**Tagline:** Bridging Trust. Simplifying Deals.

## Stack

- **Monorepo:** Turborepo + npm workspaces
- **Frontend (apps/web):** Next.js 14, TypeScript, Tailwind CSS, App Router, react-hook-form, axios, zod
- **Backend (apps/api):** Node.js, Express, TypeScript, PostgreSQL (Supabase), Zod validation
- **Shared types (packages/shared):** @beyond/shared
- **Payments:** eTranzact (all amounts in Naira — never convert to kobo; stored in Naira in DB)
- **Auth:** JWT stored in httpOnly cookies (frontend uses js-cookie)
- **Deployment:** Vercel (web), Render (api)

## Design Tokens — "Warm Institution" (Navy + Brass)

Tokens are defined once as RGB channels in `apps/web/src/app/globals.css` (`@layer base :root`) and consumed by `apps/web/tailwind.config.ts` via `rgb(var(--x) / <alpha-value>)`. **Never write a raw hex in a component** — add a token instead. Full rationale in `docs/landing-copy-audit.md` and the design plan.

**Fonts — tri-stack, loaded via `next/font` in `app/layout.tsx`:**
- `font-display` — **Fraunces**, variable, axes `SOFT`/`WONK`/`opsz`. The axes are mandatory: loading Fraunces without them (as the old Google Fonts `@import` did) leaves the weight axis unavailable and every bold heading gets faux-bolded by the browser.
- `font-body` — **DM Sans**
- `font-mono` — **DM Mono**. The "ledger voice": eyebrows, statuses, reference numbers, dates, and ₦ amounts in tables.

**Brand colors:**
- `navy-950/900/800/700/600` — `#060C12` `#0B1620` `#152330` `#1C2C3A` `#2C4E68`. `navy-900` is the primary dark surface.
- `brass-50/100/300/500/600/700` — `#FBF4E4` `#F2E4C4` `#DCBE78` `#B8862B` `#966C20` `#725218`. **`brass-500` is the primary accent and CTA color.**

**Semantic colors** (status only — these are *not* brand colors):
- `success` = forest `#1A7A4A` · `warning` = ember `#C4522A` · `danger` = crimson `#9B2226` · `info` = `navy-600`
- Forest was demoted from brand to status, and ember from brand accent to warning. Previously `Badge`'s `warning` and `danger` both rendered `bg-ember`, so "Awaiting Payment" and "Disputed" were indistinguishable.

**Neutrals — warm ink ramp** (replaces the Tailwind blue-gray defaults, which were the main source of the generic feel):
`ink-950 #17140F` · `ink-900 #211C16` · `ink-800 #2A2521` · `ink-700 #3A342D` (body text) · `ink-600` · `ink-500 #6E655A` (secondary text) · `ink-400` (placeholder) · `ink-300 #B0A697` (on-dark muted) · `ink-200 #E3DCD0` (hairline/border) · `ink-100` · `ink-50` · `paper #FAF6EE` (page ground)

**⚠️ Contrast rule — brass takes dark text.** White on `brass-500` is **3.24:1 and fails WCAG AA**; `ink-950` on `brass-500` is **5.67:1 and passes**. `Button variant="primary"` encodes this. Do not "fix" it to white. Brass *text* on `navy-900` is 5.64:1 and passes, so brass links/CTAs on dark sections are fine.

**Legacy aliases:** `navy`, `forest`, `ember`, `cream`, `charcoal`, `muted`, `border` still resolve (mapped onto the new scale) so unmigrated markup compiles. Prefer the new names in all new code.

**Other scales:** radius `sm 6` / `button 8` / `card 12` / `xl 16` / `2xl 24` / `chat`; shadows `xs`–`xl` plus `ring` and `brass`, all warm-tinted `rgba(33,28,22,…)`; fluid type `display-xl`→`display-sm`, `title`, `body-lg`/`body`/`body-sm`, `label`; widths `form`/`content`/`wide`/`shell` via `<Container>`; durations `fast 150` / `base 220` / `slow 320` / `deliberate 480`.

**Motion:** Framer Motion only, via `components/motion/` (`Reveal`, `RevealGroup`, `AnimatedNumber`). A global `prefers-reduced-motion` kill switch lives in `globals.css`, and the Framer components also check `useReducedMotion()` because inline transforms aren't neutralized by CSS alone.

**Texture:** `.bg-grain` (inline `feTurbulence` SVG at 3.5%) — applied automatically by `<Section tone="dark">`. This is what keeps dark bands from reading as flat fill.

## Roles

- **LANDLORD:** Can create properties, initiate agreements, view tenant rental history
- **TENANT:** Can view and accept agreements, build rental history, request rental history export
- **PROVIDER:** Licensed lawyer or insurer who bids on optional jobs in the service-bid marketplace

## Key Business Rules

- **Landlord:** lists properties FREE, connects with tenants FREE
- **Tenant:** connects with landlords FREE; accepting an agreement is FREE — no legalization fee, no percentage of rent, no platform charge on the base deal (`BEYOND_PRICING.BASE_LEGALIZATION_FEE` is explicitly `0`)
- **Agreement flow:** landlord creates DRAFT (free) → tenant reviews via preview → tenant accepts → agreement goes **ACTIVE immediately**, no payment gate. `calculateLegalizationFee()` / `LEGALIZATION_FEE_*` constants in `@beyond/shared` are deprecated — kept only so agreements created before this pivot can still resolve their historical snapshotted fee. Do not use them to charge new agreements.
- **Tenant:** optional lawyer deep-review add-on — a flat `LAWYER_REVIEW_ADDON` fee (₦20,000), delivered by BeyondAgency's own **in-house, monthly-salaried legal team**, not the open bid marketplace. Paid separately from — and never blocking — agreement acceptance. On payment confirmation the job auto-assigns to whichever ACTIVE `employment_type: 'INTERNAL'` `LEGAL` provider currently has the lightest load that month (`findLeastBusyInternalProvider()` / `createAndAssignLegalReviewJob()` in `apps/api/src/db/queries/marketplace.ts`) — no competitive bidding, one bid is created on their behalf and awarded immediately. Falls back to the old open-bid shape only if zero internal lawyers are onboarded yet (an edge case, not the intended steady state — hire at least one before relying on this).
- **Tenant:** optional rent-protection insurance — genuine service-bid marketplace mechanic (`INSURANCE` category, `employment_type: 'EXTERNAL'` providers) once insurer partners are onboarded; we earn commission (`INSURANCE_COMMISSION_RATE`), we do **not** underwrite the policy
- **Service-bid marketplace (external categories only):** applies to `INSURANCE` now, more categories later (inspection, moving, tech services). Vetted `PROVIDER`-role users with `employment_type: 'EXTERNAL'` bid on `service_jobs` via `service_bids`; the platform earns `PLATFORM_COMMISSION_RATE` deducted from the provider's payout (never added on top of what the requester pays) plus optional `PROVIDER_PRIORITY_SUBSCRIPTION` fees for priority bid-pool visibility. `LEGAL` is intentionally excluded from this — see above. Public applications for `category: 'LEGAL'` are rejected at `POST /marketplace/providers/apply`; internal staff are onboarded via the admin-only `POST /marketplace/providers/internal` instead. See `apps/api/src/routes/marketplace.ts` and `apps/api/src/db/queries/marketplace.ts`.
- **Tenant:** ₦5,000 rental history export
- **Landlord:** optional ₦20,000/month subscription for 5+ properties
- **Pricing constants:** all prices/rates live in `BEYOND_PRICING` (`packages/shared/src/constants/pricing.ts`) — never hardcode a Naira amount or a fee rate in a route handler or component
- **Payment timing:** there is no payment at agreement acceptance. The only tenant-side payment is the optional lawyer-review add-on, initiated at accept time but independent of the ACTIVE status change.
- **Rental history export:** ₦5,000
- **Bid award:** a job's winning bid is awarded automatically right after its associated payment is confirmed via the payments webhook (`awardJob()` in `apps/api/src/db/queries/marketplace.ts`) — picks the lowest qualifying bid unless a preferred provider is specified. No cron/retry exists yet for jobs that receive zero bids before the award attempt.
- **Agreement visibility:** Only visible to the two parties involved (landlord + tenant)
- **Property deletion:** Soft delete only (is_deleted flag, never hard delete)
- **Monetary storage:** All values stored in **Naira** (2 decimal places) in DB; eTranzact amounts are in Naira — never convert to kobo

## Future Phases

BeyondAgency is a multi-sector trust platform, not a single-purpose rental tool — architecture should not hardcode assumptions that would block later phases. Current direction (see `docs/BeyondAgency_Vision_and_Strategy.docx`, `docs/BeyondAgency_Execution_Roadmap.docx`): the reusable core is verified party + enforceable agreement + staged settlement, not "marketplace" — each phase applies that same mechanism to a new domain rather than opening the platform to arbitrary categories.

- **Phase 2 (current):** Property verification & escrow for remote/absentee buyers — domestic Nigerians are the primary market (largest, fastest to prove, no cross-border complexity), diaspora buyers are an addition layered on once the domestic flow works, not the initial target. Groundwork in progress: a single, category-agnostic user `verification_tier` (Tier 1 = phone + BVN/NIN, Tier 2 = liveness + document) at `apps/api/src/lib/identity/` (mirrors `lib/payments/` — provider-agnostic interface, no real KYC provider wired up yet, `stub` auto-approves for dev/testing only), plus `properties.title_verification_status` and a `verifications` audit table. Escrow itself (staged fund release tied to verified milestones) is not yet built — payments still go through the ACTIVE-immediately rental flow.
- **Phase 3:** SME-bankable agreements — package the enforceable-agreement mechanism as a credit-reference product lenders recognize.
- **Phase 4:** Equipment/energy asset leasing (lease-to-own), insurance comparison (multiple insurer partners), legal marketplace beyond the single deep-review add-on.

Barter-as-a-service was evaluated and explicitly deferred — real regulatory risk (valuation/credit-instrument exposure) and no evidenced demand signal, see the Vision & Strategy doc.

Keep fee/product logic (e.g. `calculateLegalizationFee`, insurance interest capture) generic enough to extend rather than rewrite when these land.

## Payment Rail: eTranzact

Flutterwave has been fully removed and replaced by eTranzact. Payments go through a provider-agnostic layer at `apps/api/src/lib/payments/` (`types.ts` defines the `PaymentProvider` interface; `etranzact.ts` implements it; `index.ts` is the single switch point) — route/query files import from `../lib/payments`, never a provider SDK directly. Adding a future rail means writing one new file there, not touching every route that collects money.

- eTranzact amounts are in Naira — never convert to kobo
- Collection model is fundamentally different from Flutterwave's hosted checkout: eTranzact's **Virtual Account** product generates a dedicated, per-transaction bank account (`POST /account`, `accountType: 0` = dynamic); the payer transfers into it directly. There is no redirect/hosted-checkout page and no card/USSD-in-browser modal — `initializePayment()` returns `{ mode: 'account_transfer', accountNumber, bankName, accountName, ... }` rather than a `paymentLink`. The frontend renders this via `@/components/shared/PaymentInstructions`.
- `verifyPayment(reference)` takes our own internal reference (same one passed into `initializePayment`), not a provider transaction ID — it queries `GET /transaction/verify` / `GET /transaction/all` filtered by that reference (used as eTranzact's `customerID`).
- **Open item:** eTranzact's documented API doesn't expose a confirmed merchant webhook payload schema for "account funded" events (unlike Flutterwave's documented `charge.completed`). The `/payments/webhook` route currently treats any inbound hit as a signal to re-verify via `verifyPayment()` rather than trusting the body directly — confirm the real webhook contract with eTranzact support before relaxing this.
- The `payments.payment_reference` column (formerly `paystack_reference`, which itself never actually stored a Paystack value — see `supabase/migrations/20260810000000_rename_paystack_reference.sql`) holds this internal reference for every provider.

## API Base URL

- **Development:** `http://localhost:5000/api/v1`
- All routes prefixed with `/api/v1`

## Environment Setup

1. Copy `.env.example` to `.env` at repo root
2. Copy `.env.example` to `apps/api/.env`
3. Never commit `.env` files
4. Required variables:
   - `DATABASE_URL` — PostgreSQL connection string
   - `SUPABASE_URL` — Supabase project URL
   - `SUPABASE_ANON_KEY` — Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
   - `JWT_SECRET` — Secret for JWT signing
   - `PAYMENT_PROVIDER` — active payment rail, defaults to `etranzact` (see apps/api/src/lib/payments/)
   - `ETRANZACT_SECRET_KEY` — eTranzact API secret key
   - `ETRANZACT_PRODUCT_CODE` — eTranzact-issued product code
   - `ETRANZACT_WEBHOOK_SECRET` — shared secret for validating inbound eTranzact notifications
   - `ETRANZACT_BASE_URL` — eTranzact API host (defaults to their demo host; override for production)
   - `NEXT_PUBLIC_API_URL` — Frontend API URL (e.g., `http://localhost:5000/api/v1`)
   - `FRONTEND_URL` — Web app base URL, used by the API to build tenant invite/redirect links (e.g., `http://localhost:3000`)
   - `NODE_ENV` — development/production
   - `PORT` — API port (default 5000)
   - `ADMIN_EMAILS` — comma-separated allowlist; there is no dedicated ADMIN role in the schema, so admin-only marketplace routes (provider verification, internal staff onboarding at `/admin`) gate on whether the authenticated user's email is in this list

## File Structure

```
leja/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── properties.ts
│   │   │   │   ├── agreements.ts
│   │   │   │   ├── payments.ts
│   │   │   │   └── rentalHistory.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rateLimit.ts
│   │   │   │   └── validate.ts
│   │   │   ├── db/
│   │   │   │   ├── index.ts
│   │   │   │   ├── schema.sql
│   │   │   │   └── seed.sql
│   │   │   ├── lib/
│   │   │   │   ├── jwt.ts
│   │   │   │   └── flutterwave.ts
│   │   │   └── services/
│   │   └── package.json
│   │
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── globals.css
│       │   │   ├── page.tsx (landing)
│       │   │   ├── login/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── layout.tsx
│       │   │   │   └── page.tsx
│       │   │   └── agreement/
│       │   │       └── new/page.tsx
│       │   ├── lib/
│       │   │   ├── api.ts
│       │   │   └── utils.ts
│       │   ├── hooks/
│       │   │   └── useAuth.ts
│       │   └── components/
│       │       ├── ui/
│       │       │   ├── Button.tsx
│       │       │   ├── Input.tsx
│       │       │   └── Card.tsx
│       │       └── layout/
│       │           ├── Navbar.tsx
│       │           └── Sidebar.tsx
│       └── package.json
│
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   │   ├── user.ts
│       │   │   ├── property.ts
│       │   │   ├── agreement.ts
│       │   │   ├── payment.ts
│       │   │   ├── rentalHistory.ts
│       │   │   └── api.ts
│       │   └── index.ts
│       └── package.json
│
├── turbo.json
├── package.json
├── tsconfig.json
├── .prettierrc
├── .gitignore
├── .env.example
└── CLAUDE.md
```

## Conventions

- **API Responses:** All responses use `ApiResponse<T>` shape from @beyond/shared:
  ```typescript
  {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
  }
  ```
- **Zod schemas:** Live in `apps/api/src/lib/schemas/` — one file per domain
- **Database queries:** Use Supabase client for simple CRUD, raw pg Pool for complex joins
- **Type safety:** No `any` types — use @beyond/shared types throughout
- **Branch names:** `feature/short-description`, `fix/short-description`
- **Commit style:** Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`)

## Dev Commands

```bash
# Install dependencies
npm install

# Run dev servers (web on 3000, api on 5000)
npm run dev

# Build all
npm run build

# Type check
npm run type-check

# Clean
npm run clean
```

## Rate Limiting

- **Agreement endpoints:** 20 requests per 15 minutes per IP
- **Auth endpoints:** 10 requests per 15 minutes per IP

## Testing Data

See `apps/api/src/db/seed.sql` for sample data:
- Landlord: `landlord@example.com`
- Tenants: `tenant1@example.com`, `tenant2@example.com`
- Properties: 2 in Lagos (2BR & 3BR)
- Agreement: 1 ACTIVE agreement between landlord and tenant1

## Deployment

- **Frontend:** Vercel — deploys from apps/web on push to main
- **Backend:** Render — deploys from apps/api on push to main
  - Service name: leja-api
  - Health check: GET /health
  - Cold start prevention: ping /health every 10 minutes via UptimeRobot
  - Production URL: https://leja-api.onrender.com (update when service is live)
- **Database:** Supabase (PostgreSQL)
- **File storage:** Supabase Storage (bucket: agreements — for PDF storage)

## Environment Files

- **Root .env.example** — template only, commit this
- **apps/api/.env** — never commit, copy from .env.example and fill values
- **apps/web/.env.local** — never commit, set NEXT_PUBLIC_API_URL. No client-side payment SDK key is needed — unlike the old Flutterwave inline-modal integration, eTranzact's virtual-account model is server-initiated only (see PaymentInstructions component); there is nothing equivalent to `NEXT_PUBLIC_FLW_PUBLIC_KEY` to set.

## Production Environment Variables

**Set on Render dashboard (apps/api):**
- DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET, PAYMENT_PROVIDER, ETRANZACT_SECRET_KEY, ETRANZACT_PRODUCT_CODE, ETRANZACT_WEBHOOK_SECRET, ETRANZACT_BASE_URL
- FRONTEND_URL=https://leja.ng (or the Vercel URL, used for tenant invite/redirect links)
- NODE_ENV=production, PORT=5000

**Set on Vercel dashboard (apps/web):**
- NEXT_PUBLIC_API_URL=https://leja-api.onrender.com/api/v1
