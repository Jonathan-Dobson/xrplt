/**
 * OracleDelete transaction — delete an oracle instance from the ledger.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isNumber } from '../validation/helpers.js';

export interface OracleDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'OracleDelete';
  /** Unique identifier for the oracle. */
  readonly OracleDocumentID: number;
}

export class OracleDelete extends Transaction {
  override readonly TransactionType = 'OracleDelete' as const;

  declare readonly OracleDocumentID: number;
  static override readonly TRANSACTION_TYPE = 'OracleDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'OracleDocumentID'
  ] as const;

  constructor(props: OracleDeleteTxFields) {
    super({ ...props, TransactionType: OracleDelete.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isNumber(this.OracleDocumentID)) throw new ValidationError('OracleDelete: missing or invalid OracleDocumentID');
  }
}
