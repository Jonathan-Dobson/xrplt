/**
 * PaymentChannelFund transaction — add XRP to an existing payment channel.
 *
 * @see https://xrpl.org/paymentchannelfund.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAmount, isString } from '../validation/helpers.js';

export interface PaymentChannelFundTxFields extends BaseTransactionFields {
  readonly TransactionType: 'PaymentChannelFund';
  /** The unique ID of the channel to fund. */
  readonly Channel: string;
  /** Amount of XRP to add to the channel. */
  readonly Amount: Amount;
  /** New expiration time for the channel. */
  readonly Expiration?: number | undefined;
}

export class PaymentChannelFundTx extends Transaction {
  override readonly TransactionType = 'PaymentChannelFund' as const;

  /** The unique ID of the channel. */
  readonly Channel: string = undefined as any;

  /** Amount of XRP to add. */
  readonly Amount: Amount = undefined as any;

  readonly Expiration?: number | undefined = undefined;

  constructor(props: PaymentChannelFundTxFields) {
    super({ ...props, TransactionType: 'PaymentChannelFund' } );
    this.Channel = props.Channel as string;
    this.Amount = props.Amount as Amount;
        this.Expiration = props.Expiration as any;
  }

  override validate(): void {
    super.validate();
    if (!isString(this.Channel)) throw new ValidationError('PaymentChannelFund: missing or invalid Channel');
    if (!isAmount(this.Amount)) throw new ValidationError('PaymentChannelFund: missing or invalid Amount');
  }
}
