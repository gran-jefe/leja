# Landing Copy Audit — `apps/web/src/app/page.tsx`

Audited against two failure modes: **unqualified "free" claims** and **rentals-only scoping that blocks Phases 2–4**. Two additional categories surfaced during the pass: **claims the product does not yet deliver** and **stale facts**.

Severity: 🔴 fix before launch · 🟠 fix during Phase B · 🟡 tidy up

---

## 🔴 Tier 1 — Claims that are not true

### 1. "FREE — Always. No hidden fees." (landlord tier, L519–520)

**Corrected after checking the API.** My first pass called this false. It isn't — but the reality is worth knowing.

`BEYOND_PRICING.LANDLORD_SUBSCRIPTION` (₦20,000/month) and `PaymentType.LANDLORD_SUBSCRIPTION` both exist, but **neither is referenced anywhere in `apps/api`**, and no property-count limit is enforced. So no landlord is charged today, and the copy is accurate in production. What it contradicts is the *documented business rule* in CLAUDE.md — a tier that was specified and never built.

Decision taken: the tier is still planned. `LANDLORD_FREE_PROPERTY_LIMIT: 4` has been added to `packages/shared/src/constants/pricing.ts` so the threshold stops living only in prose, with the unbuilt-enforcement caveat recorded next to it.

> **Replace with:**
> `FREE` / "For your first 4 properties. Beyond that, ₦20,000/month." — derived from `LANDLORD_FREE_PROPERTY_LIMIT`, never typed as a literal.

Same fix at **L594**: *"Landlords pay nothing"* → *"Landlords pay nothing to list, connect, or agree."*

### 2. "Verified landlords — Ownership documents checked before a property can be listed." (L102–104)

Not implemented. `apps/api/src/lib/identity/` is a **stub that auto-approves**, and `properties.title_verification_status` is groundwork with no provider wired up. You are advertising a verification step that does not run — on a trust platform, to people making six-figure decisions.

> **Replace with the honest present tense:**
> "Identity-verified parties — every landlord and tenant confirms their identity with BVN or NIN before an agreement can go live. Title verification rolls out with escrow in Phase 2."

Only restore the stronger claim once a real KYC provider is behind the interface.

### 3. Rental-history export fee is invisible

The tenant tier lists *"Verified rental history record"* as included (L88), but **exporting it costs ₦5,000** (`RENTAL_HISTORY_EXPORT`). A tenant discovers this only at the export button — which is currently disabled with "Coming soon" anyway.

> Add to the tenant tier: "Your rental history record is free to build. A verified exportable report is ₦5,000 when you need one."

### 4. `support@leja.ng` (L750)

Stale domain — the company renamed from Leja to BeyondAgency. A dead support address in the footer of a trust platform.

---

## 🟠 Tier 2 — Scoping that blocks the roadmap

### 5. The platform paragraph describes the *old* strategy (L330–334)

> Current: *"we connect the two sides of a deal for free, then earn from a marketplace of vetted providers who compete for the optional work around it."*

`CLAUDE.md` now states the reusable core is **"verified party + enforceable agreement + staged settlement, not marketplace"**, and that each phase applies that mechanism to a new domain rather than opening the platform to arbitrary categories. This paragraph still sells the marketplace framing you moved away from.

> **Replace with:**
> "Every deal needs the same three things: parties who are who they say they are, an agreement that holds up, and money that moves only when the terms are met. BeyondAgency provides all three. Residential rentals is where we started — not where we stop."

### 6. The "Technology" platform tile is factually wrong (L372–378)

> Current: *"Startups and SMEs source vetted service providers the same way."*

Phase 3 is **SME-bankable agreements — a credit-reference product lenders recognize**. It is not provider sourcing. This tile describes a product you decided not to build.

> **Replace the tile with:** `Business` · *Coming* · "Agreements strong enough for a lender to underwrite against — turning your track record into credit."

### 7. Phase 2 is missing from the page entirely

Property verification and escrow for remote buyers is the **current** phase, with schema and identity groundwork already merged, and it appears nowhere. The four tiles are Real Estate / Insurance / Legal / Technology.

> **Add a tile:** `Property Purchase` · *In build* · "Verified titles and staged escrow for buyers who can't stand in the room. Domestic first, diaspora next."

### 8. Anti-agent framing in four places

L388 *"Built for both sides of the rental market"* · L441 *"Three steps. One agreement. Zero agents."* · L395 *"Stop relying on agents who disappear…"* · L416 *"Stop paying agents ₦100,000…"*

Each defines the company by its Phase 1 opponent. Keep **one** — the tenant-side line, where the ₦100,000 is concrete and the pain is real — and neutralize the rest.

> L388 → "Built for both sides of the deal"
> L441 → "Three steps. One agreement. Nothing hidden."
> L395 → "Keep control of your property after the keys change hands."

---

## 🟡 Tier 3 — Precision

### 9. The stats strip mixes market data with unearned performance claims (L70–76)

`₦180B+`, `65%`, `22M` are external market facts. **`48hrs` and `₦105,000 saved per tenant` are presented identically but are projections** — there is no user base to have averaged them from. Stating a projection in the visual language of a measured metric is the kind of thing that surfaces in diligence.

> Split them visually: three market stats under a "The problem" label; move `48hrs` to the lawyer-review section as a **service commitment** ("reviewed within 48 hours" — which the page already says correctly at L456), and `₦105,000` to the savings comparison where it is derived from `BEYOND_PRICING`, not claimed.

### 10. Inconsistent agent-fee figure

L416 says agents cost **₦100,000**; the stats say tenants save **₦105,000**. Both should derive from `BEYOND_PRICING.TYPICAL_AGENT_FEE` rather than being typed as literals — the same rule the codebase already enforces for every other Naira amount.

### 11. "Bank-grade security" (L269)

Unverifiable and meaningless — every product claims it. Replace with something checkable: **"Payments never touch our hands"** (true — eTranzact virtual accounts) or **"Agreements stored, never sold."**

### 12. `Built in Nigeria 🇳🇬` (L765)

Emoji used as an icon, against the design rules. Also `text-muted` on navy — a contrast failure. Set in DM Mono, `ink-300`, with a proper mark or nothing.

### 13. Placeholder links

`Privacy Policy` and `Terms of Service` both point to `href="#"`; all three social icons point to `href="#"`. For a platform asking people to sign legal agreements, absent terms are a credibility problem, not a to-do.

---

## Summary

| Tier | Count | Nature |
|---|---|---|
| 🔴 Tier 1 | 4 | Claims contradicted by your own pricing constants or unimplemented code |
| 🟠 Tier 2 | 4 | Copy that describes the previous strategy or blocks Phases 2–4 |
| 🟡 Tier 3 | 5 | Precision, consistency, and placeholder debt |

Tier 1 items 1 and 2 are the ones I would not ship. Everything else is Phase B work.
