#!/usr/bin/env node
/**
 * Install simple git hooks from .githooks/ into .git/hooks/
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, '.githooks');
const destDir = path.join(rootDir, '.git', 'hooks');

if (!fs.existsSync(path.join(rootDir, '.git'))) {
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const hooks = ['pre-commit'];
hooks.forEach((name) => {
  const src = path.join(srcDir, name);
  const dest = path.join(destDir, name);
  if (!fs.existsSync(src)) return;
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);
  console.log(`Installed git hook: ${name}`);
});
