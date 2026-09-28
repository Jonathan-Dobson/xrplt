/**
 * LoanBrokerDelete transaction — delete an existing LoanBroker ledger entry.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanbrokerdelete
 * @see https://xrpl.org/docs/concepts/tokens/lending-protocol
 *
 * Affected amendments:
 *   - `LendingProtocol` (base LoanBrokerDelete)
 *
 * Validation rules enforced locally:
 *   - `LoanBrokerID` required, 64-char hex (ledger entry ID).
 *
 * LoanBrokerDelete has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import { isHex, isString } from '../validation/helpers.js';

export interface LoanBrokerDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'LoanBrokerDelete';
  /** The Loan Broker ID to delete. 64-char hex. */
  readonly LoanBrokerID: string;
}

export class LoanBrokerDelete extends LoanTransaction {
  override readonly TransactionType = 'LoanBrokerDelete' as const;

  readonly LoanBrokerID: string = undefined as any;

  static override readonly TRANSACTION_TYPE = 'LoanBrokerDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = ['LoanBrokerID'] as const;

  constructor(props: LoanBrokerDeleteTxFields) {
    super({ ...props, TransactionType: LoanBrokerDelete.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    if (
      !isString(this.LoanBrokerID) ||
      !isHex(this.LoanBrokerID) ||
      this.LoanBrokerID.length !== 64
    ) {
      throw new ValidationError(
        'LoanBrokerDelete: LoanBrokerID must be a 64-character hex string',
      );
    }
  }
}