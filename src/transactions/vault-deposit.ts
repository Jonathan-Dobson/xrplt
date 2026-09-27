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

  static override readonly TRANSACTION_TYPE = 'VaultDeposit' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount'
  ] as const;

  constructor(props: VaultDepositTxFields) {
    super({ ...props, TransactionType: 'VaultDeposit' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('VaultDeposit: missing or invalid Amount');
  }
}
