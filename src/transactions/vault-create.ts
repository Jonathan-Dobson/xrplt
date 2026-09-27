/**
 * VaultCreate transaction — create a new secure vault for asset storage.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface VaultCreateTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultCreate';
}

export class VaultCreateTx extends Transaction {
  override readonly TransactionType = 'VaultCreate' as const;

  static override readonly TRANSACTION_TYPE = 'VaultCreate' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: VaultCreateTxFields) {
    super({ ...props, TransactionType: VaultCreateTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
  }
}
