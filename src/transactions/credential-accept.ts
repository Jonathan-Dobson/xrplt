/**
 * CredentialAccept transaction — accept a credential that was issued to you.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAccount, isString } from '../validation/helpers.js';

export interface CredentialAcceptTxFields extends BaseTransactionFields {
  readonly TransactionType: 'CredentialAccept';
  /** The issuer of the credential. */
  readonly Issuer: string;
  /** The type of the credential. */
  readonly CredentialType: string;
}

export class CredentialAccept extends Transaction {
  override readonly TransactionType = 'CredentialAccept' as const;

  readonly Issuer: string = undefined as any;
  readonly CredentialType: string = undefined as any;

  static override readonly TRANSACTION_TYPE = 'CredentialAccept' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'CredentialType', 'Issuer'
  ] as const;

  constructor(props: CredentialAcceptTxFields) {
    super({ ...props, TransactionType: CredentialAccept.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Issuer)) throw new ValidationError('CredentialAccept: missing or invalid Issuer');
    if (!isString(this.CredentialType)) throw new ValidationError('CredentialAccept: missing or invalid CredentialType');
  }
}
