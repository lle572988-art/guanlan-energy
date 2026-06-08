#!/usr/bin/env node
/** Validates $19 three-palace-snapshot Gumroad + Stripe wiring */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const checkoutHtml = fs.readFileSync(path.join(root, 'checkout.html'), 'utf8');
const checkoutApi = fs.readFileSync(path.join(root, 'api/checkout.mjs'), 'utf8');
const gumroadJs = fs.readFileSync(path.join(root, 'js/gumroad-products.js'), 'utf8');

const catalogMatch = checkoutHtml.match(/'three-palace-snapshot':\s*\{([\s\S]*?)\n\s*\}/);
if (!catalogMatch) {
  console.error('FAIL: three-palace-snapshot missing from checkout.html CATALOG');
  process.exit(1);
}
const block = catalogMatch[0];
const checks = [
  [/price:\s*'\$19\.00'/, 'checkout.html price $19.00'],
  [/stripe:\s*'three-palace-snapshot'/, 'checkout.html stripe fallback key'],
  [/'three-palace-snapshot':\s*'https:\/\/lleonard88\.gumroad\.com\/l\/lfoxf/, 'gumroad-products.js $19 URL'],
  [/'three-palace-snapshot':\s*\{[\s\S]*unit_amount:\s*1900/, 'api/checkout.mjs unit_amount 1900'],
  [/name:\s*'Three-Palace Snapshot'/, 'api/checkout.mjs product name'],
  [/Continue to Gumroad Checkout/, 'checkout.html Gumroad-first button copy'],
];

let failed = 0;
for (const [re, label] of checks) {
  const ok = re.test(block) || re.test(checkoutApi) || re.test(gumroadJs) || re.test(checkoutHtml);
  console.log((ok ? 'OK' : 'FAIL') + ': ' + label);
  if (!ok) failed++;
}

if (failed) process.exit(1);
console.log('All three-palace-snapshot checkout checks passed.');
