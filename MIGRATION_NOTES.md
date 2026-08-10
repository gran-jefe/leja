# BeyondAgency Rebrand — Ops Checklist

Generated during the Leja → BeyondAgency rebrand. Everything below is
intentionally **not** a code change — either it's an infrastructure/account
setting outside this repo, or it's a deliberate scope decision. Work through
this before or shortly after the rebrand ships.

> **Superseded note (payments):** the Flutterwave references below (account
> settings, `lib/flutterwave.ts` TODOs) describe the payment rail as it stood
> at rebrand time. Flutterwave has since been fully replaced by eTranzact —
> see the "Payment Rail: eTranzact" section in `CLAUDE.md` and
> `apps/api/src/lib/payments/` for the current setup. The Flutterwave-specific
> action items below no longer apply; kept here as history, not as a live
> checklist.

## Urgent — base deal is now fully free (no more legalization fee)

- [ ] **Revenue model changed.** The tenant-facing "Legalization & Protection
  fee" (was 8% of annual rent, floor ₦10k / cap ₦100k) is **gone**. Accepting
  an agreement is now free and goes `ACTIVE` immediately — no payment, no
  webhook gate. The only tenant-side payment left is the *optional* lawyer
  review add-on — now a **flat ₦20,000**, delivered by an **in-house,
  monthly-salaried legal team**, not an open bid (see next section). The
  bid marketplace itself is still real, but only for insurance and future
  external categories. Rental history export and landlord subscription are
  unaffected.
- [ ] **Hire at least one in-house lawyer before relying on the lawyer
  review add-on.** `createAndAssignLegalReviewJob()` auto-assigns paid
  review requests to the least-busy `ACTIVE`, `employment_type: 'INTERNAL'`
  `LEGAL` provider. Onboard one via the admin-only `POST
  /marketplace/providers/internal` (needs `ADMIN_EMAILS` set, see below).
  With zero internal lawyers onboarded, the job falls back to the old
  open-bid shape and will sit unfulfilled — there's no external LEGAL
  provider pool to catch it.
- [ ] **Payroll is now a real fixed cost tied to this feature.** Unlike the
  old bid-commission model, in-house lawyer salaries are a cost regardless
  of how many tenants opt into the ₦20,000 review add-on. Model the
  break-even attach rate (reviews/month needed to cover payroll) before
  hiring beyond the first lawyer.
- [ ] **Financial projections need rework.** Any revenue model built around
  "X% of every agreement" no longer holds. Revenue now depends entirely on
  attach rate of the optional lawyer-review add-on and, longer term,
  insurance commission and provider subscriptions. Model attach rate
  conservatively — most tenants will decline an optional paid add-on when a
  free version already satisfies "legal and protected."
- [ ] **`legalization_fee_rate` / `legalization_fee_amount` columns on
  `agreements` are now always `null` for new agreements** (left in place
  only so pre-pivot agreements can resolve their historical fee via
  `resolveLegalizationFee()` in `apps/api/src/db/queries/agreements.ts`).
  Consider dropping these columns entirely in a future migration once no
  historical lookups depend on them.

## Urgent — service-bid marketplace (PaaS pivot)

- [ ] **Apply the DB migrations.** `supabase/migrations/20260808220000_add_service_bid_marketplace.sql`
  adds `service_providers`, `service_jobs`, `service_bids`, and widens the
  `users.role` CHECK constraint to allow `PROVIDER`.
  `supabase/migrations/20260809090000_add_provider_employment_type.sql`
  adds `employment_type` (`INTERNAL`/`EXTERNAL`) to distinguish salaried
  in-house staff from bidding external providers. Verify both actually
  apply against the live DB, don't assume from the files alone.
- [ ] **Recruit a real external bid pool before flipping insurance bidding
  on publicly.** The marketplace mechanic only applies to `EXTERNAL`
  providers now — currently just `INSURANCE`. A marketplace with one
  insurer bidding against itself is the old exclusive-partner model with
  extra steps. Onboard 2–3 licensed insurers first (`POST
  /api/v1/marketplace/providers/apply`, category `INSURANCE`, then verify
  via `POST /api/v1/marketplace/providers/:id/verify`). `LEGAL` no longer
  goes through this flow — see the lawyer-review section above.
- [ ] **Set `ADMIN_EMAILS`** in the API env — a comma-separated allowlist
  gates both the provider-verification endpoint and the internal-provider
  onboarding endpoint (`POST /marketplace/providers/internal`, used to hire
  in-house lawyers). There's no dedicated ADMIN role in the schema yet;
  this is a stopgap, not a real access-control system. Revisit before
  onboarding providers or staff at any real volume.
- [ ] **No cron/retry exists for unawarded jobs.** `awardJob` only runs once,
  immediately after payment confirmation. If zero providers have bid by
  then, the job sits `OPEN` until someone bids — nothing currently re-checks
  and awards it later. Needed before this is reliable in production.
- [ ] **`PLATFORM_COMMISSION_RATE` (10%) is a placeholder**, not a number
  from any actual contract. Decide the real commission split with your
  first onboarded providers before launch — it changes what "platform
  margin vs. provider payout" actually looks like per job.

## Urgent — blocks the new pricing model in production

- [ ] **Apply the pending DB migration.** `supabase/migrations/20260718180000_add_legalization_fee_and_insurance_interests.sql`
  adds `agreements.legalization_fee_rate` / `legalization_fee_amount` and the
  new `insurance_interests` table. It is written and was verified logically
  correct, but **could not be applied this session** — the Supabase
  connection (both the pooled `DATABASE_URL` and the Supabase REST client)
  was unreachable for the entire session, most likely because the free-tier
  project auto-paused after an extended period of inactivity. Until this
  migration runs, agreement creation will hard-fail (the insert writes to
  columns that don't exist yet) and the insurance-interest endpoints will
  404 at the table level.
  - Check the Supabase dashboard — resume the project if paused.
  - Apply: `psql "$DATABASE_URL" -f supabase/migrations/20260718180000_add_legalization_fee_and_insurance_interests.sql`
  - Verify: `\d agreements` shows the two new columns; `\d insurance_interests` exists.

## Domain

The product still points at `leja.ng` everywhere a real URL is needed,
because there's no live BeyondAgency domain yet to swap in:

- `apps/api/src/config.ts` — CORS `allowedOrigins` (`https://leja.ng`, `https://www.leja.ng`, `https://leja-web.vercel.app`)
- `apps/api/src/lib/flutterwave.ts` / `apps/web/src/lib/flutterwave.ts` — Flutterwave checkout `logo` asset URL (marked with a `TODO(MIGRATION_NOTES)` comment at each spot)
- `apps/api/src/lib/templates/agreement.template.ts` — PDF footer text ("generated by BeyondAgency (leja.ng)", `leja.ng/dispute`, `support@leja.ng`)
- `apps/api/src/db/queries/agreements.ts` — tenant-signup prompt ("sign up at leja.ng")
- `CLAUDE.md` — `FRONTEND_URL=https://leja.ng` in the production env var reference

Once a domain is chosen and DNS/hosting is live: update all of the above,
plus `FRONTEND_URL` on Render and `NEXT_PUBLIC_API_URL` on Vercel.

## Render service

- Service is still named `leja-api` (`render.yaml`, and documented in
  CLAUDE.md's Deployment section) with production URL
  `https://leja-api.onrender.com`. Renaming the actual Render service is a
  dashboard action; once done, update `render.yaml`'s `name:` field and the
  URLs documented in CLAUDE.md and README to match.

## Flutterwave account

- Code already sends `title: 'BeyondAgency'` in checkout customizations, so
  the hosted payment page will show the new name regardless — but the
  underlying Flutterwave **merchant/business display name** (what shows on
  bank statements, SMS receipts, and the Flutterwave dashboard itself) is a
  separate setting in the Flutterwave merchant account, not something code
  controls. Update it there to avoid a mismatch between what the checkout
  page says and what the customer's bank statement says.
- The checkout logo asset (`https://leja.ng/logo.png`) needs a real
  BeyondAgency logo hosted somewhere reachable once the domain migration
  above happens.

## Deliberately out of scope

- **Root package name** (`package.json` `"name": "leja"`) and the **repo
  directory name** (still `leja/` on disk) were left unchanged — the
  package-rename prompt scoped the rename to `packages/shared` only
  (`@leja/shared` → `@beyond/shared`). Renaming the root package or the repo/
  GitHub project itself is a separate decision (it touches clone paths, CI
  config, etc. beyond this codebase) — revisit deliberately if wanted.
- **Internal identifiers** that are never user-visible were left alone since
  renaming them has no product value: the `leja_token` / `leja_user` /
  `leja_draft_property` cookie and localStorage key names, and the
  `User-Agent: leja-api` header sent to Supabase.
- **Historical payment references**: new transactions now generate
  `BEYOND_*`-prefixed `tx_ref`s (was `LEJA_*`) — this is safe because nothing
  in the codebase parses or pattern-matches on the prefix. Old `LEJA_*`
  references on already-completed payments are an immutable historical
  record and were not touched.
