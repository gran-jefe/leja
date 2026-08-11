'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileText,
  Home as HomeIcon,
  Landmark,
  Link2,
  Scale,
  Shield,
  ShieldCheck,
  Users,
  Video,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Section, Eyebrow } from '@/components/layout/Section';
import { Container } from '@/components/layout/Container';
import { Reveal, RevealGroup } from '@/components/motion/Reveal';
import { AnimatedNumber } from '@/components/motion/AnimatedNumber';
import { HeroBackdrop } from '@/components/marketing/HeroBackdrop';
import { AgreementArtifact } from '@/components/marketing/AgreementArtifact';
import { DemoContactForm } from '@/components/marketing/DemoContactForm';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { IconTile } from '@/components/ui/IconTile';
import { formatNaira } from '@/lib/utils';
import { BEYOND_PRICING } from '@beyond/shared';

const landlordBenefits = [
  'Verified tenant profiles before you sign anything',
  'Digital agreements that actually hold up legally',
  'Automatic rent tracking and renewal alerts',
  'Direct access to dispute resolution if things go wrong',
];

const tenantBenefits = [
  'Deal directly with landlords — no middleman fees',
  'Understand what you’re signing before you sign it',
  'Build a verified rental history that follows you',
  'Affordable legal help when a landlord crosses a line',
];

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Connect',
    body: 'Browse verified listings and connect directly with a landlord or tenant. No agent stands between you, and no agent takes a cut.',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Agree',
    body: 'Fill in the tenancy terms together. We generate a standardized, state-compliant agreement instantly — at no charge.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Protect',
    body: 'Your agreement is on record from the moment it’s accepted. Add a lawyer’s review or rent-protection cover only if you want them.',
  },
];

// Market context, not our own performance. Kept separate from any
// BeyondAgency metric — see docs/landing-copy-audit.md §9: stating a
// projection in the visual language of a measured statistic is the kind of
// thing that surfaces in diligence.
const marketStats = [
  { value: 180, prefix: '₦', suffix: 'B+', label: 'paid in agent fees every year in Lagos alone' },
  { value: 65, suffix: '%', label: 'of Lagos tenant complaints involve landlord misconduct' },
  { value: 22, suffix: 'M', label: 'unit housing deficit across Nigeria' },
];

const platformSectors = [
  {
    name: 'Residential rentals',
    status: 'Live now',
    tone: 'success' as const,
    body: 'Landlords and tenants connect, agree and legalize directly — free. Optional lawyer review and rent cover on top.',
  },
  {
    name: 'Property purchase',
    status: 'In build',
    tone: 'brand' as const,
    body: 'Verified titles and staged escrow for buyers who can’t stand in the room. Domestic Nigeria first, diaspora next.',
  },
  {
    name: 'Business agreements',
    status: 'Next',
    tone: 'neutral' as const,
    body: 'Agreements strong enough for a lender to underwrite against — turning a track record into credit.',
  },
  {
    name: 'Insurance & services',
    status: 'Bid marketplace',
    tone: 'neutral' as const,
    body: 'Licensed insurers and vetted providers compete for optional jobs. We take a commission, never a fee from you.',
  },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Identity-verified parties',
    // Deliberately narrower than the previous "ownership documents checked"
    // claim — title verification is Phase 2 groundwork with no provider wired
    // up yet (apps/api/src/lib/identity is a stub). See copy audit §2.
    body: 'Every landlord and tenant confirms who they are with BVN or NIN before an agreement can go live. Title verification arrives with escrow.',
  },
  {
    icon: Scale,
    title: 'In-house legal team',
    body: 'Lawyer review is handled by our own salaried legal team, not a stranger from an open marketplace. One flat price, assigned immediately.',
  },
  {
    icon: Shield,
    title: 'Insurance-backed cover',
    body: 'Optional rent protection, matched through competitive bidding among licensed insurer partners once they’re live.',
  },
  {
    icon: Landmark,
    title: 'Money you can trace',
    body: 'Every payment runs through a dedicated bank account generated for that transaction. Nothing is handled off-platform, and nothing touches our hands.',
  },
];

const landlordFeatures = [
  'List properties and connect with tenants',
  'Generate tenancy agreements',
  'Verified tenant matching',
  'Agreement tracking dashboard',
];

const tenantFeatures = [
  'Proper state-compliant agreement',
  'No agent involved, no agent fee',
  'Verified rental history record',
  'Legal protection if things go wrong',
];

const lawyerReviewFeatures = [
  'A qualified lawyer reads your agreement',
  'Returned within 48 hours',
  'Handled by salaried staff, not a bidder',
  'Priority dispute support',
];

export default function Home() {
  const agentTotal = BEYOND_PRICING.TYPICAL_AGENT_FEE + BEYOND_PRICING.TYPICAL_LEGAL_FEE;

  return (
    <>
      <Navbar />

      {/* ---------------------------------------------------------- Hero -- */}
      <section className="relative min-h-[92vh] flex items-center pt-28 pb-20 overflow-hidden">
        <HeroBackdrop />

        <Container className="relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div className="lg:col-span-7">
              <Reveal>
                <Eyebrow onDark className="mb-5">
                  Nigeria&apos;s trust platform
                </Eyebrow>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="font-display text-display-xl font-semibold text-on-dark mb-6">
                  Deal directly.
                  <br />
                  <span className="text-brass-300">Without the risk</span> of
                  <br className="hidden sm:block" /> dealing directly.
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="font-body text-body-lg text-on-dark-muted mb-9 max-w-prose">
                  We verify both sides, generate an agreement that holds up, and make sure money
                  only moves when the terms are met. Starting with Nigerian rentals.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Link href="/signup">
                    <Button size="lg" fullWidth trailingIcon={<ArrowRight size={18} />}>
                      Start free
                    </Button>
                  </Link>
                  <Link href="/#how-it-works">
                    <Button size="lg" variant="secondary" onDark fullWidth>
                      See how it works
                    </Button>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <ul className="flex flex-col sm:flex-row gap-3 sm:gap-7 font-body text-body-sm text-on-dark-muted">
                  {[
                    'No fee on the deal itself',
                    'Verified identities',
                    'Agreements that stand up',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brass-500 flex-shrink-0" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* Visible on mobile now — this was `hidden md:block`, so the
                mobile hero was text on a flat navy field. */}
            <div className="lg:col-span-5">
              <Reveal delay={0.25}>
                <AgreementArtifact />
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------ Platform -- */}
      <Section id="platform" tone="dark" divided>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <Eyebrow onDark className="mb-4">
              The platform
            </Eyebrow>
            <h2 className="font-display text-display-md font-semibold text-on-dark mb-4">
              One mechanism. Every deal that needs trust.
            </h2>
            <p className="font-body text-on-dark-muted">
              Every deal needs the same three things: parties who are who they say they are, an
              agreement that holds up, and money that moves only when the terms are met.
              BeyondAgency provides all three. Rentals is where we started — not where we stop.
            </p>
          </div>
          <Link href="/provider/apply" className="flex-shrink-0">
            <Button variant="secondary" onDark>
              I&apos;m a licensed provider
            </Button>
          </Link>
        </div>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-card overflow-hidden">
          {platformSectors.map((sector) => (
            <div key={sector.name} className="bg-navy-900 p-6 h-full">
              <Badge tone={sector.tone} size="sm" dot className="mb-4">
                {sector.status}
              </Badge>
              <p className="font-display text-title font-semibold text-on-dark mb-2">
                {sector.name}
              </p>
              <p className="font-body text-body-sm text-on-dark-muted">{sector.body}</p>
            </div>
          ))}
        </RevealGroup>
      </Section>

      {/* ------------------------------------------- Landlords / Tenants -- */}
      {/* These two columns describe what each side gets — not two products,
          and no longer two kinds of account. Signup asks for no role at all;
          you become a landlord by listing and a tenant by accepting, and one
          account can be both. See CLAUDE.md § Capabilities. */}
      <Section id="for-landlords" tone="paper">
        <Reveal>
          <Eyebrow className="text-center mb-4">Built for both sides of the deal</Eyebrow>
          <h2 className="text-center font-display text-display-md font-semibold text-navy-900 mb-4 max-w-2xl mx-auto">
            One account. Either side. Often both.
          </h2>
          <p className="text-center font-body text-ink-500 mb-14 max-w-xl mx-auto">
            You don&apos;t pick a lane when you sign up. Let a flat, rent one, or do both from the
            same account — most people eventually do.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-14 md:gap-0 relative">
          <div className="md:pr-14">
            <Reveal>
              <IconTile icon={Building2} tone="navy" size="lg" className="mb-5" />
              <h3 className="font-display text-display-sm font-semibold text-navy-900 mb-2">
                When you&apos;re letting
              </h3>
              <p className="font-body text-ink-500 mb-7">
                Keep control of your property after the keys change hands.
              </p>
              <ul className="space-y-0 mb-8">
                {landlordBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 py-3.5 border-t border-ink-200 last:border-b"
                  >
                    <CheckCircle2 className="text-brass-600 flex-shrink-0 mt-0.5" size={18} aria-hidden />
                    <span className="font-body text-ink-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button trailingIcon={<ArrowRight size={17} />}>Start listing</Button>
              </Link>
            </Reveal>
          </div>

          <div
            aria-hidden
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-ink-200 -translate-x-1/2"
          />

          <div id="for-tenants" className="md:pl-14">
            <Reveal delay={0.08}>
              <IconTile icon={HomeIcon} tone="brass" size="lg" className="mb-5" />
              <h3 className="font-display text-display-sm font-semibold text-navy-900 mb-2">
                When you&apos;re renting
              </h3>
              <p className="font-body text-ink-500 mb-7">
                Stop paying {formatNaira(BEYOND_PRICING.TYPICAL_AGENT_FEE)} to someone for handing
                over a key.
              </p>
              <ul className="space-y-0 mb-8">
                {tenantBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 py-3.5 border-t border-ink-200 last:border-b"
                  >
                    <CheckCircle2 className="text-brass-600 flex-shrink-0 mt-0.5" size={18} aria-hidden />
                    <span className="font-body text-ink-700">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button trailingIcon={<ArrowRight size={17} />}>Start searching</Button>
              </Link>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------- How it works -- */}
      <Section id="how-it-works" tone="white">
        <Reveal>
          <Eyebrow className="text-center mb-4">Simple by design</Eyebrow>
          <h2 className="text-center font-display text-display-md font-semibold text-navy-900 mb-16 max-w-2xl mx-auto">
            Three steps. One agreement. Nothing hidden.
          </h2>
        </Reveal>

        <RevealGroup className="grid md:grid-cols-3 gap-10 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="border-t-2 border-brass-500 pt-6">
              <span className="font-display text-display-md font-semibold text-brass-500 leading-none">
                {step.number}
              </span>
              <IconTile icon={step.icon} tone="navy" className="my-5" />
              <h3 className="font-display text-title font-semibold text-navy-900 mb-2">
                {step.title}
              </h3>
              <p className="font-body text-ink-500">{step.body}</p>
            </div>
          ))}
        </RevealGroup>

        <Reveal>
          <div className="border-t border-ink-200 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <Scale className="text-ink-400 flex-shrink-0" size={18} aria-hidden />
            <p className="font-body text-body-sm text-ink-500">
              Want a lawyer to read it first? Add one for{' '}
              <span className="font-mono text-ink-700">
                {formatNaira(BEYOND_PRICING.LAWYER_REVIEW_ADDON)}
              </span>{' '}
              — returned within 48 hours by our own legal team.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ------------------------------------------------- Market stats -- */}
      <Section tone="darker" size="sm">
        <Reveal>
          <Eyebrow onDark className="text-center mb-10">
            The problem
          </Eyebrow>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0">
          {marketStats.map((stat, i) => (
            <div key={stat.label} className={i > 0 ? 'sm:border-l sm:border-white/10 sm:pl-8' : ''}>
              <p className="font-display text-display-md font-semibold text-brass-500 mb-2">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="font-body text-body-sm text-on-dark-muted max-w-xs">{stat.label}</p>
            </div>
          ))}
        </RevealGroup>
      </Section>

      {/* -------------------------------------------------------- Trust -- */}
      <Section tone="white">
        <Reveal>
          <Eyebrow className="text-center mb-4">Why trust the platform</Eyebrow>
          <h2 className="text-center font-display text-display-md font-semibold text-navy-900 mb-16">
            Trust, built in — not bolted on.
          </h2>
        </Reveal>
        <RevealGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {trustPoints.map((point) => (
            <div key={point.title}>
              <IconTile icon={point.icon} tone="brass" className="mb-5" />
              <h3 className="font-display text-title font-semibold text-navy-900 mb-2">
                {point.title}
              </h3>
              <p className="font-body text-body-sm text-ink-500">{point.body}</p>
            </div>
          ))}
        </RevealGroup>
      </Section>

      {/* ------------------------------------------------------ Pricing -- */}
      <Section id="pricing" tone="paper">
        <Reveal>
          <h2 className="text-center font-display text-display-md font-semibold text-navy-900 mb-3">
            Free to connect. Free to agree.
          </h2>
          <p className="text-center font-body text-ink-500 mb-16 max-w-xl mx-auto">
            No agent fee and no platform fee on the deal itself — you pay only for an optional
            extra. These are priced per activity, not per account: if you both let and rent, the
            first two columns are simply both yours.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-3 gap-8 lg:items-center">
          {/* Landlord */}
          <Reveal>
            <div className="bg-white border border-ink-200 rounded-card p-8 h-full">
              <Eyebrow className="mb-5">Letting a property</Eyebrow>
              <p className="font-display text-display-md font-semibold text-navy-900 leading-none mb-2">
                ₦0
              </p>
              {/* Honest per the copy audit: the subscription tier is planned but
                  unbuilt, and the threshold now comes from a constant. */}
              <p className="font-body text-body-sm text-ink-500 mb-7">
                To list, connect and agree — for your first{' '}
                {BEYOND_PRICING.LANDLORD_FREE_PROPERTY_LIMIT} properties. Beyond that,{' '}
                {formatNaira(BEYOND_PRICING.LANDLORD_SUBSCRIPTION)}/month.
              </p>
              <ul className="space-y-3 mb-8">
                {landlordFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-brass-600 flex-shrink-0 mt-0.5" size={17} aria-hidden />
                    <span className="font-body text-body-sm text-ink-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button variant="secondary" fullWidth>
                  List a property
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* Tenant — the emphasised tier */}
          <Reveal delay={0.08}>
            <div className="relative bg-navy-900 grain-overlay rounded-card p-8 shadow-xl overflow-hidden">
              <span className="absolute top-0 right-0 bg-brass-500 text-ink-950 font-mono text-label uppercase px-4 py-1.5 rounded-bl-card">
                Replaces your agency fee
              </span>
              <Eyebrow onDark className="mb-5">
                Renting a home
              </Eyebrow>
              <p className="font-display text-display-lg font-semibold text-brass-500 leading-none mb-2">
                ₦0
              </p>
              <p className="font-body text-body-sm text-on-dark-muted mb-7">
                Browsing, connecting and your standardized tenancy agreement. No percentage of
                rent, no platform fee.
              </p>

              <dl className="rounded-button bg-white/5 border border-white/10 p-4 mb-7 font-body text-body-sm space-y-2">
                <div className="flex justify-between gap-4 text-on-dark-muted">
                  <dt>Agent + legal fee elsewhere</dt>
                  <dd className="font-mono line-through">{formatNaira(agentTotal)}</dd>
                </div>
                <div className="flex justify-between gap-4 text-on-dark">
                  <dt>BeyondAgency</dt>
                  <dd className="font-mono">₦0</dd>
                </div>
                <div className="flex justify-between gap-4 pt-2 border-t border-white/15 font-semibold text-brass-300">
                  <dt>You keep</dt>
                  <dd className="font-mono">{formatNaira(agentTotal)}</dd>
                </div>
              </dl>

              <ul className="space-y-3 mb-8">
                {tenantFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-brass-500 flex-shrink-0 mt-0.5" size={17} aria-hidden />
                    <span className="font-body text-body-sm text-on-dark">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button fullWidth>Find a home</Button>
              </Link>
            </div>
          </Reveal>

          {/* Lawyer review */}
          <Reveal delay={0.16}>
            <div className="bg-white border border-ink-200 rounded-card p-8 h-full">
              <Eyebrow className="mb-5">Optional — lawyer review</Eyebrow>
              <p className="font-mono tabular-nums text-display-md font-medium text-navy-900 leading-none mb-2">
                {formatNaira(BEYOND_PRICING.LAWYER_REVIEW_ADDON)}
              </p>
              <p className="font-body text-body-sm text-ink-500 mb-7">
                One flat price, handled by our own salaried legal team — nobody bids for your
                business.
              </p>
              <ul className="space-y-3 mb-8">
                {lawyerReviewFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="text-brass-600 flex-shrink-0 mt-0.5" size={17} aria-hidden />
                    <span className="font-body text-body-sm text-ink-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" fullWidth disabled>
                Added when you accept
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <p className="text-center font-body text-ink-500 mt-14 max-w-2xl mx-auto">
            Tenants pay nothing to connect or agree. That&apos;s the deal — we earn from the
            marketplace of providers competing for optional work, not from the deal itself.
          </p>
          <p className="text-center font-body text-body-sm text-ink-400 mt-3">
            A verified, exportable rental-history report is{' '}
            {formatNaira(BEYOND_PRICING.RENTAL_HISTORY_EXPORT)} if you ever need one. Building the
            record is free.
          </p>
        </Reveal>
      </Section>

      {/* ---------------------------------------------------- Provider -- */}
      <Section tone="accent" size="sm">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-display text-title font-semibold text-navy-900">
              Licensed insurer or service provider?
            </p>
            <p className="font-body text-body-sm text-ink-600">
              Join the bid pool — jobs come to you, with no cold outreach.
            </p>
          </div>
          <Link href="/provider/apply">
            <Button variant="tertiary">Become a provider</Button>
          </Link>
        </div>
      </Section>

      {/* -------------------------------------------------------- Demo -- */}
      <Section id="book-demo" tone="white" width="wide">
        <div className="grid md:grid-cols-2 gap-14 items-start">
          <Reveal>
            <Eyebrow className="mb-4">Book a demo</Eyebrow>
            <h2 className="font-display text-display-md font-semibold text-navy-900 mb-4">
              See BeyondAgency in action.
            </h2>
            <p className="font-body text-ink-500 mb-8">
              We&apos;ll walk you through the platform, answer your questions, and show you how to
              close your first deal on BeyondAgency.
            </p>
            <ul className="space-y-4">
              {[
                { icon: Calendar, text: '30-minute session, no commitment' },
                { icon: Video, text: 'Over Google Meet or a phone call' },
                { icon: Users, text: 'Whether you’re letting, renting or investing' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <Icon className="text-brass-600 flex-shrink-0" size={19} aria-hidden />
                  <span className="font-body text-body-sm text-ink-700">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <DemoContactForm />
          </Reveal>
        </div>
      </Section>

      <SiteFooter />
    </>
  );
}
