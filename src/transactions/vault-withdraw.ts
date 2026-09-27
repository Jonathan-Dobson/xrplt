/**
 * VaultWithdraw transaction — request a withdrawal from a secure vault.
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface VaultWithdrawTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultWithdraw';
  /** The amount of asset to withdraw. */
  readonly Amount: Amount;
}

export class VaultWithdrawTx extends Transaction {
  override readonly TransactionType = 'VaultWithdraw' as const;

  /** The amount to withdraw. */
  readonly Amount: Amount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'VaultWithdraw' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount'
  ] as const;

  constructor(props: VaultWithdrawTxFields) {
    super({ ...props, TransactionType: VaultWithdrawTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('VaultWithdraw: missing or invalid Amount');
  }
}
