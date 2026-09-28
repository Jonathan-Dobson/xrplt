/**
 * AccountDelete transaction — remove an account from the XRP Ledger and recover its reserve.
 *
 * @see https://xrpl.org/accountdelete.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { AccountTransaction } from '../groups/account.js';
import { ValidationError } from '../errors.js';
import { isAccount, isNumber } from '../validation/helpers.js';

export interface AccountDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'AccountDelete';
  /** The address to receive any remaining XRP from the deleted account. */
  readonly Destination: string;
  /** Arbitrary destination tag for the recipient. */
  readonly DestinationTag?: number | undefined;
}

export class AccountDelete extends AccountTransaction {
  override readonly TransactionType = 'AccountDelete' as const;

  /** The address to receive any remaining XRP from the deleted account. */
  readonly Destination: string = undefined as any;

  /** Arbitrary destination tag for the recipient. */
  readonly DestinationTag?: number | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'AccountDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Destination', 'DestinationTag'
  ] as const;

  constructor(props: AccountDeleteTxFields) {
    super({ ...props, TransactionType: AccountDelete.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Destination)) {
      throw new ValidationError('AccountDelete: missing or invalid Destination');
    }
    if (this.DestinationTag !== undefined && !isNumber(this.DestinationTag)) {
      throw new ValidationError('AccountDelete: DestinationTag must be a number');
    }
  }
}
