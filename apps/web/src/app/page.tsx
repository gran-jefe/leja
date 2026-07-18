'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  FileCheck,
  Users,
  Building2,
  Home as HomeIcon,
  CheckCircle,
  CheckCircle2,
  UserPlus,
  FileText,
  ShieldCheck,
  Scale,
  Calendar,
  Video,
  Twitter,
  Linkedin,
  Instagram,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import api from '@/lib/api';
import { cn, getErrorMessage, formatNaira } from '@/lib/utils';
import { LEJA_PRICING } from '@leja/shared';

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
    icon: UserPlus,
    title: 'Create your account',
    body: 'Sign up as a landlord or tenant in under 2 minutes. No documents needed to get started.',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Generate your agreement',
    body: 'Fill in the property details and tenancy terms. Leja generates a state-compliant agreement instantly.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Sign, pay, move in',
    body: 'Both parties confirm digitally. Payment is processed securely. Your PDF agreement is ready to download.',
  },
];

const stats = [
  { value: '₦180B+', label: 'paid in agent fees annually in Lagos alone' },
  { value: '65%', label: 'of Lagos tenant complaints involve landlord misconduct' },
  { value: '22M', label: 'unit housing deficit across Nigeria' },
  { value: '48hrs', label: 'average time to get a lawyer-reviewed agreement on Leja' },
  { value: '₦105,000', label: 'saved per tenant vs using an agent' },
];

const landlordPricingFeatures = [
  'List unlimited properties',
  'Generate tenancy agreements',
  'Verified tenant matching',
  'Agreement tracking dashboard',
];

const tenantPricingFeatures = [
  'Proper state-compliant agreement',
  'No agent involved',
  'Verified rental history record',
  'Legal protection if things go wrong',
];

const lawyerReviewFeatures = [
  'Lawyer reviews your agreement',
  'Stamped within 48 hours',
  'Legal practitioner certified',
  'Priority dispute support',
];

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.enum(['LANDLORD', 'TENANT', 'INVESTOR', 'OTHER']),
  message: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

function DemoContactForm() {
  const [submitted, setSubmitted] = useState<{ name: string } | null>(null);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { role: 'LANDLORD' },
  });

  const onSubmit = async (data: ContactFormData) => {
    setSubmitError('');
    try {
      await api.post('/contact', data);
      setSubmitted({ name: data.name });
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Something went wrong. Please try again.'));
    }
  };

  if (submitted) {
    return (
      <div className="bg-cream rounded-card p-8 border border-border text-center py-16">
        <CheckCircle2 className="text-forest mx-auto mb-4" size={48} />
        <p className="font-body text-charcoal text-lg">
          Thanks {submitted.name}! We&apos;ll be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-card p-8 border border-border">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full name" {...register('name')} error={errors.name?.message} />
        <Input
          label="Email address"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input label="Phone number" {...register('phone')} error={errors.phone?.message} />
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2 font-body">
            I am a:
          </label>
          <select
            className="w-full px-4 py-2 border border-border rounded-button focus:outline-none focus:ring-2 focus:ring-forest font-body"
            {...register('role')}
          >
            <option value="LANDLORD">Landlord</option>
            <option value="TENANT">Tenant</option>
            <option value="INVESTOR">Investor</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <Textarea label="Message / questions" rows={4} {...register('message')} />
        {submitError && <p className="text-sm text-ember font-body">{submitError}</p>}
        <Button variant="primary" className="w-full" loading={isSubmitting}>
          Book My Demo
        </Button>
      </form>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen bg-navy overflow-hidden flex items-center pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-3">
            <span className="inline-block bg-forest text-white text-xs font-semibold px-4 py-1.5 rounded-full font-body mb-6">
              Now available in Lagos & Abuja
            </span>
            <h1 className="font-display text-white font-bold text-[36px] md:text-[56px] leading-tight mb-6">
              Renting in Nigeria,
              <br />
              finally done properly.
            </h1>
            <p className="font-body text-white text-opacity-90 text-xl mb-4">
              No agents. No weak agreements. No excuses.
            </p>
            <p className="font-body text-[#A0AEC0] text-base mb-8 max-w-xl">
              Landlords list free. Tenants pay ₦15,000 — not ₦100,000 to an agent who
              disappears after handing over a key.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/#book-demo">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-ember hover:bg-opacity-90 w-full sm:w-auto"
                >
                  Book a Demo
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full border-2 border-white text-white hover:bg-white hover:bg-opacity-10"
                >
                  See how it works
                </Button>
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-[#A0AEC0] font-body">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                Bank-grade security
              </div>
              <div className="flex items-center gap-2">
                <FileCheck size={16} />
                State-compliant agreements
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} />
                No agent fees
              </div>
            </div>
          </div>

          <div className="hidden md:block md:col-span-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-card border-2 border-forest animate-pulse pointer-events-none" />
              <div className="relative bg-white rounded-card shadow-2xl p-6 overflow-hidden">
                <div className="absolute -bottom-4 -right-4 font-display font-bold text-7xl text-forest opacity-5 rotate-[-30deg] select-none pointer-events-none">
                  LEJA
                </div>
                <p className="font-display text-navy font-bold text-sm uppercase tracking-wide mb-4">
                  Tenancy Agreement
                </p>
                <div className="space-y-2 mb-4 font-body text-sm">
                  <p className="text-charcoal">
                    <span className="text-muted">Landlord:</span> Adebayo Okafor
                  </p>
                  <p className="text-charcoal">
                    <span className="text-muted">Tenant:</span> Chioma Ezeh
                  </p>
                </div>
                <p className="font-body text-sm text-charcoal mb-4">
                  3 Bedroom Flat, Lekki Phase 1, Lagos
                </p>
                <p className="font-display text-forest font-bold text-2xl mb-4">
                  ₦2,400,000{' '}
                  <span className="text-sm font-body text-muted font-normal">/ year</span>
                </p>
                <span className="inline-block bg-forest text-white text-xs font-semibold px-3 py-1 rounded-full font-body">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Split value proposition */}
      <section id="for-landlords" className="bg-cream py-24">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center font-body text-xs uppercase tracking-wider text-muted mb-16">
            Built for both sides of the rental market
          </p>
          <div className="grid md:grid-cols-2 gap-16 md:gap-0 relative">
            <div className="md:pr-12">
              <Building2 className="text-navy mb-4" size={40} />
              <h3 className="font-display text-2xl font-bold text-navy mb-2">For Landlords</h3>
              <p className="font-body text-muted mb-6">
                Stop relying on agents who disappear after handing over a key.
              </p>
              <ul className="space-y-4 mb-8">
                {landlordBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="text-forest flex-shrink-0 mt-0.5" size={20} />
                    <span className="font-body text-charcoal">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="primary">List your property free</Button>
              </Link>
            </div>

            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

            <div id="for-tenants" className="md:pl-12">
              <HomeIcon className="text-forest mb-4" size={40} />
              <h3 className="font-display text-2xl font-bold text-navy mb-2">For Tenants</h3>
              <p className="font-body text-muted mb-6">
                Stop paying agents ₦100,000 for handing over a key.
              </p>
              <ul className="space-y-4 mb-8">
                {tenantBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="text-ember flex-shrink-0 mt-0.5" size={20} />
                    <span className="font-body text-charcoal">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="primary">Find a property</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center font-body text-xs uppercase tracking-wider text-muted mb-4">
            Simple by design
          </p>
          <h2 className="text-center font-display text-navy font-bold text-[32px] md:text-[40px] mb-16">
            Three steps. One agreement. Zero agents.
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step) => (
              <div key={step.number}>
                <span className="font-display text-5xl font-bold text-ember">{step.number}</span>
                <step.icon className="text-navy my-4" size={32} />
                <h3 className="font-display text-xl font-bold text-navy mb-2">{step.title}</h3>
                <p className="font-body text-muted">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-16 pt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <Scale className="text-muted flex-shrink-0" size={18} />
            <p className="font-body text-muted text-sm">
              Need a lawyer to review the agreement? Add one for ₦8,000 — reviewed within 48
              hours.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  'text-center px-4',
                  i > 0 && 'md:border-l md:border-white md:border-opacity-10'
                )}
              >
                <p className="font-display text-ember font-bold text-4xl mb-2">{stat.value}</p>
                <p className="font-body text-[#A0AEC0] text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-cream py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center font-display text-navy font-bold text-[32px] md:text-[40px] mb-3">
            Transparent pricing. No surprises.
          </h2>
          <p className="text-center font-body text-muted mb-16">
            One clear fee, paid once — no negotiating with an agent.
          </p>
          <div className="grid md:grid-cols-3 gap-8 md:items-center">
            {/* For Landlords — free */}
            <div className="bg-forest bg-opacity-5 border-2 border-forest rounded-card p-8">
              <p className="font-body text-xs uppercase tracking-wider text-forest font-semibold mb-4">
                For Landlords
              </p>
              <p className="font-display text-forest font-bold text-4xl mb-1">FREE</p>
              <p className="font-body text-muted text-sm mb-6">Always. No hidden fees.</p>
              <ul className="space-y-3 mb-8">
                {landlordPricingFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="text-forest flex-shrink-0 mt-0.5" size={18} />
                    <span className="font-body text-charcoal text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button variant="secondary" className="w-full">
                  List your property free
                </Button>
              </Link>
            </div>

            {/* For Tenants — highlighted */}
            <div className="relative bg-navy text-white rounded-card p-8 shadow-xl md:scale-105">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ember text-white text-xs font-semibold px-4 py-1 rounded-full font-body whitespace-nowrap">
                Replaces your agency fee
              </span>
              <p className="font-body text-xs uppercase tracking-wider text-white text-opacity-70 font-semibold mb-4">
                For Tenants
              </p>
              <p className="font-display text-white font-bold text-4xl mb-1">
                {formatNaira(LEJA_PRICING.TENANT_MOVE_IN_FEE)}
              </p>
              <p className="font-body text-white text-opacity-70 text-sm mb-6">
                One-time move-in fee per tenancy
              </p>

              <div className="bg-white bg-opacity-5 rounded-button p-4 mb-6 font-body text-sm">
                <p className="text-white text-opacity-70 mb-2">vs going through an agent:</p>
                <div className="flex justify-between text-white text-opacity-60">
                  <span>Agent fee</span>
                  <span className="line-through">{formatNaira(LEJA_PRICING.TYPICAL_AGENT_FEE)}</span>
                </div>
                <div className="flex justify-between text-white text-opacity-60">
                  <span>Legal fee</span>
                  <span className="line-through">{formatNaira(LEJA_PRICING.TYPICAL_LEGAL_FEE)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Leja fee</span>
                  <span>{formatNaira(LEJA_PRICING.TENANT_MOVE_IN_FEE)} ✓</span>
                </div>
                <div className="border-t border-white border-opacity-20 mt-2 pt-2 flex justify-between font-semibold text-ember">
                  <span>You save</span>
                  <span>
                    {formatNaira(
                      LEJA_PRICING.TYPICAL_AGENT_FEE +
                        LEJA_PRICING.TYPICAL_LEGAL_FEE -
                        LEJA_PRICING.TENANT_MOVE_IN_FEE
                    )}
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tenantPricingFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="text-forest flex-shrink-0 mt-0.5" size={18} />
                    <span className="font-body text-white text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button variant="primary" className="w-full bg-ember hover:bg-opacity-90">
                  Find a property
                </Button>
              </Link>
            </div>

            {/* Lawyer review add-on */}
            <div className="bg-white border-2 border-ember rounded-card p-8">
              <p className="font-body text-xs uppercase tracking-wider text-ember font-semibold mb-4">
                Lawyer Review
              </p>
              <p className="font-display text-ember font-bold text-4xl mb-1">
                +{formatNaira(LEJA_PRICING.TENANT_LAWYER_REVIEW)}
              </p>
              <p className="font-body text-muted text-sm mb-6">
                Optional add-on to your move-in fee
              </p>
              <ul className="space-y-3 mb-8">
                {lawyerReviewFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className="text-forest flex-shrink-0 mt-0.5" size={18} />
                    <span className="font-body text-charcoal text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full" disabled>
                Add when accepting agreement
              </Button>
            </div>
          </div>

          <p className="text-center font-body text-muted text-lg mt-16">
            Landlords pay nothing. Tenants pay a fraction of what agents charge. That&apos;s the
            deal.
          </p>
        </div>
      </section>

      {/* Demo booking / contact form */}
      <section id="book-demo" className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="font-display text-navy font-bold text-[32px] md:text-[40px] mb-4">
              See Leja in action.
            </h2>
            <p className="font-body text-muted mb-8">
              We&apos;ll walk you through the platform, answer your questions, and show you how
              to close your first deal on Leja.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="text-forest flex-shrink-0" size={20} />
                <span className="font-body text-charcoal text-sm">
                  30-minute session, no commitment
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Video className="text-forest flex-shrink-0" size={20} />
                <span className="font-body text-charcoal text-sm">
                  Done over Google Meet or phone call
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-forest flex-shrink-0" size={20} />
                <span className="font-body text-charcoal text-sm">
                  Available for landlords, tenants, and investors
                </span>
              </div>
            </div>
          </div>

          <DemoContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-navy py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <p className="font-display text-white font-bold text-2xl mb-3">LEJA</p>
              <p className="font-body text-[#A0AEC0] text-sm mb-4">
                Renting in Nigeria, finally done properly.
              </p>
              <p className="font-body text-[#A0AEC0] text-xs">
                © 2026 Gran Jefe Technical Solutions. RC 9529101.
              </p>
            </div>
            <div>
              <p className="font-body text-white font-semibold mb-4">Product</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#how-it-works"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#for-landlords"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    For Landlords
                  </a>
                </li>
                <li>
                  <a
                    href="#for-tenants"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    For Tenants
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-body text-white font-semibold mb-4">Company</p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#footer"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#book-demo"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-[#A0AEC0] text-sm hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-body text-white font-semibold mb-4">Contact</p>
              <p className="font-body text-[#A0AEC0] text-sm mb-2">Lagos & Abuja, Nigeria</p>
              <p className="font-body text-[#A0AEC0] text-sm mb-4">support@leja.ng</p>
              <div className="flex gap-4">
                <a href="#" aria-label="Twitter">
                  <Twitter className="text-[#A0AEC0] hover:text-white transition-colors" size={20} />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <Linkedin className="text-[#A0AEC0] hover:text-white transition-colors" size={20} />
                </a>
                <a href="#" aria-label="Instagram">
                  <Instagram className="text-[#A0AEC0] hover:text-white transition-colors" size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white border-opacity-10 pt-8 text-center">
            <p className="font-body text-muted text-sm">Built in Nigeria 🇳🇬</p>
          </div>
        </div>
      </footer>
    </>
  );
}
