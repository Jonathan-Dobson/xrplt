/**
 * SetRegularKey transaction — assign, change, or remove a secondary signing key for an account.
 *
 * @see https://xrpl.org/setregularkey.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { AccountTransaction } from '../groups/account.js';

import { ValidationError } from '../errors.js';
import { isAccount } from '../validation/helpers.js';

export interface SetRegularKeyTxFields extends BaseTransactionFields {
  readonly TransactionType: 'SetRegularKey';
  /** The address of the new regular key (leave empty to remove). */
  readonly RegularKey?: string | undefined;
}

export class SetRegularKey extends AccountTransaction {
  override readonly TransactionType = 'SetRegularKey' as const;

  /** The address of the new regular key. */
  readonly RegularKey?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'SetRegularKey' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'RegularKey'
  ] as const;

  constructor(props: SetRegularKeyTxFields) {
    super({ ...props, TransactionType: SetRegularKey.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (this.RegularKey !== undefined && !isAccount(this.RegularKey)) {
      throw new ValidationError('SetRegularKey: invalid RegularKey');
    }
  }
}
