/**
 * LoanManage transaction — modify an existing Loan object (default,
 * impairment, or unimpairment).
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanmanage
 *
 * Affected amendments:
 *   - `LendingProtocol` (base LoanManage)
 *
 * Validation rules enforced locally:
 *   - `LoanID` required, 64-char hex.
 *   - **Flag exclusivity**: tfLoanImpair and tfLoanUnimpair cannot both
 *     be set in the same tx.
 *
 * Same MPT/Vault/LoanSet flag-derivation gap as elsewhere in the
 * codebase: per-bit booleans are not auto-derived from numeric Flags.
 * Consumers use the numeric Flags field with the enum directly.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import { isHex, isString } from '../validation/helpers.js';

const TF_LOAN_IMPAIR = 0x00020000;
const TF_LOAN_UNIMPAIR = 0x00040000;

export interface LoanManageTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'LoanManage';
  /** The ID of the Loan object to update. 64-char hex. */
  readonly LoanID: string;
}

export class LoanManage extends LoanTransaction {
  override readonly TransactionType = 'LoanManage' as const;

  declare readonly LoanID: string;
  static override readonly TRANSACTION_TYPE = 'LoanManage' as const;
  static override readonly ASSIGNABLE_FIELDS = ['LoanID'] as const;

  constructor(props: LoanManageTxFields) {
    super({ ...props, TransactionType: LoanManage.TRANSACTION_TYPE });
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
        'LoanManage: LoanID must be a 64-character hex string',
      );
    }

    // ── Flag exclusivity: tfLoanImpair + tfLoanUnimpair.
    const flags = (this as unknown as Record<string, unknown>).Flags as
      | number
      | undefined;
    if (typeof flags === 'number' && flags !== 0) {
      const hasImpair = (flags & TF_LOAN_IMPAIR) === TF_LOAN_IMPAIR;
      const hasUnimpair =
        (flags & TF_LOAN_UNIMPAIR) === TF_LOAN_UNIMPAIR;
      if (hasImpair && hasUnimpair) {
        throw new ValidationError(
          'LoanManage: tfLoanImpair and tfLoanUnimpair cannot both be present',
        );
      }
    }
  }
}