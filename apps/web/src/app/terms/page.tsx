import type { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/marketing/LegalPage';
import { BEYOND_PRICING } from '@beyond/shared';
import { formatNaira } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing your use of BeyondAgency.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="August 2026"
      intro="These terms govern your use of BeyondAgency. They explain what we do, what we charge for, and — importantly — what we are not responsible for."
    >
      <LegalSection heading="What BeyondAgency is">
        <p>
          BeyondAgency is a platform that connects parties to a deal, helps them record an
          agreement, and provides access to optional professional services. We are not an estate
          agent, a landlord, a tenant, a law firm, or an insurer.
        </p>
        <p>
          We do not own, inspect, manage or guarantee any property listed on the platform. An
          agreement generated through BeyondAgency is between the parties to it, not with us.
        </p>
      </LegalSection>

      <LegalSection heading="What we charge">
        <p>
          Connecting with the other party and generating a standardized tenancy agreement are free.
          We charge only for optional extras:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Lawyer review of your agreement —{' '}
            <span className="font-mono">{formatNaira(BEYOND_PRICING.LAWYER_REVIEW_ADDON)}</span>,
            delivered by our in-house legal team.
          </li>
          <li>
            A verified, exportable rental-history report —{' '}
            <span className="font-mono">{formatNaira(BEYOND_PRICING.RENTAL_HISTORY_EXPORT)}</span>.
          </li>
          <li>
            Landlords listing more than {BEYOND_PRICING.LANDLORD_FREE_PROPERTY_LIMIT} properties —{' '}
            <span className="font-mono">{formatNaira(BEYOND_PRICING.LANDLORD_SUBSCRIPTION)}</span>{' '}
            per month.
          </li>
          <li>Provider subscriptions for priority visibility in the bid pool.</li>
        </ul>
        <p>
          Where a provider is engaged through the bid marketplace, our commission is deducted from
          the provider&apos;s payout. It is never added on top of the price you are quoted.
        </p>
      </LegalSection>

      <LegalSection heading="Verification and its limits">
        <p>
          We verify the identity of users through third-party identity providers. Identity
          verification confirms that a person is who they claim to be. It does not confirm that
          they own a property, that a property exists as described, or that they will honour an
          agreement.
        </p>
        <p>
          Property title verification is not yet available and is not implied by any badge or
          status shown on the platform today. You remain responsible for your own due diligence.
        </p>
      </LegalSection>

      <LegalSection heading="Payments">
        <p>
          Payments are processed by our payment partner, eTranzact, through a dedicated account
          generated for each transaction. BeyondAgency does not hold your funds.
        </p>
      </LegalSection>

      <LegalSection heading="Agreements and disputes">
        <p>
          An agreement recorded on BeyondAgency is a contract between the parties to it. We provide
          a standardized template and a record of acceptance; we are not a party to the agreement
          and cannot enforce it on your behalf.
        </p>
        <p>
          Where you have purchased lawyer review, our legal team&apos;s role is limited to
          reviewing the agreement document. It does not create a solicitor–client relationship for
          any other matter.
        </p>
      </LegalSection>

      <LegalSection heading="Ending your use of the platform">
        <p>
          You may close your account at any time. We may suspend an account that we reasonably
          believe is being used fraudulently, to misrepresent a property, or to harass another
          user. Agreements already recorded remain on record.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these terms:{' '}
          <a className="text-brass-700 underline underline-offset-4" href="mailto:legal@beyondagency.ng">
            legal@beyondagency.ng
          </a>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
