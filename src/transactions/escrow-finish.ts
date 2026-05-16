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
  readonly TransactionType: 'EscrowFinish';
  /** The address that created the escrow. */
  readonly Owner: string;
  /** The sequence number of the EscrowCreate transaction. */
  readonly OfferSequence: number;
  /** The cryptographic condition fulfillment. */
  readonly Fulfillment?: string | undefined;
  /** The cryptographic condition (must match creation). */
  readonly Condition?: string | undefined;
}

export class EscrowFinishTx extends Transaction {
  override readonly TransactionType = 'EscrowFinish' as const;

  /** Escrow creator. */
  readonly Owner: string = undefined as any;

  /** Sequence number of EscrowCreate. */
  readonly OfferSequence: number = undefined as any;

  readonly Fulfillment?: string | undefined = undefined;
  readonly Condition?: string | undefined = undefined;

  constructor(props: EscrowFinishTxFields) {
    super({ ...props, TransactionType: 'EscrowFinish' } );
    this.Owner = props.Owner as string;
    this.OfferSequence = props.OfferSequence as number;
        this.Fulfillment = props.Fulfillment as any;
    this.Condition = props.Condition as any;
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Owner)) throw new ValidationError('EscrowFinish: missing or invalid Owner');
    if (!isNumber(this.OfferSequence)) throw new ValidationError('EscrowFinish: missing or invalid OfferSequence');
  }
}
