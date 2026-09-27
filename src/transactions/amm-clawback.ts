/**
 * AMMClawback transaction — claw back liquidity from an Automated Market Maker.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import type { ClawbackFlagsInterface } from '../types/flags.js';
import { AMMTransaction } from '../groups/amm.js';

import { ValidationError } from '../errors.js';
import { isAmount, isAccount } from '../validation/helpers.js';

export interface AMMClawbackTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AMMClawback';
  readonly Asset: { currency: string; issuer?: string };
  readonly Asset2: { currency: string; issuer?: string };
  readonly Holder: string;
  readonly Amount?: Amount | undefined;
  readonly Flags?: number | ClawbackFlagsInterface | undefined;
}

export class AMMClawbackTx extends AMMTransaction {
  override readonly TransactionType = 'AMMClawback' as const;
  readonly Asset!: { currency: string; issuer?: string };
  readonly Asset2!: { currency: string; issuer?: string };
  readonly Holder!: string;
  readonly Amount?: Amount | undefined;
  declare readonly Flags?: number | ClawbackFlagsInterface | undefined;

  static override readonly TRANSACTION_TYPE = 'AMMClawback' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Asset'
  ] as const;

  constructor(props: AMMClawbackTxFields) {
    super({ ...props, TransactionType: 'AMMClawback' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!this.Asset) throw new ValidationError('AMMClawback: missing Asset');
    if (!this.Asset2) throw new ValidationError('AMMClawback: missing Asset2');
    if (!isAccount(this.Holder)) throw new ValidationError('AMMClawback: invalid Holder');
    if (this.Amount !== undefined && !isAmount(this.Amount))
      throw new ValidationError('AMMClawback: invalid Amount');
  }
}
