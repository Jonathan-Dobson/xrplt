/**
 * LoanManage transaction — manage the terms or status of an active loan.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isString } from '../validation/helpers.js';

export interface LoanManageTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanManage';
  /** The asset associated with the loan. */
  readonly Asset: string;
}

export class LoanManageTx extends Transaction {
  override readonly TransactionType = 'LoanManage' as const;

  readonly Asset: string = undefined as any;

  constructor(props: LoanManageTxFields) {
    super({ ...props, TransactionType: 'LoanManage' } );
    this.Asset = props.Asset as string;
  }

  override validate(): void {
    super.validate();
    if (!isString(this.Asset)) throw new ValidationError('LoanManage: missing or invalid Asset');
  }
}
