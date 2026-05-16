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

  constructor(props: AMMClawbackTxFields) {
    super({ ...props, TransactionType: 'AMMClawback' } );
    this.Asset = props.Asset as { currency: string; issuer?: string };
    this.Asset2 = props.Asset2 as { currency: string; issuer?: string };
    this.Holder = props.Holder as string;
        this.Amount = props.Amount as any;
    this.Flags = props.Flags as any;
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
