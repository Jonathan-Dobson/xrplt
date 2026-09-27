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

  static override readonly TRANSACTION_TYPE = 'LoanBrokerSet' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: LoanBrokerSetTxFields) {
    super({ ...props, TransactionType: LoanBrokerSetTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
  }
}
