/**
 * Payment transaction — send value (XRP or Issued Currencies) from one account to another.
 *
 * @see https://xrpl.org/payment.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import type { PathStep } from '../types/common.js';
import type { PaymentFlagsInterface } from '../types/flags.js';
import { PaymentTransaction } from '../groups/payment.js';
import { ValidationError } from '../errors.js';
import { isAccount, isAmount } from '../validation/helpers.js';

export interface PaymentTxFields extends BaseTransactionFields {
  readonly TransactionType: 'Payment';
  /** The amount of currency to deliver. */
  readonly Amount: Amount;
  /** The address to receive the funds. */
  readonly Destination: string;
  /** Arbitrary destination tag for the recipient. */
  readonly DestinationTag?: number | undefined;
  /** Hash of a check or other condition for the payment. */
  readonly InvoiceID?: string | undefined;
  /** Minimum amount to deliver (requires tfPartialPayment). */
  readonly DeliverMin?: Amount | undefined;
  /** Payment paths for cross-currency transfers. */
  readonly Paths?: PathStep[][] | undefined;
  /** Maximum amount to spend including fees/slippage. */
  readonly SendMax?: Amount | undefined;
  /** Bit-flags for this transaction. */
  readonly Flags?: number | PaymentFlagsInterface | undefined;
}

export class Payment extends PaymentTransaction {
  override readonly TransactionType = 'Payment' as const;

  /** The amount of currency to deliver. */
  readonly Amount: Amount = undefined as any;

  /** The address to receive the funds. */
  readonly Destination: string = undefined as any;

  readonly DestinationTag?: number | undefined = undefined;
  readonly InvoiceID?: string | undefined = undefined;
  readonly DeliverMin?: Amount | undefined = undefined;
  readonly Paths?: PathStep[][] | undefined = undefined;
  readonly SendMax?: Amount | undefined = undefined;
  declare readonly Flags?: number | PaymentFlagsInterface | undefined;

  static override readonly TRANSACTION_TYPE = 'Payment' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'DeliverMin', 'Destination', 'DestinationTag', 'InvoiceID', 'Paths', 'SendMax'
  ] as const;

  constructor(props: PaymentTxFields) {
    super({ ...props, TransactionType: Payment.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override getAmount(): Amount {
    return this.Amount;
  }

  override getDestination(): string {
    return this.Destination;
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('Payment: missing or invalid Amount');
    if (!isAccount(this.Destination)) throw new ValidationError('Payment: missing or invalid Destination');

    // Partial payment check
    if (this.DeliverMin && !(this.Flags as any)?.tfPartialPayment && (this.Flags as any) !== 0x00020000) {
      throw new ValidationError('Payment: DeliverMin requires tfPartialPayment flag');
    }
  }
}
