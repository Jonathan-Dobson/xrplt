/**
 * LoanBrokerDelete transaction — delete a loan broker definition.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface LoanBrokerDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanBrokerDelete';
}

export class LoanBrokerDeleteTx extends Transaction {
  override readonly TransactionType = 'LoanBrokerDelete' as const;

  constructor(props: LoanBrokerDeleteTxFields) {
    super({ ...props, TransactionType: 'LoanBrokerDelete' } );
  }

  override validate(): void {
    super.validate();
  }
}
