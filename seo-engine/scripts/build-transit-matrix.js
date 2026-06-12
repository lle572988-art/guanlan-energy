const fs = require('fs');
const path = require('path');

const baseConfig = {
  site: {
    domain: 'https://metaphysicflow.com',
    cta_page: '/free-chart.html',
    cta_text: 'Get Your Free Chart Reading',
    brand_name: 'Guanlan Energy',
    author: 'Guanlan Energy',
    faq_page: '/faq.html',
    logo: '/images/og-chart.jpg',
  },
};

// 2026–2030 annual heavenly stems and Si Hua (Four Transformations)
const transits = [
  { year: 2026, stem: 'Bing', name: 'Bing Wu (Horse)', lu: 'Tian Tong', quan: 'Tian Ji', ke: 'Wen Chang', ji: 'Lian Zhen' },
  { year: 2027, stem: 'Ding', name: 'Ding Wei (Goat)', lu: 'Tai Yin', quan: 'Tian Tong', ke: 'Tian Ji', ji: 'Ju Men' },
  { year: 2028, stem: 'Wu', name: 'Wu Shen (Monkey)', lu: 'Tan Lang', quan: 'Tai Yin', ke: 'You Bi', ji: 'Tian Ji' },
  { year: 2029, stem: 'Ji', name: 'Ji You (Rooster)', lu: 'Wu Qu', quan: 'Tan Lang', ke: 'Tian Liang', ji: 'Wen Qu' },
  { year: 2030, stem: 'Geng', name: 'Geng Xu (Dog)', lu: 'Tai Yang', quan: 'Wu Qu', ke: 'Tai Yin', ji: 'Tian Tong' },
];

const palaces = [
  { name: 'Ming Gong', label: 'Life Palace', aspect: 'personal alignment, identity shifts, and baseline destiny tone' },
  { name: 'Parents Palace', label: 'Parents Palace', aspect: 'authority figures, lineage patterns, and inherited obligations' },
  { name: 'Spouse Palace', label: 'Spouse Palace', aspect: 'relationship dynamics, marital resonance, and romantic contracts' },
  { name: 'Children Palace', label: 'Children Palace', aspect: 'offspring themes, creative output, and generational legacy' },
  { name: 'Wealth Palace', label: 'Wealth Palace', aspect: 'financial velocity, liquid cash fluctuations, and asset risk' },
  { name: 'Health Palace', label: 'Health Palace', aspect: 'vitality cycles, stress load, and recovery bandwidth' },
  { name: 'Travel Palace', label: 'Travel Palace', aspect: 'public visibility, mobility, and reputation away from home' },
  { name: 'Friends Palace', label: 'Friends Palace', aspect: 'network leverage, allies, subordinates, and social capital' },
  { name: 'Career Palace', label: 'Career Palace', aspect: 'professional authority, workplace power plays, and vocational pivots' },
  { name: 'Property Palace', label: 'Property Palace', aspect: 'real estate timing, home environment, and fixed-asset decisions' },
  { name: 'Fu De Palace', label: 'Happiness Palace', aspect: 'inner peace, subconscious patterns, and spiritual resilience' },
  { name: 'Siblings Palace', label: 'Siblings Palace', aspect: 'peer rivalry, cooperative alliances, and close companions' },
];

function slugPart(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

const transitPages = [];

transits.forEach((t) => {
  const transformTypes = [
    { type: 'Hua Lu', key: 'hua-lu', star: t.lu, effect: 'catalyzing sudden abundance, effortless flow, and unexpected expansion' },
    { type: 'Hua Quan', key: 'hua-quan', star: t.quan, effect: 'triggering intense power battles, executive control, and structural dominance' },
    { type: 'Hua Ke', key: 'hua-ke', star: t.ke, effect: 'bringing academic validation, public recognition, and protective noble guidance' },
    { type: 'Hua Ji', key: 'hua-ji', star: t.ji, effect: 'manifesting structural bottlenecks, karmic debts, and emotional turbulence' },
  ];

  transformTypes.forEach((transform) => {
    palaces.forEach((palace) => {
      const leafSlug = `${t.year}-${slugPart(transform.star)}-${transform.key}-in-${slugPart(palace.name)}`;
      const slug = `transit/${leafSlug}`;
      const keyword = `${t.year} ${transform.star} ${transform.type} in ${palace.label}`;

      transitPages.push({
        slug,
        leaf_slug: leafSlug,
        category: `Transit${t.year}`,
        year: t.year,
        stem: t.stem,
        year_name: t.name,
        transform_type: transform.type,
        transform_key: transform.key,
        star_name: transform.star,
        palace_name: palace.name,
        palace_label: palace.label,
        keyword,
        title: `${keyword} — ${t.year} Purple Star Astrology Transits`,
        description: `How will ${transform.star} ${transform.type} affect your ${palace.label} in the year of ${t.name}? Deep dive into the ${t.stem} stem energetic blueprint.`,
        summary: `The ${t.year} ${t.name} cycle activates ${transform.star} as ${transform.type}, reshaping ${palace.aspect} when this mutation overlays your ${palace.label}.`,
        content_block: `During the cosmic cycle of ${t.year} (${t.name}), the ${t.stem} heavenly stem takes planetary command. This forces **${transform.star}** to undergo the **${transform.type}** mutation, directly injecting its energy into your vertical **${palace.label}**. Astrologically, this specific transit is notorious for ${transform.effect}, fundamentally reshaping your ${palace.aspect} for the entire 12-month window.`,
        faq_question: `Is ${t.year} ${transform.star} ${transform.type} dangerous for ${palace.label}?`,
        faq_answer: `It depends on your natal chart density. If it is a Hua Lu configuration, it triggers rapid expansion in ${palace.aspect}. If it is a Hua Ji configuration, expect karmic reality checks regarding ${palace.aspect}.`,
        lsi_keywords: [
          transform.star,
          transform.type,
          palace.label,
          `${t.year} Zi Wei forecast`,
          'Four Transformations Si Hua',
          'Purple Star annual transit',
        ],
      });
    });
  });
});

const outputData = { site: baseConfig.site, pages: transitPages };
const outPath = path.join(__dirname, '../data/transit-matrix.json');
fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2));
console.log(`⚡ 時空矩陣爆破成功！已生成 ${transitPages.length} 个流年四化高转页 → data/transit-matrix.json`);
