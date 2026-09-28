/**
 * LoanBrokerCoverClawback transaction — clawback First-Loss Capital from
 * a LoanBroker. Only the Issuer of the loan asset can submit this.
 * Clawback is limited to the minimum cover required for current loans.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanbrokercoverclawback
 *
 * Affected amendments:
 *   - `LendingProtocolV1_1` (base LoanBrokerCoverClawback)
 *
 * Validation rules enforced locally:
 *   - At least one of `LoanBrokerID` or `Amount` must be present.
 *   - `LoanBrokerID` if present: 64-char hex.
 *   - `Amount` if present: IssuedCurrencyAmount | MPTAmount with
 *     `value >= 0` (NOT XRP — clawback is IOU/MPT only).
 *
 * LoanBrokerCoverClawback has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { IssuedCurrencyAmount, MPTAmount } from '../types/amounts.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import {
  isHex,
  isIssuedCurrencyAmount,
  isMPTAmount,
  isString,
} from '../validation/helpers.js';

export interface LoanBrokerCoverClawbackTxFields
  extends BaseTransactionFields {
  readonly TransactionType?: 'LoanBrokerCoverClawback';
  /**
   * Optional Loan Broker ID to clawback from. Required if Amount is MPT
   * or if Amount is IOU and issuer matches the sender.
   */
  readonly LoanBrokerID?: string | undefined;
  /**
   * Optional First-Loss Capital amount to clawback. If 0 or omitted,
   * claws back up to DebtTotal × CoverRateMinimum.
   * Clawback does NOT support XRP.
   */
  readonly Amount?: IssuedCurrencyAmount | MPTAmount | undefined;
}

export class LoanBrokerCoverClawback extends LoanTransaction {
  override readonly TransactionType = 'LoanBrokerCoverClawback' as const;

  readonly LoanBrokerID?: string | undefined = undefined;
  readonly Amount?: IssuedCurrencyAmount | MPTAmount | undefined = undefined;

  static override readonly TRANSACTION_TYPE =
    'LoanBrokerCoverClawback' as const;
  static override readonly ASSIGNABLE_FIELDS = ['Amount', 'LoanBrokerID'] as const;

  constructor(props: LoanBrokerCoverClawbackTxFields) {
    super({
      ...props,
      TransactionType: LoanBrokerCoverClawback.TRANSACTION_TYPE,
    });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // ── LoanBrokerID ── 64-char hex when present.
    if (this.LoanBrokerID !== undefined) {
      if (
        !isString(this.LoanBrokerID) ||
        !isHex(this.LoanBrokerID) ||
        this.LoanBrokerID.length !== 64
      ) {
        throw new ValidationError(
          'LoanBrokerCoverClawback: LoanBrokerID must be a 64-character hex string',
        );
      }
    }

    // ── Amount ── valid ClawbackAmount (trust line / MPT, NOT XRP).
    if (this.Amount !== undefined) {
      if (
        !isIssuedCurrencyAmount(this.Amount) &&
        !isMPTAmount(this.Amount)
      ) {
        throw new ValidationError(
          'LoanBrokerCoverClawback: Amount must be a valid ClawbackAmount (trust line / MPT form, NOT XRP)',
        );
      }
      // Value must be ≥ 0
      const value = (this.Amount as { value: string }).value;
      if (value === undefined || Number.isNaN(Number(value)) || Number(value) < 0) {
        throw new ValidationError(
          'LoanBrokerCoverClawback: Amount must be >= 0',
        );
      }
    }

    // ── At least one of LoanBrokerID or Amount required.
    if (this.LoanBrokerID === undefined && this.Amount === undefined) {
      throw new ValidationError(
        'LoanBrokerCoverClawback: Either LoanBrokerID or Amount is required',
      );
    }
  }
}