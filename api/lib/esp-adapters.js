/**
 * ESP adapters — push enriched leads to Mailchimp, ConvertKit, or Loops.so.
 */

import crypto from 'crypto';
import { getEspConfig, validateEspConfig } from './esp-config.js';

function mergeFields(enriched) {
  return {
    DOB: enriched.dob || '',
    BIRTHHR: String(enriched.hour ?? ''),
    COUNTRY: enriched.country || '',
    MSTAR: enriched.mainStar || '',
    MSTAREN: enriched.mainStarEn || '',
    SOURCE: enriched.source || '',
  };
}

async function syncMailchimp(enriched, config) {
  const { apiKey, listId, serverPrefix } = config.mailchimp;
  const subscriberHash = crypto.createHash('md5').update(enriched.email).digest('hex');
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;

  const payload = {
    email_address: enriched.email,
    status_if_new: 'subscribed',
    status: 'subscribed',
    merge_fields: mergeFields(enriched),
  };

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.title || `Mailchimp HTTP ${res.status}`);
  }

  if (enriched.tags?.length) {
    const tagsUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}/tags`;
    await fetch(tagsUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: enriched.tags.map((name) => ({ name, status: 'active' })),
      }),
    }).catch((err) => console.error('[Mailchimp tags]', err.message));
  }

  return { provider: 'mailchimp', synced: true, id: data.id || enriched.email };
}

async function syncConvertKit(enriched, config) {
  const { apiKey, formId } = config.convertkit;
  const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      email: enriched.email,
      first_name: enriched.name || '',
      fields: {
        dob: enriched.dob || '',
        birth_hour: String(enriched.hour ?? ''),
        country: enriched.country || '',
        main_star: enriched.mainStar || '',
        main_star_en: enriched.mainStarEn || '',
        source: enriched.source || '',
        palace_tags: (enriched.tags || []).join(', '),
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `ConvertKit HTTP ${res.status}`);
  }

  return { provider: 'convertkit', synced: true, subscription: data.subscription || null };
}

async function syncLoops(enriched, config) {
  const { apiKey } = config.loops;
  const res = await fetch('https://app.loops.so/api/v1/contacts/create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: enriched.email,
      firstName: enriched.name || undefined,
      source: enriched.source || 'free-chart-gate',
      subscribed: true,
      userGroup: (enriched.tags || []).slice(0, 3).join(', ') || 'free-chart',
      mailingLists: {},
      customFields: {
        dob: enriched.dob || '',
        birthHour: String(enriched.hour ?? ''),
        country: enriched.country || '',
        mainStar: enriched.mainStar || '',
        mainStarEn: enriched.mainStarEn || '',
        palaceTags: (enriched.tags || []).join(', '),
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Loops HTTP ${res.status}`);
  }

  return { provider: 'loops', synced: true, id: data.id || enriched.email };
}

export async function syncLeadToEsp(enriched) {
  const config = getEspConfig();
  const validation = validateEspConfig(config);

  if (!validation.ok) {
    return {
      synced: false,
      provider: config.provider,
      reason: validation.reason,
      mock: true,
    };
  }

  try {
    switch (config.provider) {
      case 'mailchimp':
        return await syncMailchimp(enriched, config);
      case 'convertkit':
        return await syncConvertKit(enriched, config);
      case 'loops':
        return await syncLoops(enriched, config);
      default:
        return { synced: false, provider: 'none', reason: 'No ESP configured' };
    }
  } catch (err) {
    console.error('[ESP sync]', config.provider, err.message);
    return {
      synced: false,
      provider: config.provider,
      error: err.message,
    };
  }
}
