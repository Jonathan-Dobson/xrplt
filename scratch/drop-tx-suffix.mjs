#!/usr/bin/env node
/**
 * Phase 3a: drop the `Tx` suffix from all 71 leaf class names.
 *
 * For each leaf:
 *   - `class XxxTx extends ...` -> `class Xxx extends ...`
 *   - all references to XxxTx inside that file become Xxx
 *
 * Then:
 *   - src/registry.ts: rename all XxxTx -> Xxx for the 71 known classes
 *   - src/index.ts: rename imports + exports + add deprecation aliases
 *
 * The deprecation aliases are appended to src/index.ts:
 *   export { Payment as PaymentTx }; // @deprecated use `Payment`
 *
 * Usage: node scratch/drop-tx-suffix.mjs [--dry-run]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const dryRun = process.argv.includes('--dry-run');

// Extract the 71 class names from registry.ts imports. They look like
//   import { PaymentTx } from './transactions/payment.js';
// Capture the full class name (with Tx) — that's the canonical "old name"
// we want to replace.
const registrySrc = readFileSync('src/registry.ts', 'utf8');
const classNames = [];
for (const m of registrySrc.matchAll(/^import \{ (\w+Tx) \} from '\.\/transactions\//gm)) {
  classNames.push(m[1]);
}
classNames.sort();
console.log(`Found ${classNames.length} leaf class names in registry.ts`);

// Build the importPath map BEFORE any renames, from src/index.ts in its
// current (pre-rename) state.
const preIndexSrc = readFileSync('src/index.ts', 'utf8');
const importMap = {};
for (const m of preIndexSrc.matchAll(/^export \{ (\w+Tx) \} from '\.\/transactions\/([^']+)';$/gm)) {
  if (m[1].endsWith('TxFields') || m[1].endsWith('Fields')) continue;
  importMap[m[1]] = m[2];
}
console.log(`Mapped ${Object.keys(importMap).length} class -> file paths`);

const sed = (file, map) => {
  const src = readFileSync(file, 'utf8');
  let newSrc = src;
  for (const [oldName, newName] of Object.entries(map)) {
    const re = new RegExp(`\\b${oldName}\\b`, 'g');
    newSrc = newSrc.replace(re, newName);
  }
  if (newSrc === src) return false;
  if (!dryRun) writeFileSync(file, newSrc, 'utf8');
  return true;
};

const buildMap = () => {
  const m = {};
  for (const cn of classNames) m[cn] = cn.slice(0, -2);
  return m;
};

const map = buildMap();

// 1. Leaf files
const { readdirSync } = await import('node:fs');
const { join } = await import('node:path');
const leaves = readdirSync('src/transactions').filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));

let touched = 0;
for (const file of leaves) {
  const path = join('src/transactions', file);
  if (sed(path, map)) {
    console.log(`${dryRun ? '[dry-run] ' : ''}leaf ${file}`);
    touched++;
  }
}

// 2. registry.ts
if (sed('src/registry.ts', map)) {
  console.log(`${dryRun ? '[dry-run] ' : ''}src/registry.ts`);
  touched++;
}

// 3. index.ts
if (sed('src/index.ts', map)) {
  console.log(`${dryRun ? '[dry-run] ' : ''}src/index.ts`);
  touched++;
}

// 4. tests/*.ts
const tests = readdirSync('tests').filter(f => f.endsWith('.ts'));
for (const file of tests) {
  const path = join('tests', file);
  if (sed(path, map)) {
    console.log(`${dryRun ? '[dry-run] ' : ''}tests/${file}`);
    touched++;
  }
}

console.log(`\n${touched} files touched`);

// Now append deprecation aliases to the post-rename src/index.ts.
const indexSrc = readFileSync('src/index.ts', 'utf8');
const aliases = '\n\n// ─── Deprecated *Tx aliases (kept for v0.4.x; remove in v0.5.0) ─────────\n'
  + classNames.map(cn => {
    const stem = cn.slice(0, -2);
    const path = importMap[cn];
    if (!path) {
      console.log(`[warn] no import path found for ${cn}; skipping alias`);
      return null;
    }
    return `export { ${stem} as ${cn} } from './transactions/${path}'; // @deprecated use \`${stem}\``;
  }).filter(Boolean).join('\n')
  + '\n';

if (!dryRun) {
  writeFileSync('src/index.ts', indexSrc + aliases, 'utf8');
  const appended = aliases.split('\n').filter(l => l.startsWith('export {')).length;
  console.log(`Appended ${appended} deprecation aliases to src/index.ts`);
} else {
  console.log(`[dry-run] would append deprecation aliases to src/index.ts`);
}

console.log('done.');