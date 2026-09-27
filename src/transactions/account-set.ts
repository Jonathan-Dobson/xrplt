/**
 * AccountSet transaction — modify account-specific settings or flags.
 *
 * @see https://xrpl.org/accountset.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { AccountSetFlagsInterface } from '../types/flags.js';
import { AccountTransaction } from '../groups/account.js';

import { ValidationError } from '../errors.js';
import { isNumber, isString } from '../validation/helpers.js';

export interface AccountSetTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AccountSet';
  /** Hash of a certificate to use for some external validation. */
  readonly ClearFlag?: number | undefined;
  /** Domain name associated with this account (hex encoded). */
  readonly Domain?: string | undefined;
  /** Email hash (e.g. for Gravatar). */
  readonly EmailHash?: string | undefined;
  /** Message key for encrypted messaging. */
  readonly MessageKey?: string | undefined;
  /** NFT collection fee (0-50,000). */
  readonly NFTokenBrokerFee?: number | undefined;
  /** Flag to enable on the account. */
  readonly SetFlag?: number | undefined;
  /** Transfer rate for issued currencies (drops per billion). */
  readonly TransferRate?: number | undefined;
  /** Tick size for offer matching (3-15 or 0 to disable). */
  readonly TickSize?: number | undefined;
  /** Bit-flags for this transaction. */
  readonly Flags?: number | AccountSetFlagsInterface | undefined;
}

export class AccountSetTx extends AccountTransaction {
  override readonly TransactionType = 'AccountSet' as const;

  readonly ClearFlag?: number | undefined = undefined;
  readonly Domain?: string | undefined = undefined;
  readonly EmailHash?: string | undefined = undefined;
  readonly MessageKey?: string | undefined = undefined;
  readonly NFTokenBrokerFee?: number | undefined = undefined;
  readonly SetFlag?: number | undefined = undefined;
  readonly TransferRate?: number | undefined = undefined;
  readonly TickSize?: number | undefined = undefined;
  declare readonly Flags?: number | AccountSetFlagsInterface | undefined;

  static override readonly TRANSACTION_TYPE = 'AccountSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'ClearFlag', 'Domain', 'EmailHash', 'MessageKey', 'NFTokenBrokerFee', 'SetFlag', 'TickSize', 'TransferRate'
  ] as const;

  constructor(props: AccountSetTxFields) {
    super({ ...props, TransactionType: AccountSetTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (this.TransferRate !== undefined) {
      if (!isNumber(this.TransferRate)) throw new ValidationError('AccountSet: TransferRate must be a number');
    }
    if (this.TickSize !== undefined) {
      if (!isNumber(this.TickSize)) throw new ValidationError('AccountSet: TickSize must be a number');
      if (this.TickSize !== 0 && (this.TickSize < 3 || this.TickSize > 15)) {
        throw new ValidationError('AccountSet: TickSize must be 3-15 or 0');
      }
    }
    if (this.Domain !== undefined && !isString(this.Domain)) {
      throw new ValidationError('AccountSet: Domain must be a string');
    }
  }
}
