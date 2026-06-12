function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
}

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta\\s+(?:name|property)=["']${name}["']\\s+content=["']([^"']*)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return m[1].trim();
  const re2 = new RegExp(
    `<meta\\s+content=["']([^"']*)["']\\s+(?:name|property)=["']${name}["']`,
    'i'
  );
  const m2 = html.match(re2);
  return m2 ? m2[1].trim() : '';
}

function extractHeadings(html, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) out.push(text);
  }
  return out;
}

function slugFromUrl(url) {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').filter(Boolean).pop() || '';
    return last.replace(/\.html?$/, '');
  } catch {
    return '';
  }
}

function extractPageIntel(url, html) {
  const title = extractTitle(html);
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description');
  const h1s = extractHeadings(html, 'h1');
  const h2s = extractHeadings(html, 'h2').slice(0, 8);
  const slug = slugFromUrl(url);

  const phrases = [
    title,
    description,
    ...h1s,
    ...h2s,
    slug.replace(/-/g, ' '),
  ].filter(Boolean);

  return {
    url,
    slug,
    title,
    description,
    h1: h1s[0] || '',
    h2_sample: h2s,
    phrases,
  };
}

module.exports = { extractPageIntel, extractTitle, extractMeta };
