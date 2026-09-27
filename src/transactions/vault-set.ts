/**
 * VaultSet transaction — update the parameters of a secure vault.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface VaultSetTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultSet';
}

export class VaultSetTx extends Transaction {
  override readonly TransactionType = 'VaultSet' as const;

  static override readonly TRANSACTION_TYPE = 'VaultSet' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: VaultSetTxFields) {
    super({ ...props, TransactionType: 'VaultSet' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
  }
}
