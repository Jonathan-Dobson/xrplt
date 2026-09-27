/**
 * CredentialDelete transaction — remove a credential from the ledger.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAccount, isString } from '../validation/helpers.js';

export interface CredentialDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'CredentialDelete';
  /** The subject of the credential. */
  readonly Subject: string;
  /** The issuer of the credential. */
  readonly Issuer: string;
  /** The type of the credential. */
  readonly CredentialType: string;
}

export class CredentialDeleteTx extends Transaction {
  override readonly TransactionType = 'CredentialDelete' as const;

  readonly Subject: string = undefined as any;
  readonly Issuer: string = undefined as any;
  readonly CredentialType: string = undefined as any;

  static override readonly TRANSACTION_TYPE = 'CredentialDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'CredentialType', 'Issuer', 'Subject'
  ] as const;

  constructor(props: CredentialDeleteTxFields) {
    super({ ...props, TransactionType: 'CredentialDelete' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Subject)) throw new ValidationError('CredentialDelete: missing or invalid Subject');
    if (!isAccount(this.Issuer)) throw new ValidationError('CredentialDelete: missing or invalid Issuer');
    if (!isString(this.CredentialType)) throw new ValidationError('CredentialDelete: missing or invalid CredentialType');
  }
}
