/**
 * PaymentChannelClaim transaction — claim XRP from a payment channel.
 *
 * @see https://xrpl.org/paymentchannelclaim.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isString } from '../validation/helpers.js';

export interface PaymentChannelClaimTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'PaymentChannelClaim';
  /** The unique ID of the channel. */
  readonly Channel: string;
  /** Total amount to claim from the channel. */
  readonly Amount?: Amount | undefined;
  /** Cumulative amount authorized by the signature. */
  readonly Balance?: Amount | undefined;
  /** Public key used for the signature. */
  readonly PublicKey?: string | undefined;
  /** Signature for the authorized amount. */
  readonly Signature?: string | undefined;
}

export class PaymentChannelClaim extends Transaction {
  override readonly TransactionType = 'PaymentChannelClaim' as const;

  /** The unique ID of the channel. */
  readonly Channel: string = undefined as any;

  readonly Amount?: Amount | undefined = undefined;
  readonly Balance?: Amount | undefined = undefined;
  readonly PublicKey?: string | undefined = undefined;
  readonly Signature?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'PaymentChannelClaim' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'Balance', 'Channel', 'PublicKey', 'Signature'
  ] as const;

  constructor(props: PaymentChannelClaimTxFields) {
    super({ ...props, TransactionType: PaymentChannelClaim.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isString(this.Channel)) throw new ValidationError('PaymentChannelClaim: missing or invalid Channel');
  }
}
