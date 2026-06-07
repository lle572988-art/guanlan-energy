/**
 * Day 0 PDF delivery hook — compiles chart SVG + birth details into a downloadable PDF.
 *
 * Integration points (future):
 * - @react-pdf/renderer or puppeteer-core + @sparticuz/chromium on Vercel
 * - Upload finished PDF to Vercel Blob / S3 and email link via ESP automation
 *
 * For now this prepares the job payload and returns a pending status.
 */

import { put } from '@vercel/blob';

const PDF_JOBS_PREFIX = 'pdf-jobs/';

export async function generateChartPDF(userData) {
  const jobId = `chart-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();

  const job = {
    jobId,
    status: 'pending',
    event: 'day-0-instant-delivery',
    email: userData.email,
    dob: userData.dob || '',
    hour: userData.hour ?? '',
    country: userData.country || '',
    mainStar: userData.mainStar || '',
    mainStarEn: userData.mainStarEn || '',
    hasChartSvg: Boolean(userData.chartSvg),
    chartSvgLength: userData.chartSvg ? userData.chartSvg.length : 0,
    createdAt,
    pdfUrl: null,
    note: 'PDF generation pipeline placeholder — wire puppeteer/react-pdf here',
  };

  // Persist job metadata for async worker / manual fulfillment
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put(`${PDF_JOBS_PREFIX}${jobId}.json`, JSON.stringify(job, null, 2), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
    } catch (err) {
      console.error('[generateChartPDF] blob write failed:', err.message);
    }
  }

  // TODO: Replace with real PDF render + blob upload
  // const pdfBuffer = await renderChartPdfBuffer(userData);
  // const { url } = await put(`reports/${jobId}.pdf`, pdfBuffer, { access: 'private', contentType: 'application/pdf' });
  // job.status = 'ready'; job.pdfUrl = url;

  return job;
}
