/**
 * LoanBrokerDelete transaction — delete a loan broker definition.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface LoanBrokerDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanBrokerDelete';
}

export class LoanBrokerDelete extends Transaction {
  override readonly TransactionType = 'LoanBrokerDelete' as const;

  static override readonly TRANSACTION_TYPE = 'LoanBrokerDelete' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: LoanBrokerDeleteTxFields) {
    super({ ...props, TransactionType: LoanBrokerDelete.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
  }
}
