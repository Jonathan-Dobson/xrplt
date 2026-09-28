/**
 * LoanPay transaction — submit a payment on a Loan.
 *
 * The Borrower submits LoanPay to make a payment. Three mutually-exclusive
 * payment-type flags (at most one can be set per tx):
 *   - `tfLoanOverpayment` — excess payment treated as overpayment
 *   - `tfLoanFullPayment` — early full repayment
 *   - `tfLoanLatePayment` — late loan payment
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanpay
 * @see https://xrpl.org/docs/concepts/tokens/lending-protocol
 *
 * Affected amendments:
 *   - `LendingProtocol` (base LoanPay)
 *   - `LendingProtocolV1_1` (LendingProtocolV1_1-specific changes)
 *
 * Validation rules enforced locally:
 *   1. `LoanID` required, 64-char hex (ledger entry ID).
 *   2. `Amount` required, valid Amount (XRP / trust line / MPT).
 *   3. **Flag exclusivity**: at most one of the 3 payment-type flags
 *      can be set in a single tx.
 *
 * NOTE: Same MPT/Vault flag-derivation gap — per-bit booleans are not
 * auto-derived from numeric `Flags`. Consumers use the enum directly.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount, MPTAmount } from '../types/amounts.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import { isAmount, isHex, isString } from '../validation/helpers.js';

const TF_LOAN_OVERPAYMENT = 0x00010000;
const TF_LOAN_FULL_PAYMENT = 0x00020000;
const TF_LOAN_LATE_PAYMENT = 0x00040000;

export interface LoanPayTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanPay';
  /** The ID of the Loan object to pay. 64-char hex. */
  readonly LoanID: string;
  /** Amount of funds to pay (XRP / trust line / MPT). */
  readonly Amount: Amount | MPTAmount;
}

export class LoanPay extends LoanTransaction {
  override readonly TransactionType = 'LoanPay' as const;

  readonly LoanID: string = undefined as any;
  readonly Amount: Amount | MPTAmount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'LoanPay' as const;
  static override readonly ASSIGNABLE_FIELDS = ['Amount', 'LoanID'] as const;

  constructor(props: LoanPayTxFields) {
    super({ ...props, TransactionType: LoanPay.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // ── LoanID ── required, 64-char hex.
    if (
      !isString(this.LoanID) ||
      !isHex(this.LoanID) ||
      this.LoanID.length !== 64
    ) {
      throw new ValidationError(
        'LoanPay: LoanID must be a 64-character hex string',
      );
    }

    // ── Amount ── required, valid Amount.
    if (!isAmount(this.Amount)) {
      throw new ValidationError(
        'LoanPay: Amount must be a valid Amount (XRP / trust line / MPT form)',
      );
    }

    // ── Payment-type flag exclusivity.
    const flags = (this as unknown as Record<string, unknown>).Flags as
      | number
      | undefined;
    if (typeof flags === 'number' && flags !== 0) {
      const set: string[] = [];
      if ((flags & TF_LOAN_OVERPAYMENT) === TF_LOAN_OVERPAYMENT) set.push('tfLoanOverpayment');
      if ((flags & TF_LOAN_FULL_PAYMENT) === TF_LOAN_FULL_PAYMENT) set.push('tfLoanFullPayment');
      if ((flags & TF_LOAN_LATE_PAYMENT) === TF_LOAN_LATE_PAYMENT) set.push('tfLoanLatePayment');
      if (set.length > 1) {
        throw new ValidationError(
          `LoanPay: Only one of tfLoanLatePayment, tfLoanFullPayment, or tfLoanOverpayment flags can be set (got: ${set.join(', ')})`,
        );
      }
    }
  }
}