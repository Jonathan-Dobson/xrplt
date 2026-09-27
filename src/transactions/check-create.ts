/**
 * CheckCreate transaction — create a check that can be cashed by a specific destination.
 *
 * @see https://xrpl.org/checkcreate.html
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAccount, isAmount, isNumber, isString } from '../validation/helpers.js';

export interface CheckCreateTxFields extends BaseTransactionFields {
  readonly TransactionType: 'CheckCreate';
  /** The address that can cash the check. */
  readonly Destination: string;
  /** Maximum amount the check can be cashed for. */
  readonly SendMax: Amount;
  /** Arbitrary destination tag for the recipient. */
  readonly DestinationTag?: number | undefined;
  /** Time after which the check is no longer valid. */
  readonly Expiration?: number | undefined;
  /** Arbitrary identifier for the check. */
  readonly InvoiceID?: string | undefined;
}

export class CheckCreateTx extends Transaction {
  override readonly TransactionType = 'CheckCreate' as const;

  /** The address that can cash the check. */
  readonly Destination: string = undefined as any;

  /** Maximum amount the check can be cashed for. */
  readonly SendMax: Amount = undefined as any;

  readonly DestinationTag?: number | undefined = undefined;
  readonly Expiration?: number | undefined = undefined;
  readonly InvoiceID?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'CheckCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Destination', 'DestinationTag', 'Expiration', 'InvoiceID', 'SendMax'
  ] as const;

  constructor(props: CheckCreateTxFields) {
    super({ ...props, TransactionType: CheckCreateTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Destination)) throw new ValidationError('CheckCreate: missing or invalid Destination');
    if (!isAmount(this.SendMax)) throw new ValidationError('CheckCreate: missing or invalid SendMax');
    if (this.Expiration !== undefined && !isNumber(this.Expiration)) throw new ValidationError('CheckCreate: Expiration must be a number');
    if (this.InvoiceID !== undefined && !isString(this.InvoiceID)) throw new ValidationError('CheckCreate: InvoiceID must be a string');
  }
}
