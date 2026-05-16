/**
 * LoanSet transaction — create or update a loan agreement.
 *
 * @see https://xrpl.org/loanset.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isRecord, isAmount } from '../validation/helpers.js';

export interface LoanSetTxFields extends BaseTransactionFields {
  readonly TransactionType: 'LoanSet';
  /** The asset to be loaned. */
  readonly Asset: Record<string, unknown>;
  /** The amount of the loan. */
  readonly Amount: Amount;
  /** Interest rate in basis points. */
  readonly InterestRate: number;
}

export class LoanSetTx extends Transaction {
  override readonly TransactionType = 'LoanSet' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Amount: Amount = undefined as any;
  readonly InterestRate: number = undefined as any;

  constructor(props: LoanSetTxFields) {
    super({ ...props, TransactionType: 'LoanSet' } );
    this.Asset = props.Asset as Record<string, unknown>;
    this.Amount = props.Amount as Amount;
    this.InterestRate = props.InterestRate as number;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('LoanSet: missing or invalid Asset');
    if (!isAmount(this.Amount)) throw new ValidationError('LoanSet: missing or invalid Amount');
  }
}
