/**
 * CredentialCreate transaction — issue a new digital credential to an account.
 *
 * @see https://xrpl.org/credentialcreate.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isAccount, isString, isNumber } from '../validation/helpers.js';

export interface CredentialCreateTxFields extends BaseTransactionFields {
  readonly TransactionType: 'CredentialCreate';
  /** The account receiving the credential. */
  readonly Subject: string;
  /** Type of the credential. */
  readonly CredentialType: string;
  /** Sequence number for the credential. */
  readonly CredentialSequence: number;
  /** Optional expiration. */
  readonly Expiration?: number | undefined;
  /** Optional metadata URI. */
  readonly URI?: string | undefined;
}

export class CredentialCreateTx extends Transaction {
  override readonly TransactionType = 'CredentialCreate' as const;

  readonly Subject: string = undefined as any;
  readonly CredentialType: string = undefined as any;
  readonly CredentialSequence: number = undefined as any;
  readonly Expiration?: number | undefined = undefined;
  readonly URI?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'CredentialCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'CredentialSequence', 'CredentialType', 'Expiration', 'Subject', 'URI'
  ] as const;

  constructor(props: CredentialCreateTxFields) {
    super({ ...props, TransactionType: 'CredentialCreate' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Subject)) throw new ValidationError('CredentialCreate: missing or invalid Subject');
    if (!isString(this.CredentialType)) throw new ValidationError('CredentialCreate: missing or invalid CredentialType');
    if (!isNumber(this.CredentialSequence)) throw new ValidationError('CredentialCreate: missing or invalid CredentialSequence');
  }
}
