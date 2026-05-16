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

  constructor(props: VaultSetTxFields) {
    super({ ...props, TransactionType: 'VaultSet' } );
  }

  override validate(): void {
    super.validate();
  }
}
