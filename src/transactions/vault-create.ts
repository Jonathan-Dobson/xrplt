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

  constructor(props: VaultCreateTxFields) {
    super({ ...props, TransactionType: 'VaultCreate' } );
  }

  override validate(): void {
    super.validate();
  }
}
