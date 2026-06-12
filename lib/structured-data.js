/**
 * Reusable JSON-LD builders for MetaphysicFlow static HTML.
 * Portable from seo-engine/scripts/generate-pages.js patterns.
 */

const DEFAULT_SITE = {
  domain: 'https://metaphysicflow.com',
  name: 'Guanlan Energy',
  brand_name: 'Guanlan Energy',
  author: 'Guanlan Energy',
  logo: '/images/og-chart.jpg',
  cta_page: '/free-chart.html',
  faq_page: '/faq.html',
};

function absUrl(site, path) {
  if (!path) return site.domain;
  if (path.startsWith('http')) return path;
  return `${site.domain}${path.startsWith('/') ? path : `/${path}`}`;
}

function getOrganizationSchema(site = DEFAULT_SITE) {
  return {
    '@type': 'Organization',
    '@id': `${site.domain}/#organization`,
    name: site.name || site.brand_name,
    url: site.domain,
    logo: absUrl(site, site.logo),
  };
}

function getWebsiteSchema(site = DEFAULT_SITE) {
  return {
    '@type': 'WebSite',
    '@id': `${site.domain}/#website`,
    name: site.name || site.brand_name,
    url: site.domain,
    publisher: { '@id': `${site.domain}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${site.domain}/faq.html?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function getBreadcrumbSchema(items, site = DEFAULT_SITE) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : absUrl(site, item.url),
    })),
  };
}

function getFAQSchema(questions) {
  return {
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    })),
  };
}

function getStarSchema(page, site = DEFAULT_SITE) {
  const pageUrl = absUrl(site, `/pages/${page.slug}.html`);
  const desc = page.description || page.meta_description || '';
  const faqQ = page.faq_question || `What is the critical impact of ${page.keyword}?`;

  const article = {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: page.title,
    description: desc,
    url: pageUrl,
    datePublished: page.datePublished || new Date().toISOString().split('T')[0],
    dateModified: page.dateModified || new Date().toISOString().split('T')[0],
    author: { '@type': 'Organization', name: site.author || site.brand_name },
    publisher: { '@type': 'Organization', name: site.name || site.brand_name, url: site.domain },
  };

  if (page.wikidata_star) {
    article.about = [{ '@type': 'Thing', name: page.keyword, sameAs: page.wikidata_star }];
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      getFAQSchema([{ question: faqQ, answer: page.definition }]),
      getBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: page.keyword || page.title, url: pageUrl },
        ],
        site
      ),
    ],
  };
}

function getCalculatorSchema(site = DEFAULT_SITE) {
  const calcUrl = absUrl(site, site.cta_page || '/free-chart.html');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      getOrganizationSchema(site),
      {
        '@type': 'WebApplication',
        '@id': `${calcUrl}#calculator`,
        name: 'Zi Wei Dou Shu Calculator — Purple Star Astrology',
        url: calcUrl,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description:
          'Free English Purple Star Astrology birth chart calculator. Plot 12 palaces and 14 major stars instantly.',
      },
    ],
  };
}

function getTrendActionSchema(page, site = DEFAULT_SITE) {
  const pageUrl = absUrl(site, `/pages/${page.slug}.html`);
  const year = page.year || new Date().getFullYear();
  return {
    '@type': 'TrendAction',
    '@id': `${pageUrl}#trend`,
    name: page.keyword || page.title,
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
    target: {
      '@type': 'EntryPoint',
      urlTemplate: pageUrl,
      actionPlatform: [
        'http://schema.org/DesktopWebPlatform',
        'http://schema.org/MobileWebPlatform',
      ],
    },
    result: {
      '@type': 'Thing',
      name: 'Chinese Astrology Annual Prediction',
    },
  };
}

function getHoroscopeSchema(page, site = DEFAULT_SITE) {
  const pageUrl = absUrl(site, `/pages/${page.slug}.html`);
  const desc = page.description || '';
  const faqQ = page.faq_question || `What is ${page.keyword}?`;
  const faqA = page.faq_answer || page.summary || desc;
  const animal = page.zodiac_animal || 'Annual';

  const article = {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: page.title,
    description: desc,
    url: pageUrl,
    datePublished: page.datePublished || `${page.year}-01-01`,
    dateModified: page.dateModified || new Date().toISOString().split('T')[0],
    author: { '@type': 'Organization', name: site.author || site.brand_name },
    publisher: { '@type': 'Organization', name: site.name || site.brand_name, url: site.domain },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      getTrendActionSchema(page, site),
      getFAQSchema([{ question: faqQ, answer: faqA }]),
      getBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: `${page.year} Horoscope`, url: `/pages/horoscope/${page.year}-annual-forecast.html` },
          { name: animal === 'All Signs' ? `${page.year} Hub` : `${animal} ${page.year}`, url: pageUrl },
        ],
        site
      ),
    ],
  };
}

function getTransitSchema(page, site = DEFAULT_SITE) {
  const pageUrl = absUrl(site, `/pages/${page.slug}.html`);
  const desc = page.description || '';
  const faqQ = page.faq_question || `What is ${page.keyword}?`;
  const faqA = page.faq_answer || page.summary || desc;

  const article = {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: page.title,
    description: desc,
    url: pageUrl,
    datePublished: page.datePublished || `${page.year}-01-01`,
    dateModified: page.dateModified || new Date().toISOString().split('T')[0],
    author: { '@type': 'Organization', name: site.author || site.brand_name },
    publisher: { '@type': 'Organization', name: site.name || site.brand_name, url: site.domain },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      article,
      getTrendActionSchema(page, site),
      getFAQSchema([{ question: faqQ, answer: faqA }]),
      getBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: `${page.year} Transits`, url: '/pages/transit/' },
          { name: page.keyword || page.title, url: pageUrl },
        ],
        site
      ),
    ],
  };
}

function getPageGraphSchema({ site = DEFAULT_SITE, page, extra = [] }) {
  const graph = [getOrganizationSchema(site), getWebsiteSchema(site), ...extra];
  if (page) graph.push(...getStarSchema(page, site)['@graph']);
  return { '@context': 'https://schema.org', '@graph': graph };
}

function toScriptTag(schema) {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

module.exports = {
  DEFAULT_SITE,
  absUrl,
  getOrganizationSchema,
  getWebsiteSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  getStarSchema,
  getHoroscopeSchema,
  getTransitSchema,
  getTrendActionSchema,
  getCalculatorSchema,
  getPageGraphSchema,
  toScriptTag,
};
