/**
 * TicketCreate transaction — create one or more Tickets for sequence-independent transaction submission.
 *
 * @see https://xrpl.org/ticketcreate.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isNumber } from '../validation/helpers.js';

export interface TicketCreateTxFields extends BaseTransactionFields {
  readonly TransactionType: 'TicketCreate';
  /** How many tickets to create (1-250). */
  readonly TicketCount: number;
}

export class TicketCreateTx extends Transaction {
  override readonly TransactionType = 'TicketCreate' as const;

  /** How many tickets to create. */
  readonly TicketCount: number = undefined as any;

  static override readonly TRANSACTION_TYPE = 'TicketCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'TicketCount'
  ] as const;

  constructor(props: TicketCreateTxFields) {
    super({ ...props, TransactionType: TicketCreateTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isNumber(this.TicketCount) || this.TicketCount < 1 || this.TicketCount > 250) {
      throw new ValidationError('TicketCreate: TicketCount must be between 1 and 250');
    }
  }
}
