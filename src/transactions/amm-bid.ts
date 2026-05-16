/**
 * AMMBid transaction — bid on an auction for an AMM instance's trading fee.
 *
 * @see https://xrpl.org/ammbid.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { IssuedCurrencyAmount } from '../types/amounts.js';
import { AMMTransaction } from '../groups/amm.js';

import { ValidationError } from '../errors.js';
import { isRecord, isAmount } from '../validation/helpers.js';

export interface AMMBidTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AMMBid';
  readonly Asset: Record<string, unknown>;
  readonly Asset2: Record<string, unknown>;
  /** Max amount of LP tokens to spend. */
  readonly BidMax?: IssuedCurrencyAmount | undefined;
  /** Fixed amount of LP tokens to spend. */
  readonly BidMin?: IssuedCurrencyAmount | undefined;
  /** Accounts allowed to use the fee discount. */
  readonly AuthAccounts?: Record<string, string>[] | undefined;
}

export class AMMBidTx extends AMMTransaction {
  override readonly TransactionType = 'AMMBid' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Asset2: Record<string, unknown> = undefined as any;
  readonly BidMax?: IssuedCurrencyAmount | undefined = undefined;
  readonly BidMin?: IssuedCurrencyAmount | undefined = undefined;
  readonly AuthAccounts?: Record<string, string>[] | undefined = undefined;

  constructor(props: AMMBidTxFields) {
    super({ ...props, TransactionType: 'AMMBid' } );
    this.Asset = props.Asset as Record<string, unknown>;
        this.Asset2 = props.Asset2 as any;
    this.BidMax = props.BidMax as any;
    this.BidMin = props.BidMin as any;
    this.AuthAccounts = props.AuthAccounts as any;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('AMMBid: missing or invalid Asset');
    if (this.BidMax && !isAmount(this.BidMax)) throw new ValidationError('AMMBid: invalid BidMax');
    if (this.BidMin && !isAmount(this.BidMin)) throw new ValidationError('AMMBid: invalid BidMin');
  }
}
