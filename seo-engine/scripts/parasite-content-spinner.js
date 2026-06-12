const fs = require('fs');
const path = require('path');

const spinnerMap = {
  discover: ['unveil', 'decode', 'expose the hidden meaning of', 'deep dive into'],
  astrological: ['metaphysical', 'cosmic blueprint', 'natal chart', 'Zi Wei Dou Shu'],
  'notorious for': ['highly predicted to trigger', 'destined to manifest as', 'responsible for changing'],
  fundamental: ['radical', 'unavoidable', 'pivotal', 'severe'],
  During: ['Across', 'Throughout', 'Within'],
  forces: ['compels', 'directs', 'channels'],
};

function spinText(text, seed = 0) {
  let spun = text;
  let i = seed;
  Object.keys(spinnerMap).forEach((key) => {
    const replacements = spinnerMap[key];
    const regex = new RegExp(key, 'g');
    spun = spun.replace(regex, () => {
      const pick = replacements[i % replacements.length];
      i += 1;
      return pick;
    });
  });
  return spun.replace(/\*\*/g, '');
}

const matrixPath = path.join(__dirname, '../data/transit-matrix.json');
if (!fs.existsSync(matrixPath)) {
  console.error('❌ Missing data/transit-matrix.json — run npm run seo:transit first');
  process.exit(1);
}

const transitMatrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const parasiteOutputs = [];
const githubRepo = 'https://github.com/lle572988-art/zi-wei-dou-shu-calculator';

transitMatrix.pages
  .filter((p) => p.year === 2026)
  .forEach((page, index) => {
    const platformName = index % 2 === 0 ? 'Medium' : 'Substack';
    const spunContent = spinText(page.content_block, index);
    const targetLink =
      index % 2 === 0
        ? `${transitMatrix.site.domain}/pages/${page.slug}.html`
        : githubRepo;

    const articleMarkdown = `# [${platformName} Vector] ${page.title}
*Target Keyword: ${page.keyword}*

${spunContent}

## Critical Metaphysical FAQ
**Q: ${page.faq_question}**
A: ${page.faq_answer}

## Annual Timing Lens
Readers tracking the **2026 Bing Wu (Horse)** stem should cross-check this ${page.transform_type} signal against their natal ${page.palace_label} before making irreversible decisions in ${page.year}.

---
*For real-time mathematical calculations of your natal palace under the 2026 Bing Wu transit, interface directly with the compiler: [Calculate Your 2026 Chart Vector Here](${targetLink}).*
`;

    parasiteOutputs.push({
      target_platform: platformName,
      keyword: page.keyword,
      markdown_payload: articleMarkdown,
    });
  });

const outDir = path.join(__dirname, '../output');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'parasite-ready-matrix.md');
fs.writeFileSync(
  outPath,
  parasiteOutputs.map((p) => p.markdown_payload).join('\n\n========== NEXT ARTIFACT ==========\n\n')
);

console.log(`🪱 寄生虫混淆稿件就绪！${parasiteOutputs.length} 篇 2026 截流稿 → output/parasite-ready-matrix.md`);
