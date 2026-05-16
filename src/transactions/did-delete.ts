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

  constructor(props: DIDDeleteTxFields) {
    super({ ...props, TransactionType: 'DIDDelete' } );
  }

  override validate(): void {
    super.validate();
  }
}
