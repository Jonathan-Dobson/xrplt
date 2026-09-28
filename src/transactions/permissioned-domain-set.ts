/**
 * PermissionedDomainSet transaction — define or update a permissioned domain.
 *
 * @see https://xrpl.org/permissioneddomainset.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isArray } from '../validation/helpers.js';

export interface PermissionedDomainSetTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'PermissionedDomainSet';
  /** Accounts permitted within this domain. */
  readonly AcceptedAccounts?: string[] | undefined;
  /** Credentials required for this domain. */
  readonly AcceptedCredentials?: any[] | undefined;
}

export class PermissionedDomainSet extends Transaction {
  override readonly TransactionType = 'PermissionedDomainSet' as const;

  readonly AcceptedAccounts?: string[] | undefined = undefined;
  readonly AcceptedCredentials?: any[] | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'PermissionedDomainSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'AcceptedAccounts', 'AcceptedCredentials'
  ] as const;

  constructor(props: PermissionedDomainSetTxFields) {
    super({ ...props, TransactionType: PermissionedDomainSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (this.AcceptedAccounts !== undefined && !isArray(this.AcceptedAccounts)) {
      throw new ValidationError('PermissionedDomainSet: AcceptedAccounts must be an array');
    }
  }
}
