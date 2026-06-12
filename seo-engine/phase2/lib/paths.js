const fs = require('fs');
const path = require('path');

const phase2Dir = path.join(__dirname, '..');
const seoEngineDir = path.join(phase2Dir, '..');
const repoRoot = path.join(seoEngineDir, '..');

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadSeoConfig() {
  const configPath = path.join(repoRoot, 'config/seo_config.json');
  return readJsonIfExists(configPath) || {};
}

function ensureOutputDir(subdir) {
  const out = subdir
    ? path.join(phase2Dir, 'output', subdir)
    : path.join(phase2Dir, 'output');
  fs.mkdirSync(out, { recursive: true });
  return out;
}

module.exports = {
  phase2Dir,
  seoEngineDir,
  repoRoot,
  readJsonIfExists,
  loadSeoConfig,
  ensureOutputDir,
};
