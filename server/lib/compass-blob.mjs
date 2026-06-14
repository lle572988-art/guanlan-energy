/** Shared Vercel Blob upload — prefers public URLs for external fetchers (Fal) */
import { put } from '@vercel/blob';

export async function putPublicBlob(pathname, data, contentType) {
  try {
    return await put(pathname, data, { access: 'public', contentType });
  } catch (publicErr) {
    console.warn('[compass-blob] public put failed:', publicErr.message);
    return await put(pathname, data, { access: 'private', contentType });
  }
}
