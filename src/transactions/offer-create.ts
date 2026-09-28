/**
 * OfferCreate transaction — place a limit order on the Decentralized Exchange (DEX).
 *
 * @see https://xrpl.org/offercreate.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import type { OfferCreateFlagsInterface } from '../types/flags.js';
import { OfferTransaction } from '../groups/offer.js';

import { ValidationError } from '../errors.js';
import { isAmount, isString } from '../validation/helpers.js';

export interface OfferCreateTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'OfferCreate';
  /** The amount to deliver to the order book. */
  readonly TakerGets: Amount;
  /** The amount requested in exchange. */
  readonly TakerPays: Amount;
  /** Time after which the offer is no longer valid. */
  readonly Expiration?: number | undefined;
  /** Offer sequence to cancel when placing this one. */
  readonly OfferSequence?: number | undefined;
  /** Identifier for a domain (required for tfHybrid). */
  readonly DomainID?: string | undefined;
  /** Bit-flags for this transaction. */
  readonly Flags?: number | OfferCreateFlagsInterface | undefined;
}

export class OfferCreate extends OfferTransaction {
  override readonly TransactionType = 'OfferCreate' as const;

  /** The amount to deliver to the order book. */
  readonly TakerGets: Amount = undefined as any;

  /** The amount requested in exchange. */
  readonly TakerPays: Amount = undefined as any;

  readonly Expiration?: number | undefined = undefined;
  readonly OfferSequence?: number | undefined = undefined;
  readonly DomainID?: string | undefined = undefined;
  declare readonly Flags?: number | OfferCreateFlagsInterface | undefined;

  static override readonly TRANSACTION_TYPE = 'OfferCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'DomainID', 'Expiration', 'OfferSequence', 'TakerGets', 'TakerPays'
  ] as const;

  constructor(props: OfferCreateTxFields) {
    super({ ...props, TransactionType: OfferCreate.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.TakerGets)) throw new ValidationError('OfferCreate: missing or invalid TakerGets');
    if (!isAmount(this.TakerPays)) throw new ValidationError('OfferCreate: missing or invalid TakerPays');
    
    // Check tfHybrid validation
    const flags = this.Flags as any;
    const isHybrid = flags?.tfHybrid || flags === 0x00400000;
    if (isHybrid && !this.DomainID) {
      throw new ValidationError('OfferCreate: tfHybrid requires DomainID');
    }
    if (this.DomainID && !isString(this.DomainID)) {
      throw new ValidationError('OfferCreate: DomainID must be a string');
    }
  }
}
