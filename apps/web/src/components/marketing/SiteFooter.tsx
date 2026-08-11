import Link from 'next/link';
import { Linkedin, Instagram, Twitter } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Container } from '@/components/layout/Container';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/#for-landlords', label: 'For landlords' },
      { href: '/#for-tenants', label: 'For tenants' },
      { href: '/provider/apply', label: 'For providers' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/#platform', label: 'Platform' },
      { href: '/#book-demo', label: 'Book a demo' },
      // Real routes now — these were both href="#", which is a poor look for a
      // platform asking people to sign legally binding agreements.
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
];

const socials = [
  { href: 'https://twitter.com', label: 'Twitter', icon: Twitter },
  { href: 'https://linkedin.com', label: 'LinkedIn', icon: Linkedin },
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
];

export function SiteFooter() {
  return (
    <footer className="relative bg-navy-950 bg-grain py-16 overflow-hidden">
      <Container className="relative">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <Logo onDark size="md" className="mb-4" />
            <p className="font-body text-body-sm text-on-dark-muted mb-4">
              Bridging Trust. Simplifying Deals.
            </p>
            <p className="font-mono text-body-sm text-ink-400">
              © 2026 Gran Jefe Technical Solutions
              <br />
              RC 9529101
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-label uppercase text-brass-300 mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-body-sm text-on-dark-muted hover:text-on-dark transition-colors duration-fast"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="font-mono text-label uppercase text-brass-300 mb-4">Contact</p>
            <p className="font-body text-body-sm text-on-dark-muted mb-1">Lagos &amp; Abuja, Nigeria</p>
            {/* Was support@leja.ng — the pre-rename domain. */}
            <a
              href="mailto:support@beyondagency.ng"
              className="font-body text-body-sm text-on-dark-muted hover:text-on-dark transition-colors duration-fast"
            >
              support@beyondagency.ng
            </a>
            <div className="flex gap-4 mt-5">
              {socials.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-400 hover:text-brass-300 transition-colors duration-fast"
                >
                  <Icon size={19} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-body-sm text-ink-400">Built in Nigeria</p>
          <p className="font-body text-body-sm text-ink-400">
            Payments processed via eTranzact. Funds never held by BeyondAgency.
          </p>
        </div>
      </Container>
    </footer>
  );
}
