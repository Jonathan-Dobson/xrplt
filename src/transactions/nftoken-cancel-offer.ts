/**
 * NFTokenCancelOffer transaction — cancel one or more existing NFT offers.
 *
 * @see https://xrpl.org/nftokencanceloffer.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isArray } from '../validation/helpers.js';

export interface NFTokenCancelOfferTxFields extends BaseTransactionFields {
  readonly TransactionType: 'NFTokenCancelOffer';
  /** Array of NFToken Offer IDs to cancel. */
  readonly NFTokenOffers: string[];
}

export class NFTokenCancelOfferTx extends TokenTransaction {
  override readonly TransactionType = 'NFTokenCancelOffer' as const;

  /** Array of NFToken Offer IDs to cancel. */
  readonly NFTokenOffers: string[] = undefined as any;

  constructor(props: NFTokenCancelOfferTxFields) {
    super({ ...props, TransactionType: 'NFTokenCancelOffer' } );
    this.NFTokenOffers = props.NFTokenOffers as string[];
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isArray(this.NFTokenOffers) || this.NFTokenOffers.length === 0) {
      throw new ValidationError('NFTokenCancelOffer: NFTokenOffers must be a non-empty array');
    }
  }
}
