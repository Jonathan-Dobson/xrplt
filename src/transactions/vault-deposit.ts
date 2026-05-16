/**
 * VaultDeposit transaction — deposit assets into an existing vault.
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface VaultDepositTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultDeposit';
  /** The amount of asset to deposit. */
  readonly Amount: Amount;
}

export class VaultDepositTx extends Transaction {
  override readonly TransactionType = 'VaultDeposit' as const;

  /** The amount to deposit. */
  readonly Amount: Amount = undefined as any;

  constructor(props: VaultDepositTxFields) {
    super({ ...props, TransactionType: 'VaultDeposit' } );
    this.Amount = props.Amount as Amount;
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('VaultDeposit: missing or invalid Amount');
  }
}
