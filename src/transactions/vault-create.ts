/**
 * VaultCreate transaction — create a new single-asset vault on the ledger.
 *
 * Creates a `Vault` ledger entry, an `MPTokenIssuance` ledger entry for the
 * vault's shares, and an `AccountRoot` for the vault's pseudo-account. The
 * asset held by the vault can be XRP, a trust line token, or an MPT.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/vaultcreate
 * @see https://xrpl.org/docs/concepts/tokens/single-asset-vaults
 *
 * Affected amendments:
 * - `SingleAssetVault` (base VaultCreate + VaultKind/SubscriptionDate/
 *   RedemptionDate/Scale/WithdrawalPolicy fields + tfVaultPrivate /
 *   tfVaultShareNonTransferable flags)
 * - `LendingProtocolV1_1` (closed-ended vaults + LendingProtocolV1_1-specific
 *   validate rules)
 * - `PermissionedDomains` (DomainID field)
 * - `MPTokensV1` (the issued shares are MPTs)
 *
 * Validation rules enforced locally (the ledger enforces parallel rules
 * via `temMALFORMED` / `temINVALID` / `temDISABLED`):
 *
 *   - `Asset` must be a valid Currency (XRP / trust line / MPT form).
 *   - `Data` if present: hex, length in (0, 256] bytes.
 *   - `MPTokenMetadata` if present: hex, length in (0, 1024] bytes.
 *   - `WithdrawalPolicy` if present: must be `0x0001` (FCFS).
 *   - `AssetsMaximum` if present: base-10 number string ≥ 0.
 *   - `Scale` if present: 0–18; **conditional on Asset** — fixed at 0
 *     for XRP and MPT, configurable for trust line tokens.
 *   - `VaultKind` if present: 0 (open-ended) or 1 (closed-ended).
 *   - If `VaultKind = 1`: both `SubscriptionDate` AND `RedemptionDate`
 *     required; gap must be in `[180, 946708560)` seconds; both > 0.
 *   - If `VaultKind = 0` (or absent): no `SubscriptionDate` or
 *     `RedemptionDate` may be present.
 *   - `DomainID` if present: 64-char hex (covered by `isDomainID`).
 *
 * Note: Vault creation does NOT affect token balances — it only creates
 * the ledger entries. Actual asset movement happens via VaultDeposit.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Currency } from '../types/amounts.js';
import { VaultTransaction } from '../groups/vault.js';
import { ValidationError } from '../errors.js';
import {
  isCurrency,
  isDomainID,
  isHex,
  isNumber,
  isString,
} from '../validation/helpers.js';

// ─── Spec constants ──────────────────────────────────────────────────

/** Maximum encoded Data length in bytes (hex is 2 chars per byte). */
const MAX_DATA_BYTES = 256;
/** Maximum encoded MPTokenMetadata length in bytes. */
const MAX_METADATA_BYTES = 1024;
/** Scale range for trust line tokens (XRP and MPT are fixed at 0). */
const MIN_SCALE = 0;
const MAX_SCALE = 18;
/** Allowed VaultKind values. */
const VAULT_KIND_OPEN_ENDED = 0;
const VAULT_KIND_CLOSED_ENDED = 1;
/** Currently-supported WithdrawalPolicy values. */
const WITHDRAWAL_POLICY_FCFS = 0x0001;
/** Closed-ended vault lifecycle bounds (seconds). */
const MIN_CLOSED_ENDED_GAP_SECONDS = 180;
const MAX_CLOSED_ENDED_GAP_SECONDS = 946708560; // 30 years

export interface VaultCreateTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultCreate';
  /** The asset held in the vault: XRP, a trust line token, or an MPT. */
  readonly Asset: Currency;
  /** Optional cap on total assets the vault can hold (base-10 number string). */
  readonly AssetsMaximum?: string | undefined;
  /** Optional vault metadata, hex-encoded, 0 < length ≤ 256 bytes. */
  readonly Data?: string | undefined;
  /**
   * Optional Permissioned Domain ID for a private vault. Requires the
   * `PermissionedDomains` amendment. 64-char hex string.
   */
  readonly DomainID?: string | undefined;
  /**
   * Optional metadata about the vault's shares (which are MPTs), hex-encoded,
   * 0 < length ≤ 1024 bytes.
   */
  readonly MPTokenMetadata?: string | undefined;
  /**
   * Closed-ended vault redemption timestamp (seconds since Ripple Epoch).
   * Required when `VaultKind = 1`.
   */
  readonly RedemptionDate?: number | undefined;
  /**
   * Decimal precision for share conversion. Fixed at 0 for XRP and MPT;
   * configurable 0–18 for trust line tokens.
   */
  readonly Scale?: number | undefined;
  /**
   * Closed-ended vault subscription-end timestamp (seconds since Ripple Epoch).
   * Required when `VaultKind = 1`.
   */
  readonly SubscriptionDate?: number | undefined;
  /**
   * `0` = open-ended (default); `1` = closed-ended (lifecycle-bounded,
   * requires both `SubscriptionDate` and `RedemptionDate`).
   */
  readonly VaultKind?: number | undefined;
  /**
   * Withdrawal strategy. Currently only `0x0001` (FCFS) is supported.
   */
  readonly WithdrawalPolicy?: number | undefined;
}

export class VaultCreate extends VaultTransaction {
  // Per-bit flag booleans (tfVaultPrivate, tfVaultShareNonTransferable) are
  // NOT auto-derived from `Flags`. This mirrors the existing MPT family
  // pattern. Consumers can pass a `VaultCreateFlagsInterface` as the `Flags`
  // field (structural typing); use `tx.Flags` directly with the enum to
  // check per-bit state:
  //   (tx.Flags & VaultCreateFlags.tfVaultPrivate) !== 0
  override readonly TransactionType = 'VaultCreate' as const;

  readonly Asset: Currency = undefined as any;
  readonly AssetsMaximum?: string | undefined = undefined;
  readonly Data?: string | undefined = undefined;
  readonly DomainID?: string | undefined = undefined;
  readonly MPTokenMetadata?: string | undefined = undefined;
  readonly RedemptionDate?: number | undefined = undefined;
  readonly Scale?: number | undefined = undefined;
  readonly SubscriptionDate?: number | undefined = undefined;
  readonly VaultKind?: number | undefined = undefined;
  readonly WithdrawalPolicy?: number | undefined = undefined;

  // NOTE: per-bit flag booleans (tfVaultPrivate, tfVaultShareNonTransferable)
  // are NOT auto-derived from the numeric `Flags` field. This mirrors the
  // existing MPT family pattern where the booleans are declared but never
  // populated by `applyManifest`. Consumers should check `tx.Flags` directly:
  //   (tx.Flags & VaultCreateFlags.tfVaultPrivate) !== 0
  // Future enhancement: wire up a flag-derivation helper for MPT + Vault.

  static override readonly TRANSACTION_TYPE = 'VaultCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Asset',
    'AssetsMaximum',
    'Data',
    'DomainID',
    'MPTokenMetadata',
    'RedemptionDate',
    'Scale',
    'SubscriptionDate',
    'VaultKind',
    'WithdrawalPolicy',
  ] as const;

  constructor(props: VaultCreateTxFields) {
    super({ ...props, TransactionType: VaultCreate.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // ── Asset ── required, must be a valid Currency.
    if (!isCurrency(this.Asset)) {
      throw new ValidationError(
        'VaultCreate: Asset must be a valid Currency (XRP, trust line, or MPT form)',
      );
    }

    // ── Data ── hex, length in (0, 256] bytes.
    if (this.Data !== undefined) {
      if (!isString(this.Data) || !isHex(this.Data) || this.Data.length === 0) {
        throw new ValidationError(
          'VaultCreate: Data must be a non-empty hex string',
        );
      }
      const bytes = this.Data.length / 2;
      if (bytes > MAX_DATA_BYTES) {
        throw new ValidationError(
          `VaultCreate: Data length must be ≤ ${MAX_DATA_BYTES} bytes`,
        );
      }
    }

    // ── MPTokenMetadata ── hex, length in (0, 1024] bytes.
    if (this.MPTokenMetadata !== undefined) {
      if (
        !isString(this.MPTokenMetadata) ||
        !isHex(this.MPTokenMetadata) ||
        this.MPTokenMetadata.length === 0
      ) {
        throw new ValidationError(
          'VaultCreate: MPTokenMetadata must be a non-empty hex string',
        );
      }
      const bytes = this.MPTokenMetadata.length / 2;
      if (bytes > MAX_METADATA_BYTES) {
        throw new ValidationError(
          `VaultCreate: MPTokenMetadata length must be ≤ ${MAX_METADATA_BYTES} bytes`,
        );
      }
    }

    // ── WithdrawalPolicy ── currently only 0x0001 supported.
    if (this.WithdrawalPolicy !== undefined) {
      if (
        !isNumber(this.WithdrawalPolicy) ||
        this.WithdrawalPolicy !== WITHDRAWAL_POLICY_FCFS
      ) {
        throw new ValidationError(
          `VaultCreate: WithdrawalPolicy must be 0x${WITHDRAWAL_POLICY_FCFS.toString(16).padStart(4, '0')} (vaultStrategyFirstComeFirstServe)`,
        );
      }
    }

    // ── AssetsMaximum ── non-negative base-10 integer string.
    if (this.AssetsMaximum !== undefined) {
      if (
        !isString(this.AssetsMaximum) ||
        !/^[0-9]+$/u.test(this.AssetsMaximum)
      ) {
        throw new ValidationError(
          'VaultCreate: AssetsMaximum must be a non-negative base-10 integer string',
        );
      }
    }

    // ── VaultKind ── 0 or 1 only.
    if (this.VaultKind !== undefined) {
      if (
        !isNumber(this.VaultKind) ||
        (this.VaultKind !== VAULT_KIND_OPEN_ENDED &&
          this.VaultKind !== VAULT_KIND_CLOSED_ENDED)
      ) {
        throw new ValidationError(
          `VaultCreate: VaultKind must be ${VAULT_KIND_OPEN_ENDED} (open-ended) or ${VAULT_KIND_CLOSED_ENDED} (closed-ended)`,
        );
      }
    }

    // ── Scale ── conditional on Asset type + range.
    if (this.Scale !== undefined) {
      if (
        !isNumber(this.Scale) ||
        this.Scale < MIN_SCALE ||
        this.Scale > MAX_SCALE ||
        !Number.isInteger(this.Scale)
      ) {
        throw new ValidationError(
          `VaultCreate: Scale must be an integer in [${MIN_SCALE}, ${MAX_SCALE}]`,
        );
      }
      // XRP and MPT assets have fixed Scale=0. Trust line tokens can be
      // configured up to 18.
      if ('currency' in this.Asset && this.Asset.currency === 'XRP') {
        if (this.Scale !== 0) {
          throw new ValidationError(
            'VaultCreate: Scale must be 0 for XRP vaults (fixed by amendment)',
          );
        }
      } else if ('mpt_issuance_id' in this.Asset) {
        if (this.Scale !== 0) {
          throw new ValidationError(
            'VaultCreate: Scale must be 0 for MPT vaults (fixed by amendment)',
          );
        }
      }
      // For trust line tokens ({currency, issuer}), Scale can be 0–18.
    }

    // ── Closed-ended vault date invariants ──
    const hasSub = this.SubscriptionDate !== undefined;
    const hasRed = this.RedemptionDate !== undefined;
    const isClosedEnded =
      this.VaultKind === VAULT_KIND_CLOSED_ENDED ||
      (this.VaultKind === undefined && (hasSub || hasRed));

    if (this.VaultKind === VAULT_KIND_CLOSED_ENDED) {
      // Both dates required when VaultKind=1.
      if (!hasSub || !hasRed) {
        throw new ValidationError(
          'VaultCreate: VaultKind=1 (closed-ended) requires both SubscriptionDate and RedemptionDate',
        );
      }
    } else if (this.VaultKind === VAULT_KIND_OPEN_ENDED) {
      // Open-ended vaults MUST NOT have lifecycle dates.
      if (hasSub || hasRed) {
        throw new ValidationError(
          'VaultCreate: VaultKind=0 (open-ended) must not include SubscriptionDate or RedemptionDate',
        );
      }
    }
    // VaultKind absent + dates absent: open-ended, no check.
    // VaultKind absent + dates present: spec doesn't address this; allow
    // (the ledger will surface temMALFORMED if it disallows).

    // Date gap check when both present.
    if (isClosedEnded && hasSub && hasRed) {
      if (
        !isNumber(this.SubscriptionDate) ||
        !isNumber(this.RedemptionDate) ||
        this.SubscriptionDate <= 0 ||
        this.RedemptionDate <= 0
      ) {
        throw new ValidationError(
          'VaultCreate: SubscriptionDate and RedemptionDate must be positive integers (seconds since Ripple Epoch)',
        );
      }
      const gap = this.RedemptionDate - this.SubscriptionDate;
      if (
        gap < MIN_CLOSED_ENDED_GAP_SECONDS ||
        gap >= MAX_CLOSED_ENDED_GAP_SECONDS
      ) {
        throw new ValidationError(
          `VaultCreate: RedemptionDate - SubscriptionDate must be in [${MIN_CLOSED_ENDED_GAP_SECONDS}, ${MAX_CLOSED_ENDED_GAP_SECONDS}) seconds`,
        );
      }
    }

    // ── DomainID ── 64-char hex.
    if (this.DomainID !== undefined && !isDomainID(this.DomainID)) {
      throw new ValidationError(
        'VaultCreate: DomainID must be a 64-character hex string',
      );
    }
  }
}