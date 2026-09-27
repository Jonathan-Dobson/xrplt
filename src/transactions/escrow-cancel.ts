/**
 * EscrowCancel transaction — cancel an escrow that has passed its expiration time.
 *
 * @see https://xrpl.org/escrowcancel.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAccount, isNumber } from '../validation/helpers.js';

export interface EscrowCancelTxFields extends BaseTransactionFields {
  readonly TransactionType: 'EscrowCancel';
  /** The address that created the escrow. */
  readonly Owner: string;
  /** The sequence number of the EscrowCreate transaction. */
  readonly OfferSequence: number;
}

export class EscrowCancelTx extends Transaction {
  override readonly TransactionType = 'EscrowCancel' as const;

  /** The address that created the escrow. */
  readonly Owner: string = undefined as any;

  /** The sequence number of the EscrowCreate transaction. */
  readonly OfferSequence: number = undefined as any;

  static override readonly TRANSACTION_TYPE = 'EscrowCancel' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'OfferSequence', 'Owner'
  ] as const;

  constructor(props: EscrowCancelTxFields) {
    super({ ...props, TransactionType: EscrowCancelTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Owner)) throw new ValidationError('EscrowCancel: missing or invalid Owner');
    if (!isNumber(this.OfferSequence)) throw new ValidationError('EscrowCancel: missing or invalid OfferSequence');
  }
}
