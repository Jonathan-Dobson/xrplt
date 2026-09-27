/**
 * DelegateSet transaction — authorize another account to perform certain actions on your behalf.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAccount } from '../validation/helpers.js';

export interface DelegateSetTxFields extends BaseTransactionFields {
  readonly TransactionType: 'DelegateSet';
  /** The account to authorize as a delegate. */
  readonly Delegate: string;
}

export class DelegateSetTx extends Transaction {
  override readonly TransactionType = 'DelegateSet' as const;

  /** The account to authorize. */
  override readonly Delegate: string = undefined as any;

  static override readonly TRANSACTION_TYPE = 'DelegateSet' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: DelegateSetTxFields) {
    super({ ...props, TransactionType: DelegateSetTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Delegate)) throw new ValidationError('DelegateSet: missing or invalid Delegate');
  }
}
