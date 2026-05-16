/**
 * VaultDelete transaction — delete a secure vault from the ledger.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface VaultDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultDelete';
}

export class VaultDeleteTx extends Transaction {
  override readonly TransactionType = 'VaultDelete' as const;

  constructor(props: VaultDeleteTxFields) {
    super({ ...props, TransactionType: 'VaultDelete' } );
  }

  override validate(): void {
    super.validate();
  }
}
