/**
 * EscrowCreate transaction — lock up XRP until a condition is met or time expires.
 *
 * @see https://xrpl.org/escrowcreate.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { PaymentTransaction } from '../groups/payment.js';

import { ValidationError } from '../errors.js';
import { isAccount, isAmount, isString } from '../validation/helpers.js';
import type { Amount } from '../types/amounts.js';

export interface EscrowCreateTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'EscrowCreate';
  /** Amount of XRP to lock in the escrow. */
  readonly Amount: string;
  /** Address to receive the XRP when finished. */
  readonly Destination: string;
  /** Time after which the escrow is no longer valid. */
  readonly CancelAfter?: number | undefined;
  /** Time after which the escrow can be finished. */
  readonly FinishAfter?: number | undefined;
  /** Cryptographic condition that must be met to finish. */
  readonly Condition?: string | undefined;
  /** Destination tag for the recipient. */
  readonly DestinationTag?: number | undefined;
}

export class EscrowCreate extends PaymentTransaction {
  override readonly TransactionType = 'EscrowCreate' as const;

  /** Amount of XRP to lock. */
  declare readonly Amount: string;
  /** Destination address. */
  declare readonly Destination: string;
  readonly CancelAfter?: number | undefined = undefined;
  readonly FinishAfter?: number | undefined = undefined;
  readonly Condition?: string | undefined = undefined;
  readonly DestinationTag?: number | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'EscrowCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'CancelAfter', 'Condition', 'Destination', 'DestinationTag', 'FinishAfter'
  ] as const;

  constructor(props: EscrowCreateTxFields) {
    super({ ...props, TransactionType: EscrowCreate.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override getAmount(): Amount { return this.Amount; }
  override getDestination(): string { return this.Destination; }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('EscrowCreate: missing or invalid Amount');
    if (!isAccount(this.Destination)) throw new ValidationError('EscrowCreate: missing or invalid Destination');
    if (this.CancelAfter === undefined && this.FinishAfter === undefined) {
      throw new ValidationError('EscrowCreate: must specify CancelAfter or FinishAfter');
    }
    if (this.Condition !== undefined && !isString(this.Condition)) {
      throw new ValidationError('EscrowCreate: Condition must be a string');
    }
  }
}
