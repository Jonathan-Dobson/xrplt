/**
 * DIDSet transaction — create or update a Decentralized Identifier (DID) entry on the ledger.
 *
 * @see https://xrpl.org/didset.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';

export interface DIDSetTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'DIDSet';
  /** The DID document (hex encoded). */
  readonly Data?: string | undefined;
  /** The DID URI. */
  readonly DIDDocument?: string | undefined;
  /** The public key associated with the DID. */
  readonly URI?: string | undefined;
}

export class DIDSet extends Transaction {
  override readonly TransactionType = 'DIDSet' as const;

  readonly Data?: string | undefined = undefined;
  readonly DIDDocument?: string | undefined = undefined;
  readonly URI?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'DIDSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'DIDDocument', 'Data', 'URI'
  ] as const;

  constructor(props: DIDSetTxFields) {
    super({ ...props, TransactionType: DIDSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (this.Data === undefined && this.DIDDocument === undefined && this.URI === undefined) {
      throw new ValidationError('DIDSet: must specify at least one of Data, DIDDocument, or URI');
    }
  }
}
