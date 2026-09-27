# Changelog

All notable changes to `xrplt` are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-09-27

The constructor-pattern refactor. The 71 transaction classes no longer
hand-write the `this.X = props.X as any` block in every constructor —
they declare a static `ASSIGNABLE_FIELDS` manifest and let the base
class walk it. The `Tx` suffix on every leaf class is dropped, with
deprecated re-exports for backward compatibility.

### Changed (breaking, mitigated)
- **Leaf class names drop the `Tx` suffix.** `PaymentTx` is now `Payment`,
  `AccountSetTx` is now `AccountSet`, `NFTokenMintTx` is now
  `NFTokenMint`, `XChainCommitTx` is now `XChainCommit`, etc. — all 71
  leaf classes. Deprecated `*Tx` aliases re-exported from `src/index.ts`
  so existing imports keep working unchanged:
  ```ts
  // Old (still works, will be removed in v0.5.0)
  import { PaymentTx } from 'xrplt';
  const tx = new PaymentTx({ ... });

  // New (preferred)
  import { Payment } from 'xrplt';
  const tx = new Payment({ ... });

  // Identity preserved across the rename
  PaymentTx === Payment  // true
  ```
  Migration: rename imports. Aliases throw no warnings at runtime
  (kept silent so existing code keeps working without churn); will
  gain a one-shot deprecation log in a minor release before v0.5.0.

### Changed (internal)
- **Constructor pattern: manifest-driven.** Each leaf now declares its
  own field list as a `static readonly ASSIGNABLE_FIELDS = [...] as const`
  and the constructor body shrinks to:
  ```ts
  constructor(props: XxxFields) {
    super({ ...props, TransactionType: Xxx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }
  ```
  The base `Transaction.applyManifest()` walks the manifest after
  `super()` and after class field initializers (`useDefineForClassFields:
  true` under `target: esnext`) and copies matching fields onto `this`.
  Adding a new field to a transaction now means one line of declaration
  plus one line in the manifest array — no more parallel-list drift.
- **`TransactionType` literal single source of truth.** Each leaf's
  static `TRANSACTION_TYPE = '<X>' as const` is the only place the
  string literal appears. Constructor reads it via the class reference
  (`Xxx.TRANSACTION_TYPE`) instead of repeating the literal.
- **`tsconfig.json` adds `noEmitOnError: true`.** Future source-level
  errors can no longer silently corrupt `dist/` with partial output.

### Fixed
- **Build unblocker:** `src/transactions/account-set.ts:59` had
  `this. = props. as any;` (a syntax typo introduced by commit
  `b0625a1` "stop using assignDefined for easier readability") that
  prevented `tsc` from emitting valid code. `tsc` errors and
  integration tests no longer fail with the same parse error.

### Added
- **Local semantic-search tooling.** `.codesearchrc.json`,
  `docker-compose.search.yml`, `.github/agents/default.agent.md`, and
  `.github/copilot-instructions.md` are now committed. Running
  `npm install && npx codesearch up` brings up Ollama + Milvus and
  indexes the codebase for the agent's `codebase_semantic_search` MCP
  tool.
- **`.gitignore` covers ephemeral artifacts.** `scratch/` (for sandbox
  experiments like the deleted `sandbox.ts`) and `.search-index-state.json`
  (codesearch watcher state) are no longer tracked.

### Tests
- 119/119 passing across 3 suites:
  - `tests/transaction.test.ts` — 41 (concrete-class behavior)
  - `tests/integration.offline.test.ts` — 72 (sweeps all 71 types through
    `xrpl.encode`/`decode` round-trip)
  - `tests/docs.test.ts` — 6 (README and API_DOCUMENTATION examples stay valid)

### Dependencies
- `codebase-semantic-search` bumped from `^0.2.0-beta.4` (resolved to
  `0.2.0`) to `^0.2.4`. Engine still ships with the 0.2.0 CLI
  version-reporting bug fixed in 0.2.4.
- `npm audit fix` cleared 5 high and 5 moderate transitive findings
  (12 → 2). Remaining 2 are in `@vitest/mocker` (devDep only) and
  require a breaking vitest@5 upgrade, deferred.

## [0.3.6] - 2026-05-16

Unpublished working-tree version — never released to npm. The published
`0.3.4` is what users have; this version existed only locally with the
"stop using assignDefined for easier readability" refactor that
introduced the build break fixed in 0.4.0.

## [0.3.4] - 2026-05-12

Last published version. See npm for the full 0.3.x history.