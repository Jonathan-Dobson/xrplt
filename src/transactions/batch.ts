/**
 * Batch transaction — submit multiple transactions in a single atomic bundle.
 *
 * @see https://xrpl.org/batch.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isArray } from '../validation/helpers.js';

export interface BatchTxFields extends BaseTransactionFields {
  readonly TransactionType: 'Batch';
  /** Array of transactions to execute. */
  readonly Transactions: any[];
}

export class BatchTx extends Transaction {
  override readonly TransactionType = 'Batch' as const;

  /** Array of transactions to execute. */
  readonly Transactions: any[] = undefined as any;

  constructor(props: BatchTxFields) {
    super({ ...props, TransactionType: 'Batch' } );
    this.Transactions = props.Transactions as any[];
  }

  override validate(): void {
    super.validate();
    if (!isArray(this.Transactions) || this.Transactions.length === 0) {
      throw new ValidationError('Batch: Transactions must be a non-empty array');
    }
  }
}
