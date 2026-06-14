/** Shared Vercel Blob upload — uses auto-injected BLOB_READ_WRITE_TOKEN / OIDC */
import { put } from '@vercel/blob';

export async function putPublicBlob(pathname, data, contentType) {
  return put(pathname, data, {
    access: 'public',
    contentType,
  });
}
