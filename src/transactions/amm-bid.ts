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

export class AMMBid extends AMMTransaction {
  override readonly TransactionType = 'AMMBid' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Asset2: Record<string, unknown> = undefined as any;
  readonly BidMax?: IssuedCurrencyAmount | undefined = undefined;
  readonly BidMin?: IssuedCurrencyAmount | undefined = undefined;
  readonly AuthAccounts?: Record<string, string>[] | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'AMMBid' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Asset', 'Asset2', 'AuthAccounts', 'BidMax', 'BidMin'
  ] as const;

  constructor(props: AMMBidTxFields) {
    super({ ...props, TransactionType: AMMBid.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('AMMBid: missing or invalid Asset');
    if (this.BidMax && !isAmount(this.BidMax)) throw new ValidationError('AMMBid: invalid BidMax');
    if (this.BidMin && !isAmount(this.BidMin)) throw new ValidationError('AMMBid: invalid BidMin');
  }
}
