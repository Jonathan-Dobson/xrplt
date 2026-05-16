/**
 * LoanBrokerSet transaction — define or update a loan broker.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface LoanBrokerSetTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanBrokerSet';
}

export class LoanBrokerSetTx extends Transaction {
  override readonly TransactionType = 'LoanBrokerSet' as const;

  constructor(props: LoanBrokerSetTxFields) {
    super({ ...props, TransactionType: 'LoanBrokerSet' } );
  }

  override validate(): void {
    super.validate();
  }
}
