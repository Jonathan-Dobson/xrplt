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

export class Batch extends Transaction {
  override readonly TransactionType = 'Batch' as const;

  /** Array of transactions to execute. */
  readonly Transactions: any[] = undefined as any;

  static override readonly TRANSACTION_TYPE = 'Batch' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Transactions'
  ] as const;

  constructor(props: BatchTxFields) {
    super({ ...props, TransactionType: Batch.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isArray(this.Transactions) || this.Transactions.length === 0) {
      throw new ValidationError('Batch: Transactions must be a non-empty array');
    }
  }
}
