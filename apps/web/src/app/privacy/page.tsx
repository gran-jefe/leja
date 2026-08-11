import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/marketing/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How BeyondAgency collects, uses and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="August 2026"
      intro="This policy explains what personal data BeyondAgency collects, why we collect it, and what control you have over it. It is written to align with the Nigeria Data Protection Act."
    >
      <LegalSection heading="What we collect">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-ink-800">Account details</strong> — name, email address, phone
            number, and role (landlord, tenant or provider).
          </li>
          <li>
            <strong className="text-ink-800">Identity data</strong> — BVN or NIN, submitted to our
            identity verification partner to confirm you are who you say you are. We store the
            verification result and a reference, not the raw credential.
          </li>
          <li>
            <strong className="text-ink-800">Agreement data</strong> — the terms you enter, the
            parties involved, and the record of acceptance.
          </li>
          <li>
            <strong className="text-ink-800">Payment references</strong> — the transaction
            reference and status. Card and bank credentials are handled by eTranzact and never
            reach our servers.
          </li>
          <li>
            <strong className="text-ink-800">Property information</strong> — listings, photos and
            descriptions provided by landlords.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Why we collect it">
        <p>
          To operate the platform: to verify identities so the other party can trust who they are
          dealing with, to generate and store agreements, to process optional payments, and to
          build the rental history record that tenants can later export.
        </p>
        <p>
          We do not sell your personal data, and we do not share it with advertisers.
        </p>
      </LegalSection>

      <LegalSection heading="Who can see your data">
        <p>
          An agreement is visible only to the two parties to it. A landlord cannot see a tenant&apos;s
          agreements with other landlords, and vice versa.
        </p>
        <p>
          Where you engage a provider — a lawyer for review, or an insurer for cover — that
          provider sees only what is necessary to perform the job.
        </p>
        <p>
          We share data with processors who operate parts of the service on our behalf: our hosting
          provider, our identity verification partner, and our payment partner.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You may request a copy of the personal data we hold about you, ask us to correct it, or
          ask us to delete your account. Some records — notably agreements that have been accepted
          — must be retained because they document a contract between two parties, and deleting one
          party&apos;s copy would prejudice the other.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep it">
        <p>
          Account data is kept while your account is open. Agreement records are retained for the
          duration of the tenancy plus a further period as required to resolve disputes and meet
          record-keeping obligations.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          To exercise any of these rights, or for questions about this policy:{' '}
          <a
            className="text-brass-700 underline underline-offset-4"
            href="mailto:privacy@beyondagency.ng"
          >
            privacy@beyondagency.ng
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
