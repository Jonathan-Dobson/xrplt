/**
 * TrustSet transaction — create, modify, or delete a trust line for Issued Currencies.
 *
 * @see https://xrpl.org/trustset.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { IssuedCurrencyAmount } from '../types/amounts.js';
import type { TrustSetFlagsInterface } from '../types/flags.js';
import { TokenTransaction } from '../groups/token.js';

import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface TrustSetTxFields extends BaseTransactionFields {
  readonly TransactionType: 'TrustSet';
  /** The limit and currency for the trust line. */
  readonly LimitAmount: IssuedCurrencyAmount;
  /** Quality of incoming liquidity (default 0 = 100%). */
  readonly QualityIn?: number | undefined;
  /** Quality of outgoing liquidity (default 0 = 100%). */
  readonly QualityOut?: number | undefined;
  /** Bit-flags for this transaction. */
  readonly Flags?: number | TrustSetFlagsInterface | undefined;
}

export class TrustSetTx extends TokenTransaction {
  override readonly TransactionType = 'TrustSet' as const;

  /** The limit and currency for the trust line. */
  readonly LimitAmount: IssuedCurrencyAmount = undefined as any;

  readonly QualityIn?: number | undefined = undefined;
  readonly QualityOut?: number | undefined = undefined;
  declare readonly Flags?: number | TrustSetFlagsInterface | undefined;

  constructor(props: TrustSetTxFields) {
    super({ ...props, TransactionType: 'TrustSet' } );
    this.LimitAmount = props.LimitAmount as IssuedCurrencyAmount;
        this.QualityIn = props.QualityIn as any;
    this.QualityOut = props.QualityOut as any;
    this.Flags = props.Flags as any;
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isAmount(this.LimitAmount)) {
      throw new ValidationError('TrustSet: missing or invalid LimitAmount');
    }
  }
}
