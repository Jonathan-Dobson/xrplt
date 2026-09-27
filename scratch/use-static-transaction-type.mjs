#!/usr/bin/env node
/**
 * Phase 2: replace literal TransactionType strings in super() calls with
 * references to the class's own static `TRANSACTION_TYPE`.
 *
 *   super({ ...props, TransactionType: 'Payment' });
 * becomes:
 *   super({ ...props, TransactionType: PaymentTx.TRANSACTION_TYPE });
 *
 * Single source of truth — the static declared at the top of the class.
 *
 * Usage: node scratch/use-static-transaction-type.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = 'src/transactions';
const dryRun = process.argv.includes('--dry-run');

const files = readdirSync(SRC_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts')).sort();

let migrated = 0, errors = [];

for (const file of files) {
  const path = join(SRC_DIR, file);
  const src = readFileSync(path, 'utf8');

  // Find: super({ ...props, TransactionType: '<X>' });
  const re = /super\(\{\s*\.\.\.props,\s*TransactionType:\s*'(\w+)'\s*\}\)/;
  const m = src.match(re);
  if (!m) continue;
  const txType = m[1];

  // Extract the class name directly from the file's `export class FooTx extends ...`
  // declaration — more robust than filename-derivation (handles NFToken / XChain
  // acronym casing correctly).
  const classMatch = src.match(/export class (\w+) extends/);
  if (!classMatch) {
    errors.push(`${file}: could not find export class declaration`);
    continue;
  }
  const className = classMatch[1];

  const replacement = `super({ ...props, TransactionType: ${className}.TRANSACTION_TYPE })`;
  const newSrc = src.replace(re, replacement);

  if (newSrc === src) {
    errors.push(`${file}: replace produced no change`);
    continue;
  }

  if (dryRun) {
    console.log(`[dry-run] ${file}: ${txType} -> ${className}.TRANSACTION_TYPE`);
  } else {
    writeFileSync(path, newSrc, 'utf8');
    console.log(`${file}: ${txType} -> ${className}.TRANSACTION_TYPE`);
  }
  migrated++;
}

console.log(`\n${migrated} migrated, ${errors.length} errors`);
if (errors.length) {
  for (const e of errors) console.log(`  ! ${e}`);
  process.exit(1);
}