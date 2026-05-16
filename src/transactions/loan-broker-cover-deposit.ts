/**
 * LoanBrokerCoverDeposit transaction — deposit coverage assets into a loan broker account.
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface LoanBrokerCoverDepositTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanBrokerCoverDeposit';
  /** The amount to deposit. */
  readonly Amount: Amount;
}

export class LoanBrokerCoverDepositTx extends Transaction {
  override readonly TransactionType = 'LoanBrokerCoverDeposit' as const;

  readonly Amount: Amount = undefined as any;

  constructor(props: LoanBrokerCoverDepositTxFields) {
    super({ ...props, TransactionType: 'LoanBrokerCoverDeposit' } );
    this.Amount = props.Amount as Amount;
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('LoanBrokerCoverDeposit: missing or invalid Amount');
  }
}
