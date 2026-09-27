/**
 * CheckCancel transaction — cancel an existing check.
 *
 * @see https://xrpl.org/checkcancel.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isString } from '../validation/helpers.js';

export interface CheckCancelTxFields extends BaseTransactionFields {
  readonly TransactionType: 'CheckCancel';
  /** The ID of the check to cancel. */
  readonly CheckID: string;
}

export class CheckCancelTx extends Transaction {
  override readonly TransactionType = 'CheckCancel' as const;

  /** The ID of the check to cancel. */
  readonly CheckID: string = undefined as any;

  static override readonly TRANSACTION_TYPE = 'CheckCancel' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'CheckID'
  ] as const;

  constructor(props: CheckCancelTxFields) {
    super({ ...props, TransactionType: CheckCancelTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isString(this.CheckID)) throw new ValidationError('CheckCancel: missing or invalid CheckID');
  }
}
