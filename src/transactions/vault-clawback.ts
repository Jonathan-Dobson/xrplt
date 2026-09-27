/**
 * VaultClawback transaction — reclaim assets from a secure vault.
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface VaultClawbackTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultClawback';
  /** The amount to claw back. */
  readonly Amount: Amount;
}

export class VaultClawback extends Transaction {
  override readonly TransactionType = 'VaultClawback' as const;

  /** The amount to claw back. */
  readonly Amount: Amount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'VaultClawback' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount'
  ] as const;

  constructor(props: VaultClawbackTxFields) {
    super({ ...props, TransactionType: VaultClawback.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('VaultClawback: missing or invalid Amount');
  }
}
