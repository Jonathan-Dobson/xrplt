/**
 * OfferCancel transaction — cancel an existing DEX offer.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { OfferTransaction } from '../groups/offer.js';
import { ValidationError } from '../errors.js';
import { isNumber } from '../validation/helpers.js';

export interface OfferCancelTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'OfferCancel';
  readonly OfferSequence: number;
}

export class OfferCancel extends OfferTransaction {
  override readonly TransactionType = 'OfferCancel' as const;
  readonly OfferSequence: number = undefined as any;

  static override readonly TRANSACTION_TYPE = 'OfferCancel' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'OfferSequence'
  ] as const;

  constructor(props: OfferCancelTxFields) {
    super({ ...props, TransactionType: OfferCancel.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isNumber(this.OfferSequence)) {
      throw new ValidationError('OfferCancel: missing or invalid OfferSequence');
    }
  }
}
