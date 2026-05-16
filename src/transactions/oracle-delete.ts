/**
 * OracleDelete transaction — delete an oracle instance from the ledger.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isNumber } from '../validation/helpers.js';

export interface OracleDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'OracleDelete';
  /** Unique identifier for the oracle. */
  readonly OracleDocumentID: number;
}

export class OracleDeleteTx extends Transaction {
  override readonly TransactionType = 'OracleDelete' as const;

  readonly OracleDocumentID: number = undefined as any;

  constructor(props: OracleDeleteTxFields) {
    super({ ...props, TransactionType: 'OracleDelete' } );
    this.OracleDocumentID = props.OracleDocumentID as number;
  }

  override validate(): void {
    super.validate();
    if (!isNumber(this.OracleDocumentID)) throw new ValidationError('OracleDelete: missing or invalid OracleDocumentID');
  }
}
