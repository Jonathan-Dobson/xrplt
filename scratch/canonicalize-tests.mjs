#!/usr/bin/env node
/**
 * Phase 3b: update tests and docs to use the canonical (non-Tx) names.
 *
 * For each XxxTx in the test/doc files, replace with Xxx (the new name).
 * The deprecated *Tx aliases still work in src/index.ts, but the canonical
 * form going forward is the suffix-free name.
 *
 * Source files: tests/*.test.ts, tests/fixtures.ts, README.md, API_DOCUMENTATION.md.
 *
 * Usage: node scratch/canonicalize-tests.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

// Read class names from registry.ts (post-rename = no Tx suffix now).
// Map: newName (no Tx) -> oldName (with Tx).
const registrySrc = readFileSync('src/registry.ts', 'utf8');
const newToOld = {};
for (const m of registrySrc.matchAll(/^import \{ (\w+) \} from '\.\/transactions\//gm)) {
  const stem = m[1];                  // 'Payment'
  newToOld[stem] = stem + 'Tx';       // 'Payment' -> 'PaymentTx'
}
console.log(`Loaded ${Object.keys(newToOld).length} class names from registry.ts`);

const dryRun = process.argv.includes('--dry-run');

const targets = [
  ...readdirSync('tests').filter(f => f.endsWith('.ts')).map(f => `tests/${f}`),
  'README.md',
  'API_DOCUMENTATION.md',
];

let touched = 0;
for (const file of targets) {
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { continue; }
  let newSrc = src;
  let replacements = 0;

  // Sort by descending length so longer names match first (avoids prefix
  // collisions: NFTokenBurnTx contains NFTokenBurn, etc.).
  const sortedNames = Object.keys(newToOld).sort((a, b) => b.length - a.length);

  for (const stem of sortedNames) {
    const old = newToOld[stem];
    const re = new RegExp(`\\b${old}\\b`, 'g');
    const matches = newSrc.match(re);
    if (matches) {
      replacements += matches.length;
      newSrc = newSrc.replace(re, stem);
    }
  }

  if (newSrc === src) continue;
  if (!dryRun) writeFileSync(file, newSrc, 'utf8');
  console.log(`${dryRun ? '[dry-run] ' : ''}${file}: ${replacements} replacements`);
  touched++;
}

console.log(`\n${touched} files touched`);
console.log('done.');