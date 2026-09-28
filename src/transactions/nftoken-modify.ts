/**
 * NFTokenModify transaction — modify the URI of an existing NFToken (requires specific flags).
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';

import { ValidationError } from '../errors.js';
import { isString, isAccount } from '../validation/helpers.js';

export interface NFTokenModifyTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'NFTokenModify';
  /** The unique identifier of the NFToken. */
  readonly NFTokenID: string;
  /** The new URI for the token. */
  readonly URI?: string | undefined;
  /** The account that currently owns the token (if not the sender). */
  readonly Owner?: string | undefined;
}

export class NFTokenModify extends TokenTransaction {
  override readonly TransactionType = 'NFTokenModify' as const;

  /** The unique identifier of the NFToken. */
  readonly NFTokenID: string = undefined as any;

  /** The new URI for the token. */
  readonly URI?: string | undefined = undefined;

  /** The account that currently owns the token (if not the sender). */
  readonly Owner?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'NFTokenModify' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'NFTokenID', 'Owner', 'URI'
  ] as const;

  constructor(props: NFTokenModifyTxFields) {
    super({ ...props, TransactionType: NFTokenModify.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isString(this.NFTokenID)) {
      throw new ValidationError('NFTokenModify: missing or invalid NFTokenID');
    }
    if (this.Owner !== undefined && !isAccount(this.Owner)) {
      throw new ValidationError('NFTokenModify: invalid Owner');
    }
  }
}
