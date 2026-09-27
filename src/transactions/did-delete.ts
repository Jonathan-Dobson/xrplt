/**
 * DIDDelete transaction — delete a Decentralized Identifier (DID) entry from the ledger.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface DIDDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'DIDDelete';
}

export class DIDDeleteTx extends Transaction {
  override readonly TransactionType = 'DIDDelete' as const;

  static override readonly TRANSACTION_TYPE = 'DIDDelete' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: DIDDeleteTxFields) {
    super({ ...props, TransactionType: DIDDeleteTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
  }
}
