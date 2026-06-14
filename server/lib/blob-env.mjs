/** Vercel Blob + Fal env helpers (OIDC and legacy token). */
export function getFalApiKey() {
  return (process.env.FAL_API_KEY || process.env.FAL_KEY || '').trim();
}

export function hasBlobCredentials() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return true;
  if (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID) return true;
  return Object.keys(process.env).some(function (key) {
    return /BLOB.*READ_WRITE_TOKEN$/i.test(key) || /_READ_WRITE_TOKEN$/.test(key) && /blob/i.test(key);
  });
}
