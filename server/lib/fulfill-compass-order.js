/**
 * Generate compass HTML report and store on Vercel Blob.
 */
import { put } from '@vercel/blob';
import { buildCompassReportHtml, isCompassProduct } from './generate-compass-report-html.js';

export function fieldsToIntake(fields = {}) {
  return {
    dob: fields['Date of birth'] || fields.dob || '',
    gender: (fields['Gender'] || fields.gender || '').toLowerCase(),
    facing: fields['Home facing'] || fields.facing || 'S',
    year: parseInt(fields['Flying star year'] || fields.year || '2026', 10),
    kua: fields['Kua number'] || fields.kua || '',
  };
}

export async function fulfillCompassOrder({ productKey, email, fields, saleId }) {
  if (!isCompassProduct(productKey)) return null;

  const intake = fieldsToIntake(fields);
  const html = buildCompassReportHtml({
    productKey,
    dob: intake.dob,
    gender: intake.gender,
    facing: intake.facing,
    year: intake.year,
    email,
  });

  const id = saleId || `compass-${Date.now()}`;
  const filename = `reports/compass/${id}.html`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[fulfill-compass] BLOB_READ_WRITE_TOKEN missing — report not stored');
    return { html, url: null, intake };
  }

  const blob = await put(filename, html, {
    access: 'public',
    contentType: 'text/html; charset=utf-8',
    addRandomSuffix: false,
  });

  return { html, url: blob.url, intake };
}
