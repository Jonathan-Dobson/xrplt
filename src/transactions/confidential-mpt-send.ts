/**
 * ConfidentialMPTSend transaction — send confidential MPT tokens to
 * another account.
 *
 * Requires the ConfidentialTransfer amendment.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/confidentialmptsend
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isHex, isAccount } from '../validation/helpers.js';

export interface ConfidentialMPTSendTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'ConfidentialMPTSend';
  /** UInt192 — MPT issuance identifier. */
  readonly MPTokenIssuanceID: string;
  /** AccountID — receiver. */
  readonly Destination: string;
  /** Blob — commitment to the transfer amount. */
  readonly AmountCommitment: string;
  /** Blob — commitment to the sender's spending balance. */
  readonly BalanceCommitment: string;
  /** Blob — ciphertext used to update the issuer mirror balance. */
  readonly IssuerEncryptedAmount: string;
  /** Blob — ciphertext credited to the receiver's inbox. */
  readonly DestinationEncryptedAmount: string;
  /** Blob — ciphertext used to debit the sender's spending balance. */
  readonly SenderEncryptedAmount: string;
  /** Blob — 946-byte proof bundle (sigma + Bulletproof). */
  readonly ZKProof: string;
  /** Blob — auditor ciphertext (conditional). */
  readonly AuditorEncryptedAmount?: string | undefined;
  /** Vector256 — array of Credential IDs (conditional). */
  readonly CredentialIDs?: string[] | undefined;
}

export class ConfidentialMPTSend extends TokenTransaction {
  override readonly TransactionType = 'ConfidentialMPTSend' as const;

  declare readonly MPTokenIssuanceID: string;
  declare readonly Destination: string;
  declare readonly AmountCommitment: string;
  declare readonly BalanceCommitment: string;
  declare readonly IssuerEncryptedAmount: string;
  declare readonly DestinationEncryptedAmount: string;
  declare readonly SenderEncryptedAmount: string;
  declare readonly ZKProof: string;
  declare readonly AuditorEncryptedAmount?: string | undefined;
  declare readonly CredentialIDs?: string[] | undefined;

  static override readonly TRANSACTION_TYPE = 'ConfidentialMPTSend' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'MPTokenIssuanceID', 'Destination',
    'AmountCommitment', 'BalanceCommitment',
    'IssuerEncryptedAmount', 'DestinationEncryptedAmount',
    'SenderEncryptedAmount', 'ZKProof', 'AuditorEncryptedAmount',
    'CredentialIDs'
  ] as const;

  constructor(props: ConfidentialMPTSendTxFields) {
    super({ ...props, TransactionType: ConfidentialMPTSend.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isHex(this.MPTokenIssuanceID) || this.MPTokenIssuanceID.length !== 48) {
      throw new ValidationError(
        'ConfidentialMPTSend: MPTokenIssuanceID must be a 48-char hex string',
      );
    }
    if (!isAccount(this.Destination)) {
      throw new ValidationError('ConfidentialMPTSend: invalid Destination');
    }
    if (!isHex(this.AmountCommitment) || this.AmountCommitment.length !== 66) {
      throw new ValidationError(
        'ConfidentialMPTSend: AmountCommitment must be a 66-char hex string (33 bytes)',
      );
    }
    if (!isHex(this.BalanceCommitment) || this.BalanceCommitment.length !== 66) {
      throw new ValidationError(
        'ConfidentialMPTSend: BalanceCommitment must be a 66-char hex string (33 bytes)',
      );
    }
    if (!isHex(this.IssuerEncryptedAmount) || this.IssuerEncryptedAmount.length !== 132) {
      throw new ValidationError(
        'ConfidentialMPTSend: IssuerEncryptedAmount must be a 132-char hex string (66 bytes)',
      );
    }
    if (!isHex(this.DestinationEncryptedAmount) || this.DestinationEncryptedAmount.length !== 132) {
      throw new ValidationError(
        'ConfidentialMPTSend: DestinationEncryptedAmount must be a 132-char hex string (66 bytes)',
      );
    }
    if (!isHex(this.SenderEncryptedAmount) || this.SenderEncryptedAmount.length !== 132) {
      throw new ValidationError(
        'ConfidentialMPTSend: SenderEncryptedAmount must be a 132-char hex string (66 bytes)',
      );
    }
    // 946 bytes = 1892 hex chars
    if (!isHex(this.ZKProof) || this.ZKProof.length !== 1892) {
      throw new ValidationError(
        'ConfidentialMPTSend: ZKProof must be a 1892-char hex string (946 bytes)',
      );
    }
    if (this.AuditorEncryptedAmount !== undefined) {
      if (!isHex(this.AuditorEncryptedAmount) || this.AuditorEncryptedAmount.length !== 132) {
        throw new ValidationError(
          'ConfidentialMPTSend: AuditorEncryptedAmount must be a 132-char hex string',
        );
      }
    }
  }
}
