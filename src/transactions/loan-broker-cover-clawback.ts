/**
 * LoanBrokerCoverClawback transaction — reclaim coverage assets from a loan broker.
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface LoanBrokerCoverClawbackTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanBrokerCoverClawback';
  /** The amount of coverage asset to claw back. */
  readonly Amount: Amount;
}

export class LoanBrokerCoverClawback extends Transaction {
  override readonly TransactionType = 'LoanBrokerCoverClawback' as const;

  readonly Amount: Amount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'LoanBrokerCoverClawback' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount'
  ] as const;

  constructor(props: LoanBrokerCoverClawbackTxFields) {
    super({ ...props, TransactionType: LoanBrokerCoverClawback.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('LoanBrokerCoverClawback: missing or invalid Amount');
  }
}
