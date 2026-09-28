/**
 * LoanBrokerSet transaction — create or update a LoanBroker ledger entry.
 *
 * The LoanBroker owns a Vault and manages the protocol settings
 * (management fee rate, debt maximum, cover rates). Both creation and
 * modification use the same transaction type; the presence of
 * `LoanBrokerID` distinguishes "update" (existing entry) from "create".
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanbrokerset
 * @see https://xrpl.org/docs/concepts/tokens/lending-protocol
 *
 * Affected amendments:
 *   - `LendingProtocol` (base LoanBrokerSet)
 *   - `LendingProtocolV1_1` (closed-ended vault constraints)
 *
 * Validation rules enforced locally:
  - 1. `VaultID` required, 64-char hex.
  - 2. `LoanBrokerID` if present: 64-char hex (update mode).
  - 3. `Data` if present: hex, length in (0, 512] characters.
  - 4. `ManagementFeeRate` if present: integer in [0, 10000] (1/10 bp;
  -     0%–10%).
  - 5. `DebtMaximum` if present: non-negative base-10 integer string.
  - 6. `CoverRateMinimum` if present: integer in [0, 100000].
  - 7. `CoverRateLiquidation` if present: integer in [0, 100000].
  - 8. **Coupling rule**: CoverRateMinimum and CoverRateLiquidation must
  -     BOTH be zero OR BOTH be non-zero (you can't set one without
  -     the other).
  *
  * LoanBrokerSet has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import {
  isHex,
  isNumber,
  isString,
} from '../validation/helpers.js';

const MAX_DATA_LENGTH_CHARS = 512;
const MAX_MANAGEMENT_FEE_RATE = 10_000; // 1/10 bp; 0%–10%
const MAX_COVER_RATE = 100_000; // 1/10 bp; 0%–100%

export interface LoanBrokerSetTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'LoanBrokerSet';
  /** The Vault ID that the Lending Protocol will use. 64-char hex. */
  readonly VaultID: string;
  /** LoanBrokerID when updating an existing entry (64-char hex). */
  readonly LoanBrokerID?: string | undefined;
  /** Arbitrary metadata, hex, ≤ 512 characters. */
  readonly Data?: string | undefined;
  /** Management fee rate in 1/10 bp; 0–10000 (0%–10%). */
  readonly ManagementFeeRate?: number | undefined;
  /** Max protocol debt; 0 = unlimited. Non-negative base-10 integer string. */
  readonly DebtMaximum?: string | undefined;
  /** Min cover rate for first-loss capital, 1/10 bp; 0–100000 (0%–100%). */
  readonly CoverRateMinimum?: number | undefined;
  /** Cover-rate liquidation cap, 1/10 bp; 0–100000 (0%–100%). */
  readonly CoverRateLiquidation?: number | undefined;
}

export class LoanBrokerSet extends LoanTransaction {
  override readonly TransactionType = 'LoanBrokerSet' as const;

  declare readonly VaultID: string;
  readonly LoanBrokerID?: string | undefined = undefined;
  readonly Data?: string | undefined = undefined;
  readonly ManagementFeeRate?: number | undefined = undefined;
  readonly DebtMaximum?: string | undefined = undefined;
  readonly CoverRateMinimum?: number | undefined = undefined;
  readonly CoverRateLiquidation?: number | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'LoanBrokerSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'CoverRateLiquidation',
    'CoverRateMinimum',
    'Data',
    'DebtMaximum',
    'LoanBrokerID',
    'ManagementFeeRate',
    'VaultID',
  ] as const;

  constructor(props: LoanBrokerSetTxFields) {
    super({ ...props, TransactionType: LoanBrokerSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // ── VaultID ── required, 64-char hex.
    if (
      !isString(this.VaultID) ||
      !isHex(this.VaultID) ||
      this.VaultID.length !== 64
    ) {
      throw new ValidationError(
        'LoanBrokerSet: VaultID must be a 64-character hex string',
      );
    }

    // ── LoanBrokerID ── 64-char hex when present (update mode).
    if (this.LoanBrokerID !== undefined) {
      if (
        !isString(this.LoanBrokerID) ||
        !isHex(this.LoanBrokerID) ||
        this.LoanBrokerID.length !== 64
      ) {
        throw new ValidationError(
          'LoanBrokerSet: LoanBrokerID must be a 64-character hex string',
        );
      }
    }

    // ── Data ── hex, ≤ 512 chars.
    if (this.Data !== undefined) {
      if (!isString(this.Data) || !isHex(this.Data)) {
        throw new ValidationError(
          'LoanBrokerSet: Data must be a valid non-empty hex string',
        );
      }
      if (this.Data.length === 0 || this.Data.length > MAX_DATA_LENGTH_CHARS) {
        throw new ValidationError(
          `LoanBrokerSet: Data must be 1 to ${MAX_DATA_LENGTH_CHARS} hex characters (actual: ${this.Data.length})`,
        );
      }
    }

    // ── ManagementFeeRate ── integer in [0, 10000].
    if (this.ManagementFeeRate !== undefined && !this.rateInRange(this.ManagementFeeRate, 0, MAX_MANAGEMENT_FEE_RATE)) {
      throw new ValidationError(
        `LoanBrokerSet: ManagementFeeRate must be between 0 and ${MAX_MANAGEMENT_FEE_RATE} inclusive`,
      );
    }

    // ── DebtMaximum ── non-negative base-10 integer string.
    if (this.DebtMaximum !== undefined) {
      if (
        !isString(this.DebtMaximum) ||
        !/^[0-9]+$/u.test(this.DebtMaximum)
      ) {
        throw new ValidationError(
          'LoanBrokerSet: DebtMaximum must be a non-negative base-10 integer string',
        );
      }
    }

    // ── CoverRateMinimum + CoverRateLiquidation ranges.
    if (this.CoverRateMinimum !== undefined && !this.rateInRange(this.CoverRateMinimum, 0, MAX_COVER_RATE)) {
      throw new ValidationError(
        `LoanBrokerSet: CoverRateMinimum must be between 0 and ${MAX_COVER_RATE} inclusive`,
      );
    }
    if (this.CoverRateLiquidation !== undefined && !this.rateInRange(this.CoverRateLiquidation, 0, MAX_COVER_RATE)) {
      throw new ValidationError(
        `LoanBrokerSet: CoverRateLiquidation must be between 0 and ${MAX_COVER_RATE} inclusive`,
      );
    }

    // ── Cover rate coupling rule: both zero OR both non-zero.
    const coverMin = this.CoverRateMinimum ?? 0;
    const coverLiq = this.CoverRateLiquidation ?? 0;
    if ((coverMin === 0) !== (coverLiq === 0)) {
      throw new ValidationError(
        'LoanBrokerSet: CoverRateMinimum and CoverRateLiquidation must both be zero or both be non-zero',
      );
    }
  }

  /** Rate range helper: integer in [min, max]. */
  private rateInRange(value: number, min: number, max: number): boolean {
    return (
      isNumber(value) &&
      Number.isInteger(value) &&
      value >= min &&
      value <= max
    );
  }
}