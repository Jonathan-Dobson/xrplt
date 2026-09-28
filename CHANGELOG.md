# Changelog

All notable changes to `xrplt` are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-09-28

Minor release — **breaking**: removes the deprecated `*Tx` aliases
that were scheduled for removal at v0.5.0 (a year overdue). Also
fills in several coverage gaps identified by the v0.6.1 sweep:
exporting `CounterpartySignature`, extending `NFTokenMint` with
the offer-amendment fields, and adding 8 amendment-driven
transaction classes that match the xrpl.js canonical reference.

### Breaking changes

- **Removed**: the 71 `*Tx` exported aliases (e.g. `PaymentTx`,
  `AMMBidTx`, `LoanSetTx`, ...) that were deprecated at v0.4.0
  with removal planned for v0.5.0. Use the non-`Tx` form
  (e.g. `Payment`, `AMMBid`, `LoanSet`). The comment in `src/index.ts`
  that said "remove in v0.5.0" has been honoured two cycles late.

### Added

- **Export `CounterpartySignature`** from `src/index.ts:23` — was
  defined in `src/types/common.ts` and re-exported through
  `src/types/index.ts`, but missed the public entrypoint. Consumers
  using `LoanSet` multi-party signing can now
  `import { CounterpartySignature } from 'xrplt'`.
- **`NFTokenMint` extended** with the offer-amendment fields
  `Amount`, `Expiration`, `Destination`. Each has its own validate
  rule (cross-field: `Amount` required when `Expiration` or
  `Destination` is set; `Expiration` must be UInt32; `Destination`
  must be a valid XRPL address). Closes the long-standing gap
  from the v0.5.0 Known Gaps.
- **Sponsorship family** (Sponsor amendment, `not_enabled`):
  - `SponsorshipSet` — 5 fields (CounterpartySponsor, Sponsee,
    FeeAmountDelta, MaxFee, RemainingOwnerCountDelta) + 5 flags +
    mode-exclusivity validate rules.
  - `SponsorshipTransfer` — 3-modes (`tfSponsorshipEnd` /
    `Create` / `Reassign`), each with its own field requirements.
- **`LedgerStateFix`** — minimal transaction class for the
  ledger-state-fix internal type.
- **ConfidentialMPT family** (ConfidentialTransfer amendment,
  `not_enabled`) — 5 transaction classes covering the encrypted
  balance lifecycle:
  - `ConfidentialMPTClawback` (4 fields).
  - `ConfidentialMPTConvert` (8 fields, conditional ZKProof).
  - `ConfidentialMPTConvertBack` (8 fields including 816-byte
    proof bundle).
  - `ConfidentialMPTMergeInbox` (1 field).
  - `ConfidentialMPTSend` (10 fields including 946-byte proof bundle).

### Removed

- **71 `*Tx` deprecated alias exports** — see Breaking changes.

### Changed

- **`SponsorshipSetFlags` / `SponsorshipTransferFlags` enums** —
  relocated from `src/transactions/sponsorship-{set,transfer}.ts`
  to `src/types/flags.ts` alongside the other family flag enums.
- **`TransactionType` union** — added 8 new entries
  (`SponsorshipSet`, `SponsorshipTransfer`, `LedgerStateFix`,
  `ConfidentialMPT{Clawback,Convert,ConvertBack,MergeInbox,Send}`).

### Tests

- 397 unit + integration tests passing (was 387). The +10 delta
  is from `tests/integration.offline.test.ts` iterating over the
  expanded `TransactionRegistry.types()`. Note: none of the 8 new
  amendment-driven classes have **dedicated** direct tests yet —
  they construct + serialize via the offline sweep, but per-class
  validate-rule coverage is deferred to a v0.7.x patch (the dev-portal
  validator-against-devnet timing is the real test).

## [0.6.1] - 2026-09-28

Patch release. Self-documents the live-testnet test budgets so the
3 network-bound tests don't depend on a CLI flag for correctness.

### Changed

- **`tests/integration.testnet.test.ts`** — declared per-`it`
  timeouts so the budget is visible at the test site rather than
  only in `package.json`'s `--testTimeout=30000` flag:
  - MPT lifecycle (`describe 1`): `20_000` ms — observed at ~10s.
  - NFT sale (`describe 2`): `30_000` ms — observed at ~18s.
  - Multisig DEX (`describe 3`): `60_000` ms — observed at ~30s.

### Tests

- 387 unit tests passing; 3 live-testnet tests passing (verified
  manually against `wss://s.devnet.rippletest.net:51233`).

## [0.6.0] - 2026-09-28

Minor release. No public-API changes from v0.5.0 — same 71
transaction classes, same constructor signatures, same JSON shape.
The bump is for **type-system tightening** that consumers of the
declaration files will see: every `readonly Foo: T = undefined as any`
placeholder has become a real `declare readonly Foo: T` declaration,
and a strict ESLint config is now the second gate alongside `tsc`.

### Added

- **ESLint 9 flat config** (`eslint.config.js`) — `@eslint/js`
  recommended + `typescript-eslint` strict. Catches unused-vars
  (with underscore allow), `no-explicit-any`,
  `no-floating-promises`, `prefer-readonly`,
  `@typescript-eslint/consistent-type-imports`, and the rest of the
  strict TS rule set.
- **`npm run lint` + `npm run lint:fix` scripts.** Wired into
  `prepublishOnly`, so `npm publish` blocks on lint errors.
- **Per-glob overrides** in `eslint.config.js`:
  - `src/**`: full strictness.
  - `tests/**`: relaxed for `max-lines-per-function` and
    `no-explicit-any` (tests legitimately use `any` and run long).
  - `**/*.d.ts` + `dist/`: `unused-vars` off.

### Changed

### Added

- **ESLint 9 flat config** (`eslint.config.js`) — `@eslint/js`
  recommended + `typescript-eslint` strict. Catches unused-vars
  (with underscore allow), `no-explicit-any`,
  `no-floating-promises`, `prefer-readonly`,
  `@typescript-eslint/consistent-type-imports`, and the rest of the
  strict TS rule set.
- **`npm run lint` + `npm run lint:fix` scripts.** Wired into
  `prepublishOnly`, so `npm publish` blocks on lint errors.
- **Per-glob overrides** in `eslint.config.js`:
  - `src/**`: full strictness.
  - `tests/**`: relaxed for `max-lines-per-function` and
    `no-explicit-any` (tests legitimately use `any` and run long).
  - `**/*.d.ts` + `dist/`: `unused-vars` off.

### Changed

- **115 field declarations converted** across 59 transaction-class
  files from `readonly Foo: T = undefined as any;` to
  `declare readonly Foo: T;`. The `as any` was an `applyManifest()`
  helper hack to keep `strictPropertyInitialization` happy while
  delegating field assignment to the constructor body. Replacing
  it with `declare` does the same job without lying to the
  type-checker about the field's runtime type.
- **3 leftover `as any` casts removed** via proper narrowing /
  typing:
  - `src/transactions/payment.ts` — `(this.Flags as any)
    ?.tfPartialPayment` → `typeof`-narrowed `isPartial` predicate.
  - `src/transactions/offer-create.ts` — same pattern for `tfHybrid`.
  - `src/transactions/permissioned-domain-set.ts` — typed
    `AcceptedCredentials` as `unknown[]` instead of `any[]`.
- **`src/transactions/delegate-set.ts` + `src/transaction.ts`** —
  the last residual `as any` was eliminated by relocating
  `Delegate` from the abstract `Transaction` base class onto
  `DelegateSet` itself. Removing the parent field + `this.Delegate
  = props.Delegate` constructor assignment broke the
  optional→required override shape that had forced the
  placeholder. `DelegateSet` now declares
  `declare readonly Delegate: string;` cleanly and adds
  `Delegate` to its `ASSIGNABLE_FIELDS` manifest so
  `applyManifest()` populates it the same way as every other
  leaf-declared field. **Zero `as any` remain in src/**.
- **`src/transaction.ts` docstring** — references
  `declare readonly Foo: T` (the new shape) instead of the old
  `= undefined as any` initializer.

### Fixed

- **`src/registry.ts`** — added an explanation comment to the
  existing `TransactionRegistry` static-only class so
  `@typescript-eslint/no-extraneous-class` allows it.
- **`tests/batch-v1_1.test.ts`** — added a 10-char description to
  the `@ts-expect-error` directive so
  `@typescript-eslint/ban-ts-comment` passes.

### Known gaps

- **None in this release.** The full `as any` surface that motivated
  v0.6.0 is now eliminated across `src/`. The 123 pre-existing
  warnings from v0.5.0 → v0.5.1 transition are gone; the lone
  `Delegate` override pattern was removed by relocating the field
  from the abstract `Transaction` base class onto `DelegateSet`
  itself. Carried-forward gaps from v0.5.0 (per-bit flag booleans,
  NFTokenMint 3 missing fields, NFTokenModify unimplemented) are
  unchanged.

### Tests

- 387 unit tests passing (no test changes from v0.5.0).

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