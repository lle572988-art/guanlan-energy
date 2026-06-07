/**
 * Email Service Provider configuration from environment variables.
 *
 * Set ESP_PROVIDER to one of: mailchimp | convertkit | loops | none
 *
 * Mailchimp:  MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_SERVER_PREFIX (e.g. us21)
 * ConvertKit: CONVERTKIT_API_KEY, CONVERTKIT_FORM_ID
 * Loops:      LOOPS_API_KEY
 */

const PROVIDERS = ['mailchimp', 'convertkit', 'loops', 'none'];

export function getEspConfig() {
  const provider = (process.env.ESP_PROVIDER || 'none').toLowerCase();
  const activeProvider = PROVIDERS.includes(provider) ? provider : 'none';

  return {
    provider: activeProvider,
    enabled: activeProvider !== 'none',
    mailchimp: {
      apiKey: process.env.MAILCHIMP_API_KEY || '',
      listId: process.env.MAILCHIMP_LIST_ID || '',
      serverPrefix: process.env.MAILCHIMP_SERVER_PREFIX || '',
    },
    convertkit: {
      apiKey: process.env.CONVERTKIT_API_KEY || '',
      formId: process.env.CONVERTKIT_FORM_ID || '',
    },
    loops: {
      apiKey: process.env.LOOPS_API_KEY || '',
    },
  };
}

export function validateEspConfig(config) {
  if (!config.enabled) {
    return { ok: false, reason: 'ESP_PROVIDER is not set or is "none"' };
  }
  if (config.provider === 'mailchimp') {
    const { apiKey, listId, serverPrefix } = config.mailchimp;
    if (!apiKey || !listId || !serverPrefix) {
      return { ok: false, reason: 'Missing MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, or MAILCHIMP_SERVER_PREFIX' };
    }
  }
  if (config.provider === 'convertkit') {
    const { apiKey, formId } = config.convertkit;
    if (!apiKey || !formId) {
      return { ok: false, reason: 'Missing CONVERTKIT_API_KEY or CONVERTKIT_FORM_ID' };
    }
  }
  if (config.provider === 'loops') {
    if (!config.loops.apiKey) {
      return { ok: false, reason: 'Missing LOOPS_API_KEY' };
    }
  }
  return { ok: true };
}
