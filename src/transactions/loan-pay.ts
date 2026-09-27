/**
 * LoanPay transaction — make a payment towards an active loan.
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface LoanPayTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanPay';
  /** The amount to pay. */
  readonly Amount: Amount;
}

export class LoanPay extends Transaction {
  override readonly TransactionType = 'LoanPay' as const;

  readonly Amount: Amount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'LoanPay' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount'
  ] as const;

  constructor(props: LoanPayTxFields) {
    super({ ...props, TransactionType: LoanPay.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('LoanPay: missing or invalid Amount');
  }
}
