/**
 * ConfidentialMPTConvert transaction — convert a public MPT balance to a
 * confidential balance (credited to inbox; merge via
 * ConfidentialMPTMergeInbox to use).
 *
 * Requires the ConfidentialTransfer amendment.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/confidentialmptconvert
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isHex } from '../validation/helpers.js';

export interface ConfidentialMPTConvertTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'ConfidentialMPTConvert';
  /** UInt192 — MPT issuance identifier (48-char hex). */
  readonly MPTokenIssuanceID: string;
  /** UInt64 — plaintext public amount to convert. */
  readonly MPTAmount: string;
  /** Blob — holder's ElGamal public key (optional; required on first opt-in). */
  readonly HolderEncryptionKey?: string | undefined;
  /** Blob — 66-byte ElGamal ciphertext credited to holder inbox. */
  readonly HolderEncryptedAmount: string;
  /** Blob — 66-byte ElGamal ciphertext credited to issuer mirror balance. */
  readonly IssuerEncryptedAmount: string;
  /** UInt256 — 32-byte scalar blinding factor. */
  readonly BlindingFactor: string;
  /** Blob — 66-byte ElGamal ciphertext for the auditor (required if issuance has AuditorEncryptionKey). */
  readonly AuditorEncryptedAmount?: string | undefined;
  /** Blob — 64-byte Schnorr proof (required when HolderEncryptionKey is present). */
  readonly ZKProof?: string | undefined;
}

export class ConfidentialMPTConvert extends TokenTransaction {
  override readonly TransactionType = 'ConfidentialMPTConvert' as const;

  declare readonly MPTokenIssuanceID: string;
  declare readonly MPTAmount: string;
  declare readonly HolderEncryptionKey?: string | undefined;
  declare readonly HolderEncryptedAmount: string;
  declare readonly IssuerEncryptedAmount: string;
  declare readonly BlindingFactor: string;
  declare readonly AuditorEncryptedAmount?: string | undefined;
  declare readonly ZKProof?: string | undefined;

  static override readonly TRANSACTION_TYPE = 'ConfidentialMPTConvert' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'MPTokenIssuanceID', 'MPTAmount', 'HolderEncryptionKey',
    'HolderEncryptedAmount', 'IssuerEncryptedAmount', 'BlindingFactor',
    'AuditorEncryptedAmount', 'ZKProof'
  ] as const;

  constructor(props: ConfidentialMPTConvertTxFields) {
    super({ ...props, TransactionType: ConfidentialMPTConvert.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isHex(this.MPTokenIssuanceID) || this.MPTokenIssuanceID.length !== 48) {
      throw new ValidationError(
        'ConfidentialMPTConvert: MPTokenIssuanceID must be a 48-char hex string',
      );
    }
    if (!isHex(this.BlindingFactor) || this.BlindingFactor.length !== 64) {
      throw new ValidationError(
        'ConfidentialMPTConvert: BlindingFactor must be a 64-char hex string (32 bytes)',
      );
    }
    if (!isHex(this.HolderEncryptedAmount) || this.HolderEncryptedAmount.length !== 132) {
      throw new ValidationError(
        'ConfidentialMPTConvert: HolderEncryptedAmount must be a 132-char hex string (66 bytes)',
      );
    }
    if (!isHex(this.IssuerEncryptedAmount) || this.IssuerEncryptedAmount.length !== 132) {
      throw new ValidationError(
        'ConfidentialMPTConvert: IssuerEncryptedAmount must be a 132-char hex string (66 bytes)',
      );
    }
    if (this.HolderEncryptionKey !== undefined) {
      if (!isHex(this.HolderEncryptionKey) || this.HolderEncryptionKey.length === 0) {
        throw new ValidationError(
          'ConfidentialMPTConvert: invalid HolderEncryptionKey',
        );
      }
      if (this.ZKProof === undefined) {
        throw new ValidationError(
          'ConfidentialMPTConvert: ZKProof required when HolderEncryptionKey is present',
        );
      }
    }
    if (this.ZKProof !== undefined) {
      if (!isHex(this.ZKProof) || this.ZKProof.length !== 128) {
        throw new ValidationError(
          'ConfidentialMPTConvert: ZKProof must be a 128-char hex string (64 bytes)',
        );
      }
    }
    if (this.AuditorEncryptedAmount !== undefined) {
      if (!isHex(this.AuditorEncryptedAmount) || this.AuditorEncryptedAmount.length !== 132) {
        throw new ValidationError(
          'ConfidentialMPTConvert: AuditorEncryptedAmount must be a 132-char hex string (66 bytes)',
        );
      }
    }
  }
}
