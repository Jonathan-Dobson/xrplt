# Changelog

All notable changes to `xrplt` are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-09-28

Minor release. Brings the **Vault**, **Loan**, and **Batch** transaction
families up to date with the upstream spec, plus a sweep of smaller
amendments-driven gaps. The `SingleAssetVault`, `LendingProtocol`,
`LendingProtocolV1_1`, `BatchV1_1`, `DynamicNFT`, and `PermissionedDomains`
amendments are all reflected.

### Added

- **Vault family (6 classes, previously empty skeletons)** — VaultCreate,
  VaultSet, VaultDeposit, VaultWithdraw, VaultDelete, VaultClawback.
  Brings fields, flags, and validate() rules in line with the canonical
  reference. Includes 97 direct tests covering construction, all Asset
  forms (XRP / trust line / MPT), and per-rule validation.
- **Loan family (9 classes, previously empty or thin skeletons)** —
  LoanSet, LoanBrokerSet, LoanBrokerDelete, LoanPay,
  LoanBrokerCoverDeposit, LoanBrokerCoverWithdraw, LoanBrokerCoverClawback,
  LoanDelete, LoanManage. Includes the new `CounterpartySignature`
  inner-object type used by LoanSet for multi-party agreements.
  Includes 107 direct tests.
- **Batch family (1 class, previously loose `Transactions: any[]`)** —
  Batch rewritten to the `BatchV1_1` shape: `RawTransactions:
  Array<{RawTransaction: <tx>}>` + optional `BatchSigners`. Inner-tx
  validation per spec: each inner tx must include `tfInnerBatchTxn`
  global flag, `Fee="0"`, `SigningPubKey=""`, no `TxnSignature`, no
  `Signers`, and cannot itself be a Batch. Includes 14 direct tests.
- **PermissionedDomainDelete** — added `DomainID` field + 64-char hex
  validation. Was a 25-line empty skeleton.
- **`NFTokenMint.tfMutable` flag** (`0x00000010`) — added per the
  `DynamicNFT` amendment. Marks an NFT as eligible for future
  URI updates via a not-yet-implemented `NFTokenModify` transaction.
- **New flag enums in `src/types/flags.ts`**:
  - `VaultCreateFlags`, `VaultCreateFlagsInterface`
  - `VaultWithdrawalPolicy`, `VaultKind` (canonical enum names)
  - `LoanSetFlags`, `LoanSetFlagsInterface` (`tfLoanOverpayment`)
  - `LoanPayFlags`, `LoanPayFlagsInterface` (3 mutually-exclusive flags)
  - `LoanManageFlags`, `LoanManageFlagsInterface` (3 flags including
    mutually-exclusive `tfLoanImpair` + `tfLoanUnimpair`)
- **New `CounterpartySignature` type** in `src/types/common.ts`:
  `{ SigningPubKey?, TxnSignature?, Signers? }` inner-object interface.

### Fixed

- **`BatchFlags` enum values were wrong** — the existing implementation
  used `0x01-0x08` (same bit range as NFToken flags). Corrected to
  canonical `0x10000-0x80000` per the xrpl.js reference.
- **MPToken family follow-ups from 0.4.1 prep** — VaultCreate was
  missing 3 spec rules caught by the canonical reference check
  (`DomainID` requires `tfVaultPrivate` flag, `Data` must be even-length
  hex, `Scale` parameter must not be provided for XRP/MPT assets).
- **`TransactionType` design** — all 71 `<ClassName>TxFields` interfaces
  required `TransactionType: '<ClassName>'` but the constructor always
  injects it from the static, making the caller's value silently
  ignored. Made `BaseTransactionFields.TransactionType` optional and
  propagated the optional narrowing through every TxFields interface.
  Resolves 184 editor TS errors in tests.

### Changed

- **All 71 transaction class constructors no longer require
  `TransactionType` in the props.** Callers can construct via
  `new X({ Account, ... })` without redundantly passing the
  discriminator — the constructor takes care of it. Runtime behavior
  unchanged; all existing tests pass.

### Tests

- **386 tests passing** (was 119 before this release):
  - Vault: 97
  - Loan: 107
  - Batch: 14
  - MPT: 44
  - transaction: 41
  - docs: 6
  - integration.offline: 72 (+ 5 for new sweep items)
- New per-family test files: `tests/vault.test.ts`, `tests/loan.test.ts`,
  `tests/batch-v1_1.test.ts`. Existing sweep tests added to
  `tests/integration.offline.test.ts`.
- New editor tsconfig (`tsconfig.editor.json`) that includes tests.
  Build still uses the canonical `tsconfig.json`.

### Known gaps

- Per-bit flag booleans (`tfMPTCanLock`, `tfVaultPrivate`, etc.) are
  declared on MPT/Vault/Loan classes but not auto-derived from the
  numeric `Flags` field by `applyManifest()`. Consumers use the numeric
  `Flags` field with the enum directly. Wire-up is a separate concern
  from spec coverage; will land in a future commit that does MPT +
  Vault + Loan together.
- `NFTokenMint` is missing 3 canonical fields added in a later
  XRPL amendment (`Amount`, `Expiration`, `Destination`). Deferred.
- `NFTokenModify` transaction itself is not yet implemented (would
  require the `tfMutable` flag in `NFTokenMint` to be functional end
  to end).

## [0.4.1] - 2026-09-28

Patch release. Brings the MPT (Multi-Purpose Token) transaction family
up to date with the upstream spec. Three amendments worth of previously
missing fields, capability flags, and validation rules.

### Fixed
- **MPTokenIssuanceCreate** — added `DomainID` (PermissionedDomains +
  SingleAssetVault amendments) and `ImmutableFlags` (DynamicMPT
  amendment) fields; added all 7 capability flags
  (`tfMPTCanLock`, `tfMPTRequireAuth`, `tfMPTCanEscrow`, `tfMPTCanTrade`,
  `tfMPTCanTransfer`, `tfMPTCanClawback`,
  `tfMPTCanHoldConfidentialBalance`). New validate() rules enforce the
  spec's coherence locally so common `temMALFORMED` /
  `temBAD_TRANSFER_FEE` / `temINVALID_FLAG` cases fail at construction
  rather than at submit time.
- **MPTokenIssuanceSet** — added 6 fields
  (`AuditorEncryptionKey`, `IssuerEncryptionKey`, `DomainID`,
  `ImmutableFlags`, `MPTokenMetadata`, `TransferFee`) plus the full
  flag set (`tfMPTLock`, `tfMPTUnlock`, 6x `tfMPTSet*` flags,
  `tfMPTSetCanHoldConfidentialBalance`). New validate() enforces 10
  spec coherence rules including the lock/unlock ↔ field-update
  incombinable rule, the Holder ↔ DomainID mutual exclusion, and the
  encryption-key ↔ Holder incombinable rule.
- **MPTokenIssuanceSet manifest** — `MPTokenIssuanceID` was missing
  from the `ASSIGNABLE_FIELDS` array after the prior refactor; required
  field was being silently dropped at construction. Re-added.

### Added
- **New flag enums + interfaces** in `src/types/flags.ts`:
  `MPTokenIssuanceCreateFlags`, `MPTokenIssuanceCreateFlagsInterface`,
  `MPTokenIssuanceSetFlags`, `MPTokenIssuanceSetFlagsInterface`,
  `MPTokenImmutableFlags`, `MPTokenImmutableFlagsInterface`.
- **`tests/mpt.test.ts`** — 44 direct tests for the 4 MPT classes
  covering construction, validation, the new field set, and flag
  math. Now MPTokenIssuanceDestroy and MPTokenAuthorize also have
  direct coverage (they previously had only the
  `TransactionRegistry.types()` round-trip in
  `integration.offline.test.ts`).

### Notes for 0.4.2
- The Vault family (6 classes — `VaultCreate`, `VaultSet`,
  `VaultDeposit`, `VaultWithdraw`, `VaultDelete`, `VaultClawback`) and
  the Loan family (9 classes — all `Loan*`) are also significantly
  out of date with the current XRPL spec. Each will get its own
  minor-bump release after 0.4.1 lands.

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