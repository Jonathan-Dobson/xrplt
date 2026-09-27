/**
 * DepositPreauth transaction — grant or revoke authorization for another account to send payments to you.
 *
 * @see https://xrpl.org/depositpreauth.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { AccountTransaction } from '../groups/account.js';

import { ValidationError } from '../errors.js';
import { isAccount } from '../validation/helpers.js';

export interface DepositPreauthTxFields extends BaseTransactionFields {
  readonly TransactionType: 'DepositPreauth';
  /** Account to authorize. */
  readonly Authorize?: string | undefined;
  /** Account to unauthorize. */
  readonly Unauthorize?: string | undefined;
}

export class DepositPreauth extends AccountTransaction {
  override readonly TransactionType = 'DepositPreauth' as const;

  readonly Authorize?: string | undefined = undefined;
  readonly Unauthorize?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'DepositPreauth' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Authorize', 'Unauthorize'
  ] as const;

  constructor(props: DepositPreauthTxFields) {
    super({ ...props, TransactionType: DepositPreauth.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (this.Authorize !== undefined && this.Unauthorize !== undefined) {
      throw new ValidationError('DepositPreauth: cannot have both Authorize and Unauthorize');
    }
    if (this.Authorize === undefined && this.Unauthorize === undefined) {
      throw new ValidationError('DepositPreauth: must have either Authorize or Unauthorize');
    }
    if (this.Authorize !== undefined && !isAccount(this.Authorize)) {
      throw new ValidationError('DepositPreauth: invalid Authorize account');
    }
    if (this.Unauthorize !== undefined && !isAccount(this.Unauthorize)) {
      throw new ValidationError('DepositPreauth: invalid Unauthorize account');
    }
  }
}
