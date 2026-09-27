/**
 * NFTokenCreateOffer transaction — create an offer to buy or sell an NFToken.
 *
 * @see https://xrpl.org/nftokencreateoffer.html
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import type { NFTokenCreateOfferFlagsInterface } from '../types/flags.js';
import { TokenTransaction } from '../groups/token.js';

import { ValidationError } from '../errors.js';
import { isString, isAmount, isAccount, isNumber } from '../validation/helpers.js';

export interface NFTokenCreateOfferTxFields extends BaseTransactionFields {
  readonly TransactionType: 'NFTokenCreateOffer';
  /** The unique identifier of the NFToken. */
  readonly NFTokenID: string;
  /** The price for the token. */
  readonly Amount: Amount;
  /** The account that currently owns the token (required for Buy offers). */
  readonly Owner?: string | undefined;
  /** Time after which the offer is no longer valid. */
  readonly Expiration?: number | undefined;
  /** The specific account allowed to accept this offer. */
  readonly Destination?: string | undefined;
  /** Bit-flags for this transaction (e.g. tfSellNFToken). */
  readonly Flags?: number | NFTokenCreateOfferFlagsInterface | undefined;
}

export class NFTokenCreateOfferTx extends TokenTransaction {
  override readonly TransactionType = 'NFTokenCreateOffer' as const;

  /** The unique identifier of the NFToken. */
  readonly NFTokenID: string = undefined as any;

  /** The price for the token. */
  readonly Amount: Amount = undefined as any;

  readonly Owner?: string | undefined = undefined;
  readonly Expiration?: number | undefined = undefined;
  readonly Destination?: string | undefined = undefined;
  declare readonly Flags?: number | NFTokenCreateOfferFlagsInterface | undefined;

  static override readonly TRANSACTION_TYPE = 'NFTokenCreateOffer' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'Destination', 'Expiration', 'NFTokenID', 'Owner'
  ] as const;

  constructor(props: NFTokenCreateOfferTxFields) {
    super({ ...props, TransactionType: NFTokenCreateOfferTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isString(this.NFTokenID))
      throw new ValidationError('NFTokenCreateOffer: missing NFTokenID');
    if (!isAmount(this.Amount))
      throw new ValidationError('NFTokenCreateOffer: invalid Amount');
    if (this.Owner !== undefined && !isAccount(this.Owner))
      throw new ValidationError('NFTokenCreateOffer: invalid Owner');
    if (this.Expiration !== undefined && !isNumber(this.Expiration))
      throw new ValidationError('NFTokenCreateOffer: Expiration must be a number');
    if (this.Destination !== undefined && !isAccount(this.Destination))
      throw new ValidationError('NFTokenCreateOffer: invalid Destination');
  }
}
