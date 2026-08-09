# BeyondAgency

## Project: BeyondAgency

**Brief:** Nigeria's trust platform for direct deals — a mixed Platform-as-a-Service. Phase 1: residential rentals — landlords and tenants connect, agree, and legalize their tenancy entirely free. Monetization comes from the service-bid marketplace: vetted lawyers and insurers compete for optional jobs (lawyer review, rent-protection insurance), and BeyondAgency earns a commission on winning bids plus provider subscriptions — never a fee on the base deal.

**Tagline:** Bridging Trust. Simplifying Deals.

## Stack

- **Monorepo:** Turborepo + npm workspaces
- **Frontend (apps/web):** Next.js 14, TypeScript, Tailwind CSS, App Router, react-hook-form, axios, zod
- **Backend (apps/api):** Node.js, Express, TypeScript, PostgreSQL (Supabase), Zod validation
- **Shared types (packages/shared):** @beyond/shared
- **Payments:** Flutterwave (all amounts in Naira — never convert to kobo; stored in Naira in DB)
- **Auth:** JWT stored in httpOnly cookies (frontend uses js-cookie)
- **Deployment:** Vercel (web), Render (api)

## Design Tokens

**Primary font:** Fraunces (display/headings), DM Sans (body)

**Colors:**
- Navy: `#0D1B2A` (primary brand)
- Forest: `#1A7A4A` (primary action/success)
- Ember: `#C4522A` (accent/warning/CTA)
- Cream: `#F7F9FC` (background)
- Charcoal: `#2D3748` (body text)
- Muted: `#718096` (secondary text)
- Border: `#E2E8F0` (borders)

**Border Radius:**
- Card: 12px
- Button: 8px

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
- **Bid award:** a job's winning bid is awarded automatically right after its associated payment is confirmed via the Flutterwave webhook (`awardJob()` in `apps/api/src/db/queries/marketplace.ts`) — picks the lowest qualifying bid unless a preferred provider is specified. No cron/retry exists yet for jobs that receive zero bids before the award attempt.
- **Agreement visibility:** Only visible to the two parties involved (landlord + tenant)
- **Property deletion:** Soft delete only (is_deleted flag, never hard delete)
- **Monetary storage:** All values stored in **Naira** (2 decimal places) in DB; Flutterwave amounts are in Naira — never convert to kobo

## Future Phases

BeyondAgency is a multi-sector trust platform, not a single-purpose rental tool — architecture should not hardcode assumptions that would block later phases:

- **Phase 2:** Insurance comparison (multiple insurer partners, not just one)
- **Phase 3:** Legal marketplace (lawyers beyond the single deep-review add-on)
- **Phase 4:** Tech services marketplace

Keep fee/product logic (e.g. `calculateLegalizationFee`, insurance interest capture) generic enough to extend rather than rewrite when these land.

## Flutterwave Integration Notes

- Flutterwave amounts are in Naira — never convert to kobo
- Webhook verification uses `verif-hash` header, not HMAC body signature
- Successful payment status string is `'successful'` not `'success'`
- `verifyPayment()` takes a transaction ID (integer), not a `tx_ref` string

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
   - `FLW_SECRET_KEY` — Flutterwave secret key
   - `FLW_PUBLIC_KEY` — Flutterwave public key
   - `FLW_WEBHOOK_HASH` — Flutterwave webhook verification hash
   - `NEXT_PUBLIC_FLW_PUBLIC_KEY` — Frontend Flutterwave key
   - `NEXT_PUBLIC_API_URL` — Frontend API URL (e.g., `http://localhost:5000/api/v1`)
   - `FRONTEND_URL` — Web app base URL, used by the API to build tenant invite/redirect links (e.g., `http://localhost:3000`)
   - `NODE_ENV` — development/production
   - `PORT` — API port (default 5000)

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
- **apps/web/.env.local** — never commit, set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_FLW_PUBLIC_KEY

## Production Environment Variables

**Set on Render dashboard (apps/api):**
- DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET, FLW_SECRET_KEY, FLW_PUBLIC_KEY, FLW_WEBHOOK_HASH
- FRONTEND_URL=https://leja.ng (or the Vercel URL, used for tenant invite/redirect links)
- NODE_ENV=production, PORT=5000

**Set on Vercel dashboard (apps/web):**
- NEXT_PUBLIC_API_URL=https://leja-api.onrender.com/api/v1
- NEXT_PUBLIC_FLW_PUBLIC_KEY=pk_live_xxxx
