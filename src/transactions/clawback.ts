/**
 * Clawback transaction — reclaim issued tokens or MPTs from a holder's account.
 *
 * @see https://xrpl.org/clawback.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isAmount } from '../validation/helpers.js';

export interface ClawbackTxFields extends BaseTransactionFields {
  readonly TransactionType: 'Clawback';
  /** The amount to claw back (Issued Currency or MPT). */
  readonly Amount: Amount;
}

export class ClawbackTx extends TokenTransaction {
  override readonly TransactionType = 'Clawback' as const;

  /** The amount to claw back. */
  readonly Amount: Amount = undefined as any;

  constructor(props: ClawbackTxFields) {
    super({ ...props, TransactionType: 'Clawback' } );
    this.Amount = props.Amount as Amount;
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('Clawback: missing or invalid Amount');
    if (typeof this.Amount === 'string') {
      throw new ValidationError('Clawback: Amount must be an IssuedCurrency or MPT, not XRP drops');
    }
  }
}
