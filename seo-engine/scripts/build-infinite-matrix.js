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

const stars = [
  {
    name: 'Zi Wei',
    title: 'The Emperor Star',
    entity: 'https://www.wikidata.org/wiki/Q8071018',
    desc: 'the supreme ruler of the cosmos representing absolute authority and leadership',
  },
  {
    name: 'Tian Ji',
    title: 'The Strategist Star',
    entity: 'https://www.wikidata.org/wiki/Q11091244',
    desc: 'the divine mind governing intellect, rapid adaptation, and strategic schematics',
  },
  {
    name: 'Tai Yang',
    title: 'The Sun Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-tai-yang-star-meaning.html',
    desc: 'the radiant star governing visibility, public service, generosity, and outward expression',
  },
  {
    name: 'Wu Qu',
    title: 'The Commander Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-wu-qu-star-meaning.html',
    desc: 'the finance-and-action star governing decisiveness, wealth accumulation, and pragmatic execution',
  },
  {
    name: 'Tian Tong',
    title: 'The Harmonizer Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-tian-tong-star-meaning.html',
    desc: 'the blessing star governing ease, emotional comfort, creativity, and conflict avoidance',
  },
  {
    name: 'Lian Zhen',
    title: 'The Integrity Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-lian-zhen-star-meaning.html',
    desc: 'the complex fire star governing passion, principle, politics, and emotional intensity',
  },
  {
    name: 'Tian Fu',
    title: 'The Steward Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-tian-fu-star-meaning.html',
    desc: 'the treasury star governing conservation, institutional stability, and accumulated resources',
  },
  {
    name: 'Tai Yin',
    title: 'The Moon Star',
    entity: 'https://www.wikidata.org/wiki/Q11092672',
    desc: 'the lunar archetype governing passive wealth, deep intuition, and emotional sanctuaries',
  },
  {
    name: 'Tan Lang',
    title: 'The Virtuoso Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-tan-lang-star-meaning.html',
    desc: 'the desire-and-charisma star governing talent, romance, and multidimensional ambition',
  },
  {
    name: 'Ju Men',
    title: 'The Voice Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-ju-men-star-meaning.html',
    desc: 'the eloquence star governing debate, law, persuasion, and verbal conflict patterns',
  },
  {
    name: 'Tian Xiang',
    title: 'The Mediator Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-tian-xiang-star-meaning.html',
    desc: 'the minister star governing diplomacy, fair process, and chief-of-staff energy',
  },
  {
    name: 'Tian Liang',
    title: 'The Protector Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-tian-liang-star-meaning.html',
    desc: 'the elder-wisdom star governing protection, healing, and disaster relief instincts',
  },
  {
    name: 'Qi Sha',
    title: 'The Warrior Star',
    entity: 'https://www.wikidata.org/wiki/Q11155998',
    desc: 'the vanguard star representing raw execution, revolutionary shifts, and high-risk breakthroughs',
  },
  {
    name: 'Po Jun',
    title: 'The Destroyer Star',
    entity: 'https://metaphysicflow.com/blog/zi-wei-dou-shu-po-jun-star-meaning.html',
    desc: 'the innovator star governing radical transformation, demolition, and reconstruction cycles',
  },
];

const palaces = [
  { name: 'Ming Gong', eng: 'Life Palace', siloKey: 'MingGong', domain: 'core persona, baseline destiny, and psychological blueprint' },
  { name: 'Parents Palace', eng: 'Parents Palace', siloKey: 'ParentsPalace', domain: 'authority figures, genetics, and early upbringing patterns' },
  { name: 'Spouse Palace', eng: 'Spouse Palace', siloKey: 'SpousePalace', domain: 'romantic attraction matrix, marriage stability, and partner archetypes' },
  { name: 'Children Palace', eng: 'Children Palace', siloKey: 'ChildrenPalace', domain: 'offspring, creativity, legacy, and generational output' },
  { name: 'Wealth Palace', eng: 'Wealth Palace', siloKey: 'WealthPalace', domain: 'financial velocity, cash flow mechanics, and lifetime capital generation' },
  { name: 'Health Palace', eng: 'Health Palace', siloKey: 'HealthPalace', domain: 'constitution, vitality, vulnerability, and recovery cycles' },
  { name: 'Travel Palace', eng: 'Travel Palace', siloKey: 'TravelPalace', domain: 'public image, mobility, and life away from home' },
  { name: 'Friends Palace', eng: 'Friends Palace', siloKey: 'FriendsPalace', domain: 'networks, allies, subordinates, and social leverage' },
  { name: 'Career Palace', eng: 'Career Palace', siloKey: 'CareerPalace', domain: 'vocational alignment, executive leverage, and workspace dynamics' },
  { name: 'Property Palace', eng: 'Property Palace', siloKey: 'PropertyPalace', domain: 'real estate, home environment, and inherited assets' },
  { name: 'Fu De Palace', eng: 'Happiness Palace', siloKey: 'FuDePalace', domain: 'inner joy, subconscious patterns, and spiritual depth' },
  { name: 'Siblings Palace', eng: 'Siblings Palace', siloKey: 'SiblingsPalace', domain: 'peers, rivalry, cooperation, and close companions' },
];

function slugPart(text) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

const generatedPages = [];

stars.forEach((star) => {
  palaces.forEach((palace) => {
    const slug = `${slugPart(star.name)}-in-${slugPart(palace.name)}`;
    const keyword = `${star.name} in ${palace.eng}`;

    generatedPages.push({
      slug,
      category: palace.siloKey,
      palace_label: palace.eng,
      star_name: star.name,
      star_title: star.title,
      keyword,
      title: `${star.name} (${star.title}) in ${palace.eng} — Zi Wei Dou Shu Meanings`,
      description: `What happens when ${star.name} lands in your ${palace.eng}? Discover the metaphysical impact on your ${palace.domain}.`,
      summary: `The alignment of ${star.name} inside the ${palace.eng} dictates a specific cosmic resonance altering your ${palace.domain}.`,
      definition: `${star.name} in ${palace.eng} is a high-resolution astrological configuration where ${star.desc}, directly structuring the individual's ${palace.domain}.`,
      wikidata_star: star.entity,
      lsi_keywords: [star.name, palace.eng, 'Purple Star Astrology', 'Palace Star Alignment', 'Eastern Metaphysics Readings'],
    });
  });
});

const fullMatrix = { site: baseConfig.site, pages: generatedPages };
const outPath = path.join(__dirname, '../data/infinite-matrix.json');
fs.writeFileSync(outPath, JSON.stringify(fullMatrix, null, 2));
console.log(`🚀 Quantum multiplication complete: ${generatedPages.length} nodes → data/infinite-matrix.json`);
