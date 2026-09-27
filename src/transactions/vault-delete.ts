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

  static override readonly TRANSACTION_TYPE = 'VaultDelete' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: VaultDeleteTxFields) {
    super({ ...props, TransactionType: VaultDeleteTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
  }
}
