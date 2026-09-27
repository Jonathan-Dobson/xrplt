#!/usr/bin/env node
/**
 * Migration script: convert explicit-assignment leaf constructors to
 * manifest-driven constructors.
 *
 * For each src/transactions/*.ts file:
 *   - Extract leaf's `XxxTxFields` interface field names (skipping base-owned fields).
 *   - Add `static readonly TRANSACTION_TYPE = '<X>' as const` and
 *     `static override readonly ASSIGNABLE_FIELDS = [...] as const` to the class.
 *   - Replace the constructor body with a single super() call.
 *
 * Edge cases:
 *   - `declare readonly Flags?: ...` (not emitted) — the manifest walk still works
 *     because runtime assignment creates the property regardless of TS emit.
 *   - No leaf fields (interface has only TransactionType) — manifest is empty;
 *     the constructor still gets the static block.
 *
 * Usage: node scratch/migrate-leaves.mjs [--dry-run] [--only=<file>]
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = 'src/transactions';
const RESERVED = new Set([
  'TransactionType', 'Account', 'Fee', 'Sequence', 'AccountTxnID',
  'Flags', 'LastLedgerSequence', 'Memos', 'Signers', 'SourceTag',
  'SigningPubKey', 'TicketSequence', 'TxnSignature', 'NetworkID', 'Delegate',
]);

const dryRun = process.argv.includes('--dry-run');
const onlyArg = process.argv.find(a => a.startsWith('--only='));
const onlyFile = onlyArg ? onlyArg.slice('--only='.length) : null;

const files = readdirSync(SRC_DIR)
  .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
  .filter(f => !onlyFile || f === onlyFile)
  .sort();

let migrated = 0, skipped = 0, errors = [];

for (const file of files) {
  const path = join(SRC_DIR, file);
  let src = readFileSync(path, 'utf8');

  // 1. Find the constructor block — match from "  constructor(props: XxxTxFields) {" to its closing "  }".
  //    The body may be multiline; non-greedy + anchored closing brace at 2-space indent.
  const ctorRe = /^  constructor\(props: (\w+)\) \{([\s\S]*?)^  \}/m;
  const ctorMatch = src.match(ctorRe);
  if (!ctorMatch) {
    skipped++;
    continue;
  }
  const [, fieldsIfaceName] = ctorMatch;

  // 2. Find the matching interface to extract field names + the TransactionType literal.
  const ifaceRe = new RegExp(`export interface ${fieldsIfaceName}[^{]*\\{([^}]*)\\}`, 'm');
  const ifaceMatch = src.match(ifaceRe);
  if (!ifaceMatch) {
    errors.push(`${file}: could not find interface ${fieldsIfaceName}`);
    continue;
  }
  const ifaceBody = ifaceMatch[1];

  // 3. Extract leaf-owned field names from the interface.
  const fields = [];
  for (const m of ifaceBody.matchAll(/^\s*readonly\s+(\w+)[\s:?]/gm)) {
    const name = m[1];
    if (RESERVED.has(name)) continue;
    fields.push(name);
  }

  // 4. Extract the TransactionType literal from the interface.
  const ttMatch = ifaceBody.match(/readonly TransactionType:\s*'(\w+)'/);
  if (!ttMatch) {
    errors.push(`${file}: could not extract TransactionType literal`);
    continue;
  }
  const txType = ttMatch[1];

  // 5. Build the new constructor — super() call + applyManifest() call.
  //    applyManifest must run AFTER super() returns AND AFTER class field
  //    initializers (useDefineForClassFields=true under target:esnext) —
  //    otherwise the field initializers overwrite our assignments.
  const newCtor = `  constructor(props: ${fieldsIfaceName}) {\n    super({ ...props, TransactionType: '${txType}' });\n    this.applyManifest(props as unknown as Record<string, unknown>);\n  }`;

  // 6. Build the static block.
  const sortedFields = [...fields].sort();
  const manifestLiteral = sortedFields.length === 0
    ? `static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];`
    : `static override readonly ASSIGNABLE_FIELDS = [\n    ${sortedFields.map(f => `'${f}'`).join(', ')}\n  ] as const;`;
  const staticBlock = `  static readonly TRANSACTION_TYPE = '${txType}' as const;\n  ${manifestLiteral}`;

  // 7. Replace the constructor block with [static block + new constructor].
  //    The static block goes immediately before the constructor at the same indent.
  const oldCtor = ctorMatch[0];
  const replacement = `${staticBlock}\n\n${newCtor}`;
  if (!src.includes(oldCtor)) {
    errors.push(`${file}: matched constructor block not found verbatim in source`);
    continue;
  }
  const newSrc = src.replace(oldCtor, replacement);

  if (newSrc === src) {
    errors.push(`${file}: replace produced no change`);
    continue;
  }

  if (dryRun) {
    console.log(`[dry-run] would migrate ${file} (${sortedFields.length} fields)`);
  } else {
    writeFileSync(path, newSrc, 'utf8');
    const list = sortedFields.length ? sortedFields.join(', ') : '<none>';
    console.log(`migrated ${file.padEnd(40)} (${String(sortedFields.length).padStart(2)} fields: ${list})`);
  }
  migrated++;
}

console.log(`\n${migrated} migrated, ${skipped} skipped, ${errors.length} errors`);
if (errors.length) {
  for (const e of errors) console.log(`  ! ${e}`);
  process.exit(1);
}