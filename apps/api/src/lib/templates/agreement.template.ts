export interface AgreementTemplateData {
  agreementId: string;
  landlordName: string;
  landlordEmail: string;
  tenantName: string;
  tenantEmail: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: number;
  annualRent: number;
  startDate: string;
  endDate: string;
  generatedAt: string;
  hasLawyerReview: boolean;
}

export function generateAgreementHTML(data: AgreementTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tenancy Agreement — Leja</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #1C1118;
      padding: 60px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0D1B2A;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .logo {
      font-family: 'Georgia', serif;
      font-size: 28pt;
      font-weight: bold;
      color: #0D1B2A;
      letter-spacing: 4px;
    }
    .doc-title {
      font-size: 16pt;
      font-weight: bold;
      color: #1A7A4A;
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .ref {
      font-size: 9pt;
      color: #718096;
      margin-top: 4px;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      color: #0D1B2A;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 6px;
      margin-bottom: 14px;
    }
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    .party-box {
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 16px;
      background: #F7F9FC;
    }
    .party-label {
      font-size: 9pt;
      font-weight: bold;
      color: #1A7A4A;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .party-name {
      font-size: 13pt;
      font-weight: bold;
      color: #0D1B2A;
    }
    .party-email {
      font-size: 9pt;
      color: #718096;
      margin-top: 2px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .detail-item {
      padding: 10px 0;
      border-bottom: 1px solid #F0F4F8;
    }
    .detail-label {
      font-size: 8pt;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value {
      font-size: 11pt;
      font-weight: bold;
      color: #1C1118;
      margin-top: 2px;
    }
    .rent-box {
      background: #0D1B2A;
      color: white;
      border-radius: 8px;
      padding: 20px 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 20px 0;
    }
    .rent-item .rent-label {
      font-size: 8pt;
      color: #A0AEC0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .rent-item .rent-value {
      font-size: 16pt;
      font-weight: bold;
      color: #ffffff;
      margin-top: 2px;
    }
    .clause {
      margin-bottom: 14px;
      padding-left: 0;
    }
    .clause-num {
      font-weight: bold;
      color: #1A7A4A;
    }
    .lawyer-badge {
      background: #1A7A4A;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
      font-size: 10pt;
      font-weight: bold;
    }
    .signature-section {
      margin-top: 48px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }
    .sig-block .sig-label {
      font-size: 9pt;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 40px;
    }
    .sig-line {
      border-top: 1px solid #1C1118;
      padding-top: 8px;
    }
    .sig-name {
      font-size: 10pt;
      font-weight: bold;
    }
    .sig-role {
      font-size: 9pt;
      color: #718096;
    }
    .footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 8pt;
      color: #A0AEC0;
    }
    .watermark-verified {
      position: fixed;
      bottom: 40px;
      right: 40px;
      opacity: 0.08;
      font-size: 48pt;
      font-weight: bold;
      color: #1A7A4A;
      transform: rotate(-30deg);
      pointer-events: none;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="logo">LEJA</div>
    <div class="doc-title">Residential Tenancy Agreement</div>
    <div class="ref">Agreement Ref: ${data.agreementId.toUpperCase().slice(0, 8)} &nbsp;|&nbsp; Generated: ${data.generatedAt}</div>
  </div>

  <div class="section">
    <div class="section-title">Parties to this Agreement</div>
    <div class="parties-grid">
      <div class="party-box">
        <div class="party-label">Landlord</div>
        <div class="party-name">${data.landlordName}</div>
        <div class="party-email">${data.landlordEmail}</div>
      </div>
      <div class="party-box">
        <div class="party-label">Tenant</div>
        <div class="party-name">${data.tenantName}</div>
        <div class="party-email">${data.tenantEmail}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Property Details</div>
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-label">Address</div>
        <div class="detail-value">${data.propertyAddress}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">City / State</div>
        <div class="detail-value">${data.propertyCity}, ${data.propertyState}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Property Type</div>
        <div class="detail-value">${data.propertyType}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Bedrooms / Bathrooms</div>
        <div class="detail-value">${data.bedrooms} bed / ${data.bathrooms} bath</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Tenancy Period & Rent</div>
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-label">Tenancy Start Date</div>
        <div class="detail-value">${data.startDate}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Tenancy End Date</div>
        <div class="detail-value">${data.endDate}</div>
      </div>
    </div>
    <div class="rent-box">
      <div class="rent-item">
        <div class="rent-label">Monthly Rent</div>
        <div class="rent-value">₦${Number(data.monthlyRent).toLocaleString()}</div>
      </div>
      <div class="rent-item">
        <div class="rent-label">Annual Rent</div>
        <div class="rent-value">₦${Number(data.annualRent).toLocaleString()}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Terms & Conditions</div>

    <div class="clause">
      <span class="clause-num">1. PAYMENT OF RENT.</span> The Tenant agrees to pay the annual rent
      of ₦${Number(data.annualRent).toLocaleString()} to the Landlord in the manner agreed between
      both parties. Rent shall be paid in advance and shall be due on the commencement date of
      each tenancy year.
    </div>

    <div class="clause">
      <span class="clause-num">2. USE OF PROPERTY.</span> The Tenant shall use the property solely
      for residential purposes and shall not sublet, assign, or part with possession of the property
      or any part thereof without the prior written consent of the Landlord.
    </div>

    <div class="clause">
      <span class="clause-num">3. MAINTENANCE.</span> The Tenant shall keep the property in good
      and tenantable repair and condition throughout the tenancy and shall return the property to
      the Landlord in the same condition at the end of the tenancy, fair wear and tear excepted.
    </div>

    <div class="clause">
      <span class="clause-num">4. LANDLORD ACCESS.</span> The Landlord shall give reasonable notice
      (minimum 24 hours) before entering the property for inspection, maintenance, or repairs,
      except in cases of emergency.
    </div>

    <div class="clause">
      <span class="clause-num">5. TERMINATION.</span> Either party may terminate this agreement
      by giving one (1) month written notice to the other party. Early termination without notice
      shall be subject to applicable penalties under the Lagos State Tenancy Law (or relevant
      state law where the property is situated).
    </div>

    <div class="clause">
      <span class="clause-num">6. CAUTION DEPOSIT.</span> Any caution deposit paid by the Tenant
      shall be refunded within 30 days of the end of the tenancy, less any deductions for damages
      beyond normal wear and tear, which shall be itemised and communicated in writing.
    </div>

    <div class="clause">
      <span class="clause-num">7. DISPUTE RESOLUTION.</span> Any dispute arising from this
      agreement shall first be referred to mediation through the Leja platform. If unresolved,
      the dispute shall be referred to the appropriate Tenancy Tribunal in the state where the
      property is situated.
    </div>

    <div class="clause">
      <span class="clause-num">8. GOVERNING LAW.</span> This agreement is governed by the laws
      of the Federal Republic of Nigeria and the relevant state tenancy legislation applicable
      to the property location.
    </div>
  </div>

  ${data.hasLawyerReview ? `
  <div class="lawyer-badge">
    ✓ This agreement has been reviewed and verified by a Leja-certified legal practitioner
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Signatures</div>
    <p style="font-size: 10pt; color: #718096; margin-bottom: 24px;">
      By proceeding with payment on the Leja platform, both parties confirm their acceptance
      of the terms of this agreement. Digital acceptance is legally binding under Nigerian law.
    </p>
    <div class="signature-section">
      <div class="sig-block">
        <div class="sig-label">Landlord Signature</div>
        <div class="sig-line">
          <div class="sig-name">${data.landlordName}</div>
          <div class="sig-role">Landlord</div>
        </div>
      </div>
      <div class="sig-block">
        <div class="sig-label">Tenant Signature</div>
        <div class="sig-line">
          <div class="sig-name">${data.tenantName}</div>
          <div class="sig-role">Tenant</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    This agreement was generated by Leja (leja.ng) — Nigeria's trusted tenancy platform.
    Agreement ID: ${data.agreementId} &nbsp;|&nbsp; Generated: ${data.generatedAt}
    <br>
    This document is legally binding. For disputes, visit leja.ng/dispute or contact support@leja.ng
  </div>

  <div class="watermark-verified">LEJA</div>

</body>
</html>
  `;
}
