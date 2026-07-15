import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { supabase, pool } from '../db/index';
import { generateAgreementHTML, AgreementTemplateData } from './templates/agreement.template';

export async function generateAgreementPDF(data: AgreementTemplateData): Promise<string> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    const html = generateAgreementHTML(data);
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await browser.close();

    const fileName = `agreements/${data.agreementId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('agreements')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

    const { data: signedData, error: signedError } = await supabase.storage
      .from('agreements')
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);

    if (signedError) throw new Error(`Failed to get signed URL: ${signedError.message}`);

    return signedData.signedUrl;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

const formatReadableDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

export async function generateAndSaveAgreementPDF(agreementId: string): Promise<string> {
  try {
    const { rows } = await pool.query(
      `SELECT
         a.*,
         l.name as landlord_name, l.email as landlord_email,
         t.name as tenant_name, t.email as tenant_email,
         p.address, p.city, p.state, p.property_type, p.bedrooms, p.bathrooms
       FROM agreements a
       JOIN users l ON a.landlord_id = l.id
       JOIN users t ON a.tenant_id = t.id
       LEFT JOIN properties p ON a.property_id = p.id
       WHERE a.id = $1`,
      [agreementId]
    );

    const agreement = rows[0];
    if (!agreement) {
      throw new Error(`Agreement ${agreementId} not found`);
    }

    const templateData: AgreementTemplateData = {
      agreementId: agreement.id,
      landlordName: agreement.landlord_name,
      landlordEmail: agreement.landlord_email,
      tenantName: agreement.tenant_name,
      tenantEmail: agreement.tenant_email,
      propertyAddress: agreement.address,
      propertyCity: agreement.city,
      propertyState: agreement.state,
      propertyType: agreement.property_type,
      bedrooms: agreement.bedrooms,
      bathrooms: agreement.bathrooms,
      monthlyRent: agreement.monthly_rent,
      annualRent: agreement.annual_rent,
      startDate: formatReadableDate(agreement.start_date),
      endDate: formatReadableDate(agreement.end_date),
      generatedAt: new Date().toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      hasLawyerReview: agreement.lawyer_review_status === 'COMPLETED',
    };

    const signedUrl = await generateAgreementPDF(templateData);

    const { error: updateError } = await supabase
      .from('agreements')
      .update({ pdf_url: signedUrl })
      .eq('id', agreementId);

    if (updateError) {
      throw new Error(`Failed to save pdf_url: ${updateError.message}`);
    }

    return signedUrl;
  } catch (error: any) {
    throw new Error(`Failed to generate agreement PDF: ${error.message}`);
  }
}
