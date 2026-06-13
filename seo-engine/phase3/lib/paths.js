const fs = require('fs');
const path = require('path');

const phase3Dir = path.join(__dirname, '..');
const seoEngineDir = path.join(phase3Dir, '..');
const repoRoot = path.join(seoEngineDir, '..');

function ensureOutputDir(subdir) {
  const out = subdir
    ? path.join(phase3Dir, 'output', subdir)
    : path.join(phase3Dir, 'output');
  fs.mkdirSync(out, { recursive: true });
  return out;
}

module.exports = {
  phase3Dir,
  seoEngineDir,
  repoRoot,
  ensureOutputDir,
};
