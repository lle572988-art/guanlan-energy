/** Shared Vercel Blob upload helper for compass APIs */
import { put } from '@vercel/blob';

function findBlobReadWriteToken() {
  const direct = (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (direct) return direct;
  for (const key of Object.keys(process.env)) {
    if (/READ_WRITE_TOKEN$/i.test(key) && process.env[key]) {
      return String(process.env[key]).trim();
    }
  }
  return '';
}

export async function putPublicBlob(pathname, data, contentType) {
  const token = findBlobReadWriteToken();
  const base = { access: 'public', contentType };

  if (token) {
    return put(pathname, data, { ...base, token });
  }

  const oidc = (process.env.VERCEL_OIDC_TOKEN || '').trim();
  const storeId = (process.env.BLOB_STORE_ID || '').trim();
  if (oidc && storeId) {
    return put(pathname, data, { ...base, oidcToken: oidc, storeId });
  }

  throw new Error('BLOB_NOT_CONFIGURED');
}
