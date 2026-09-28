/**
 * LoanDelete transaction — delete a Loan ledger entry.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loandelete
 *
 * Affected amendments:
 *   - `LendingProtocol` (base LoanDelete)
 *
 * Validation rules enforced locally:
 *   - `LoanID` required, 64-char hex.
 *
 * LoanDelete has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import { isHex, isString } from '../validation/helpers.js';

export interface LoanDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'LoanDelete';
  /** The ID of the Loan object to delete. 64-char hex. */
  readonly LoanID: string;
}

export class LoanDelete extends LoanTransaction {
  override readonly TransactionType = 'LoanDelete' as const;

  declare readonly LoanID: string;
  static override readonly TRANSACTION_TYPE = 'LoanDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = ['LoanID'] as const;

  constructor(props: LoanDeleteTxFields) {
    super({ ...props, TransactionType: LoanDelete.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    if (
      !isString(this.LoanID) ||
      !isHex(this.LoanID) ||
      this.LoanID.length !== 64
    ) {
      throw new ValidationError(
        'LoanDelete: LoanID must be a 64-character hex string',
      );
    }
  }
}