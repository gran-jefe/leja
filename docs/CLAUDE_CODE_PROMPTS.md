# Leja → BeyondAgency Revamp — Claude Code Prompts

Run these **in order**, one per Claude Code session (or `/clear` between them). Each prompt is self-contained. Commit after each with the suggested message.

Business model change being implemented: connection is **free** for both parties. BeyondAgency is now a **Platform-as-a-Service marketplace** — legalization and insurance are not delivered by one in-house/exclusive partner, but posted as **jobs** that vetted, independent providers **bid** on. The winning bid executes the work; BeyondAgency takes a commission on every winning bid plus an optional provider subscription for priority bid-pool access. The legalization fee the tenant pays is still bounded by a **percentage-of-annual-rent band: 8% default, 5–10% negotiable, floor ₦10,000, cap ₦100,000** — but within that band, providers bid the actual price and turnaround, not the platform.

This supersedes the earlier "employ one lawyer, partner with one insurer" plan. In-house counsel still exists, but its job becomes template ownership, dispute arbitration, and reviewing flagged bids — not being the sole legalization channel.

---

## Prompt 1 — Update CLAUDE.md and shared constants (foundation)

```
Rebrand this project from Leja to BeyondAgency and update the business model. Do the following:

1. Rewrite CLAUDE.md:
   - Project name: BeyondAgency. Brief: "Nigeria's trust platform for direct deals. Phase 1: residential rentals — landlords and tenants connect free; we monetize agreement legalization, insurance protection, and verification." Tagline: "Bridging Trust. Simplifying Deals."
   - Keep all technical stack, conventions, Flutterwave notes, env setup, and file structure sections intact.
   - Update Key Business Rules: landlord lists FREE; tenant connects FREE; tenant pays a Legalization & Protection fee when accepting an agreement, calculated as 8% of annual rent (default rate, negotiable per agreement by the landlord within platform bounds), with a ₦10,000 floor and ₦100,000 cap; the computed fee is snapshotted onto the agreement at DRAFT creation so a later rate change never alters an existing agreement; optional ₦8,000 lawyer deep-review add-on; optional rent-protection insurance sold via a licensed insurance partner (we earn commission, we do NOT underwrite); ₦5,000 rental history export; ₦20,000/month landlord subscription for 5+ properties.
   - Add a "Future Phases" note: insurance comparison (Phase 2), legal marketplace (Phase 3), tech services marketplace (Phase 4) — architecture should not hardcode assumptions that block these.

2. In packages/shared/src/constants/pricing.ts:
   - Rename LEJA_PRICING to BEYOND_PRICING (keep a deprecated alias `export const LEJA_PRICING = BEYOND_PRICING` so nothing breaks yet).
   - Replace TENANT_MOVE_IN_FEE with percentage-based fee constants: LEGALIZATION_FEE_RATE: 0.08 (8% of annual rent, default), LEGALIZATION_FEE_MIN_RATE: 0.05 and LEGALIZATION_FEE_MAX_RATE: 0.10 (allowed negotiation band), LEGALIZATION_FEE_FLOOR: 10000, LEGALIZATION_FEE_CAP: 100000 (Naira). Rename TENANT_LAWYER_REVIEW to LAWYER_REVIEW_ADDON.
   - Add a pure helper in packages/shared (e.g. src/utils/fees.ts, exported from index): calculateLegalizationFee(annualRentNaira: number, rate?: number) → clamps rate to the band, applies floor and cap, rounds to 2 decimals, returns Naira. Both API and web must use this helper — never compute the fee inline. API recomputes server-side at payment initiation; never trust a fee amount sent from the client.
   - Add INSURANCE_COMMISSION_RATE: 0.15 (15% of premium, placeholder until insurer partnership is signed) with a comment that premiums are set by the insurer partner.
   - Update all imports/usages across apps/api and apps/web to the new names.

3. Run npm run type-check and fix any errors.

Commit as: feat: rebrand shared constants and project docs to BeyondAgency
```

---

## Prompt 2 — Rebrand the web app (branding, copy, metadata)

```
Rebrand the frontend in apps/web from Leja to BeyondAgency. Do NOT change the design tokens (Fraunces/DM Sans, Navy #0D1B2A, Forest #1A7A4A, Ember #C4522A, Cream #F7F9FC) — they stay.

1. Global: replace every user-visible "Leja" with "BeyondAgency" (layout.tsx metadata title/description, Navbar, Sidebar, footer, emails/links). Search case-insensitively for "leja" in apps/web/src and review each hit — do not blindly replace code identifiers, env var names, or package names (@leja/shared stays for now).

2. Landing page (src/app/page.tsx) — rewrite around the bridge model:
   - Hero: headline "Beyond agents. Beyond fees. Beyond risk." Subhead: "Landlords and tenants connect directly, free. We make the deal legal and protected." CTAs: "List your property — free" and "Find a home".
   - "How it works" 3-step section: Connect (browse verified listings, no agent fee) → Agree (standardized digital tenancy agreement) → Protect (legalized for just 8% of annual rent — capped, and always far below the typical 10%+ agent fee plus legal costs; optional lawyer review and rent-protection insurance).
   - Savings comparison: typical agent fee (often 10% of rent or ₦100,000+) plus informal legal ₦20,000 vs BeyondAgency's single capped 8% fee. Include a small interactive example using calculateLegalizationFee (e.g. annual rent input → fee shown). Use BEYOND_PRICING constants and the shared helper — never hardcode Naira amounts or the rate.
   - Trust section: verified landlords (ownership documents checked), agreements drafted and maintained by our in-house legal counsel, insurance-backed protection, payments via Flutterwave.
   - A small "Coming soon" strip: Insurance comparison · Legal marketplace · Tech services — establishing this is a multi-sector platform.

3. Update signup/login page copy to match the new positioning.

4. In the tenant agreement acceptance flow, label the fee "Legalization & Protection fee" (not "move-in fee") and always show the computed amount for THAT agreement (from the snapshotted fee on the agreement record), with a breakdown line like "8% of ₦1,200,000 annual rent = ₦96,000".

Run npm run type-check and npm run build for apps/web. Commit as: feat: rebrand web app to BeyondAgency with bridge-model landing page
```

---

## Prompt 3 — Fee band, API cleanup (no bidding yet)

```
Update apps/api for the BeyondAgency model, fee mechanics only — the bid marketplace is a separate prompt after this one:

1. Search apps/api/src for "leja" (case-insensitive) and update user-visible strings (agreement PDF text, email copy, payment narration/tx_ref prefixes for NEW transactions only — do not touch logic that parses existing tx_refs). Service name and infra identifiers (leja-api on Render, DB names) stay unchanged for now; note them in a MIGRATION_NOTES.md as a later ops task.

2. Percentage-based fee:
   - schema.sql: add to agreements — legalization_fee_rate numeric(4,3) default 0.08 and legalization_fee_amount numeric(12,2). Set both at DRAFT creation using calculateLegalizationFee from @leja/shared (rate optionally provided by the landlord, validated by Zod against the min/max band). Existing agreements keep their historical amounts — write a migration note, do not backfill.
   - Payments route: charge legalization_fee_amount from the agreement record, recomputed/verified server-side; reject if client-supplied amount mismatches. Rename wording from "move-in fee" to "Legalization & Protection fee". Amounts stay in Naira (never kobo). Payment still collected when the tenant accepts; webhook (verif-hash header, status 'successful') still gates agreement ACTIVE. Do not change this flow.
   - Agreement creation UI: landlord sees the default 8% and computed fee, with an optional rate field constrained to the band; tenant preview shows the exact amount before accepting.

Run npm run type-check. Commit as: feat: percentage-based legalization fee with server-side verification
```

---

## Prompt 4 — Bid marketplace: providers, jobs, bids (core PaaS engine)

```
Build the service-bid marketplace for BeyondAgency. This replaces the single in-house-lawyer / single-insurer plan: legalization and insurance work is posted as a "job" that multiple vetted providers bid on; the winning bid executes and the platform earns commission regardless of who wins. This is the core mechanic other future categories (inspection, moving, tech services) will reuse, so keep it generic — do not hardcode "legal" or "insurance" logic where a category enum would do.

1. schema.sql — new tables (follow existing soft-delete / created_at conventions):
   - service_providers: id, user_id FK (providers are a new PROVIDER role or a flag on users — decide based on how roles are modeled today and match that pattern), category text ('LEGAL' | 'INSURANCE', extensible), license_number text, license_verified boolean default false, status text default 'PENDING' ('PENDING'|'ACTIVE'|'SUSPENDED'), subscription_tier text default 'STANDARD' ('STANDARD'|'PRIORITY'), rating numeric(3,2), rating_count integer default 0, created_at.
   - service_jobs: id, agreement_id FK, category text, requester_id FK (tenant or landlord), status text default 'OPEN' ('OPEN'|'AWARDED'|'COMPLETED'|'CANCELLED'|'EXPIRED'), bid_window_closes_at timestamptz, min_price numeric(12,2), max_price numeric(12,2) (populate from LEGALIZATION_FEE_FLOOR/CAP and the rent-based band for LEGAL; null bounds for INSURANCE until that category's rules exist), winning_bid_id FK nullable, created_at.
   - service_bids: id, job_id FK, provider_id FK, price numeric(12,2), turnaround_hours integer, status text default 'SUBMITTED' ('SUBMITTED'|'WON'|'LOST'|'WITHDRAWN'), created_at. Unique constraint (job_id, provider_id) — one active bid per provider per job.

2. apps/api/src/lib/schemas/marketplace.ts — Zod schemas for provider application, job creation, bid submission (price must be within the job's min/max when set).

3. Routes (apps/api/src/routes/marketplace.ts), all responses via ApiResponse<T> from @beyond/shared:
   - POST /api/v1/providers/apply (auth: any authenticated user) — creates a PENDING service_provider record.
   - POST /api/v1/providers/:id/verify (auth: admin only — check how admin auth is currently modeled, add minimal support if it doesn't exist yet) — sets license_verified + status ACTIVE.
   - POST /api/v1/jobs (internal helper, called from the agreement-acceptance flow, not a public route) — creates a service_job for category LEGAL when a tenant accepts an agreement; bid_window_closes_at = now + configurable hours (default from a new BID_WINDOW_HOURS constant in @beyond/shared).
   - GET /api/v1/jobs/open (auth: PROVIDER, filtered to their category and ACTIVE status) — lists open jobs, PRIORITY subscription tier providers see jobs before STANDARD tier (e.g. a short visibility delay for STANDARD).
   - POST /api/v1/jobs/:id/bids (auth: PROVIDER, must be ACTIVE in that job's category) — submit or update a bid before the window closes.
   - POST /api/v1/jobs/:id/award (system job or admin-triggered — do NOT build a cron in this pass, just the function that: picks lowest qualifying bid unless the requester specified a preferred provider, sets job AWARDED, marks the winning bid WON and others LOST, and calls a stub `notifyProviderAwarded()`) — call it manually for now from the payment-confirmation webhook handler once payment succeeds, so award happens right after the tenant pays.
   - Rate limit provider/job/bid routes like agreement endpoints (20 req / 15 min).

4. Wire into the existing agreement flow: when a tenant's payment webhook confirms success (existing Flutterwave webhook handler), after setting the agreement ACTIVE, create the LEGAL service_job and call the award function. Do not change the webhook's existing verification logic (verif-hash header, 'successful' status, transaction ID lookup) — only add the job-creation call at the end of the success path.

5. Add shared types in packages/shared/src/types/marketplace.ts (ServiceProvider, ServiceJob, ServiceBid, category enum) and export from index. Add BID_WINDOW_HOURS and PLATFORM_COMMISSION_RATE (e.g. 0.10 — platform's cut on top of the winning bid, distinct from the tenant-facing legalization fee band; comment that this determines provider payout vs. platform margin) to BEYOND_PRICING.

Run npm run type-check. Commit as: feat: add service-bid marketplace engine for legalization jobs
```

---

## Prompt 5 — Provider and bid UI in apps/web

```
Add web UI for the bid marketplace built in the previous prompt:

1. New provider-facing pages under apps/web/src/app/provider/ (mirror the structure of the existing dashboard):
   - provider/apply/page.tsx — application form (category, license number) posting to /providers/apply.
   - provider/jobs/page.tsx — list of open jobs for the logged-in provider's category (GET /jobs/open), each with a bid form (price, turnaround hours) posting to /jobs/:id/bids. Show min/max price bounds from the job so providers know the legal band.
   - provider/dashboard/page.tsx — the provider's bid history and status (won/lost/pending), rating.

2. Update the tenant agreement-acceptance flow (apps/web/src/app/agreement or agreements) to explain the bid mechanic instead of a fixed provider: after payment, show "Your agreement is being matched with a licensed provider — typically within [BID_WINDOW_HOURS] hours" instead of any static "reviewed by our lawyer" copy. Once awarded (poll or refetch job status), show the assigned provider's name/rating.

3. Landing page: update the "How it works" Protect step and trust section to describe competitive provider bidding within a platform-set price band, not a single in-house/exclusive partner — e.g. "Vetted, licensed providers compete for your agreement. You get the best qualified price, always within a fair range we set."

4. Add a small "Become a provider" CTA in the footer or a dedicated marketing section, linking to provider/apply — this is a second acquisition funnel (providers), not just landlords/tenants.

Run npm run type-check and npm run build for apps/web. Commit as: feat: add provider bid marketplace UI
```

---

## Prompt 6 — Package rename (optional, do last)

```
Rename the shared package @leja/shared to @beyond/shared across the monorepo: package.json names, all import statements in apps/api and apps/web, tsconfig paths if any, and turbo.json if referenced. Remove the deprecated LEJA_PRICING alias from pricing.ts now that nothing imports it. Run npm install, npm run type-check, and npm run build to verify the workspace resolves. Commit as: chore: rename @leja/shared to @beyond/shared
```

---

## Prompt 7 — Verification pass

```
Do a final verification of the BeyondAgency rebrand and marketplace build:
1. Grep the whole repo (excluding node_modules, dist) case-insensitively for "leja". For each remaining hit, classify: (a) intentional infra identifier (Render service, URLs, DB) — list in MIGRATION_NOTES.md; (b) missed user-visible string — fix it.
2. Confirm no Naira amount or fee rate is hardcoded outside packages/shared (grep for 15000, 8000, 5000, 20000, 0.08, 0.10 in apps/) and that all fee calculations go through calculateLegalizationFee.
3. Confirm the bid-award path only fires from the confirmed payment webhook, never from an unauthenticated route, and that a provider cannot bid on a job outside their verified category.
4. Run npm run type-check and npm run build for the whole monorepo.
5. Summarize what's in MIGRATION_NOTES.md as the ops checklist (new domain, Vercel/Render env FRONTEND_URL, Flutterwave account display name, etc.).
```

---

## Ops checklist (outside Claude Code)

- Buy domain (beyondagency.ng or similar); update `FRONTEND_URL` on Render and `NEXT_PUBLIC_API_URL` on Vercel when it changes.
- Update Flutterwave business display name so payment pages say BeyondAgency.
- Rename Vercel project / Render service when convenient (breaks old URLs — do after domain is live).
- Recruit and vet an initial bid pool: 5–10 independent lawyers/small firms and 2–3 licensed insurers willing to bid — a marketplace with one bidder per category is just the old exclusive-partner model with extra steps. Don't launch bidding publicly until there's real competition in the pool.
- Hire in-house counsel for template ownership and dispute arbitration, not as the sole legalization channel.
- Decide and document the platform commission rate (provider payout vs. BeyondAgency margin) before onboarding the first provider — it's a contract term, not a config value you quietly change later.
