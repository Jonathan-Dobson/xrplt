/**
 * NFTokenBurn transaction — permanently remove an NFToken from the ledger.
 *
 * @see https://xrpl.org/nftokenburn.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';

import { ValidationError } from '../errors.js';
import { isString, isAccount } from '../validation/helpers.js';

export interface NFTokenBurnTxFields extends BaseTransactionFields {
  readonly TransactionType: 'NFTokenBurn';
  /** The unique identifier of the NFToken to burn. */
  readonly NFTokenID: string;
  /** The account that currently owns the token (if not the sender). */
  readonly Owner?: string | undefined;
}

export class NFTokenBurnTx extends TokenTransaction {
  override readonly TransactionType = 'NFTokenBurn' as const;

  /** The unique identifier of the NFToken to burn. */
  readonly NFTokenID: string = undefined as any;

  /** The account that currently owns the token (if not the sender). */
  readonly Owner?: string | undefined = undefined;

  constructor(props: NFTokenBurnTxFields) {
    super({ ...props, TransactionType: 'NFTokenBurn' } );
    this.NFTokenID = props.NFTokenID as string;
        this.Owner = props.Owner as any;
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isString(this.NFTokenID)) {
      throw new ValidationError('NFTokenBurn: missing or invalid NFTokenID');
    }
    if (this.Owner !== undefined && !isAccount(this.Owner)) {
      throw new ValidationError('NFTokenBurn: invalid Owner');
    }
  }
}
