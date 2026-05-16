/**
 * OfferCancel transaction — cancel an existing DEX offer.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { OfferTransaction } from '../groups/offer.js';
import { ValidationError } from '../errors.js';
import { isNumber } from '../validation/helpers.js';

export interface OfferCancelTxFields extends BaseTransactionFields {
  readonly TransactionType: 'OfferCancel';
  readonly OfferSequence: number;
}

export class OfferCancelTx extends OfferTransaction {
  override readonly TransactionType = 'OfferCancel' as const;
  readonly OfferSequence: number = undefined as any;

  constructor(props: OfferCancelTxFields) {
    super({ ...props, TransactionType: 'OfferCancel' } );
    this.OfferSequence = props.OfferSequence as number;
  }

  override validate(): void {
    super.validate();
    if (!isNumber(this.OfferSequence)) {
      throw new ValidationError('OfferCancel: missing or invalid OfferSequence');
    }
  }
}
