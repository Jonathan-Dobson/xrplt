/**
 * LoanBrokerCoverWithdraw transaction — withdraw coverage assets from a loan broker account.
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface LoanBrokerCoverWithdrawTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'LoanBrokerCoverWithdraw';
  /** The amount to withdraw. */
  readonly Amount: Amount;
}

export class LoanBrokerCoverWithdraw extends Transaction {
  override readonly TransactionType = 'LoanBrokerCoverWithdraw' as const;

  readonly Amount: Amount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'LoanBrokerCoverWithdraw' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount'
  ] as const;

  constructor(props: LoanBrokerCoverWithdrawTxFields) {
    super({ ...props, TransactionType: LoanBrokerCoverWithdraw.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('LoanBrokerCoverWithdraw: missing or invalid Amount');
  }
}
