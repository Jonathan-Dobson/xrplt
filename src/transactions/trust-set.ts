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
  readonly TransactionType?: 'TrustSet';
  /** The limit and currency for the trust line. */
  readonly LimitAmount: IssuedCurrencyAmount;
  /** Quality of incoming liquidity (default 0 = 100%). */
  readonly QualityIn?: number | undefined;
  /** Quality of outgoing liquidity (default 0 = 100%). */
  readonly QualityOut?: number | undefined;
  /** Bit-flags for this transaction. */
  readonly Flags?: number | TrustSetFlagsInterface | undefined;
}

export class TrustSet extends TokenTransaction {
  override readonly TransactionType = 'TrustSet' as const;

  /** The limit and currency for the trust line. */
  readonly LimitAmount: IssuedCurrencyAmount = undefined as any;

  readonly QualityIn?: number | undefined = undefined;
  readonly QualityOut?: number | undefined = undefined;
  declare readonly Flags?: number | TrustSetFlagsInterface | undefined;

  static override readonly TRANSACTION_TYPE = 'TrustSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'LimitAmount', 'QualityIn', 'QualityOut'
  ] as const;

  constructor(props: TrustSetTxFields) {
    super({ ...props, TransactionType: TrustSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isAmount(this.LimitAmount)) {
      throw new ValidationError('TrustSet: missing or invalid LimitAmount');
    }
  }
}
