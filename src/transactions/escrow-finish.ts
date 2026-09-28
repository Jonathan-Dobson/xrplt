/**
 * EscrowFinish transaction — release XRP from a locked escrow.
 *
 * @see https://xrpl.org/escrowfinish.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAccount, isNumber } from '../validation/helpers.js';

export interface EscrowFinishTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'EscrowFinish';
  /** The address that created the escrow. */
  readonly Owner: string;
  /** The sequence number of the EscrowCreate transaction. */
  readonly OfferSequence: number;
  /** The cryptographic condition fulfillment. */
  readonly Fulfillment?: string | undefined;
  /** The cryptographic condition (must match creation). */
  readonly Condition?: string | undefined;
}

export class EscrowFinish extends Transaction {
  override readonly TransactionType = 'EscrowFinish' as const;

  /** Escrow creator. */
  declare readonly Owner: string;
  /** Sequence number of EscrowCreate. */
  declare readonly OfferSequence: number;
  readonly Fulfillment?: string | undefined = undefined;
  readonly Condition?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'EscrowFinish' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Condition', 'Fulfillment', 'OfferSequence', 'Owner'
  ] as const;

  constructor(props: EscrowFinishTxFields) {
    super({ ...props, TransactionType: EscrowFinish.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Owner)) throw new ValidationError('EscrowFinish: missing or invalid Owner');
    if (!isNumber(this.OfferSequence)) throw new ValidationError('EscrowFinish: missing or invalid OfferSequence');
  }
}
