/**
 * ConfidentialMPTConvertBack transaction — convert a confidential MPT
 * balance back to a public balance.
 *
 * Requires the ConfidentialTransfer amendment.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/confidentialmptconvertback
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isHex } from '../validation/helpers.js';

export interface ConfidentialMPTConvertBackTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'ConfidentialMPTConvertBack';
  /** UInt192 — MPT issuance identifier (48-char hex). */
  readonly MPTokenIssuanceID: string;
  /** UInt64 — plaintext amount to credit to the public balance. */
  readonly MPTAmount: string;
  /** Blob — ciphertext to subtract from holder's spending balance. */
  readonly HolderEncryptedAmount: string;
  /** Blob — ciphertext to subtract from issuer's mirror balance. */
  readonly IssuerEncryptedAmount: string;
  /** UInt256 — 32-byte blinding factor. */
  readonly BlindingFactor: string;
  /** Blob — 33-byte commitment to the user's confidential spending balance. */
  readonly BalanceCommitment: string;
  /** Blob — 816-byte proof bundle (sigma + Bulletproof). */
  readonly ZKProof: string;
  /** Blob — auditor ciphertext (conditional). */
  readonly AuditorEncryptedAmount?: string | undefined;
}

export class ConfidentialMPTConvertBack extends TokenTransaction {
  override readonly TransactionType = 'ConfidentialMPTConvertBack' as const;

  declare readonly MPTokenIssuanceID: string;
  declare readonly MPTAmount: string;
  declare readonly HolderEncryptedAmount: string;
  declare readonly IssuerEncryptedAmount: string;
  declare readonly BlindingFactor: string;
  declare readonly BalanceCommitment: string;
  declare readonly ZKProof: string;
  declare readonly AuditorEncryptedAmount?: string | undefined;

  static override readonly TRANSACTION_TYPE = 'ConfidentialMPTConvertBack' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'MPTokenIssuanceID', 'MPTAmount', 'HolderEncryptedAmount',
    'IssuerEncryptedAmount', 'BlindingFactor', 'BalanceCommitment',
    'ZKProof', 'AuditorEncryptedAmount'
  ] as const;

  constructor(props: ConfidentialMPTConvertBackTxFields) {
    super({ ...props, TransactionType: ConfidentialMPTConvertBack.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isHex(this.MPTokenIssuanceID) || this.MPTokenIssuanceID.length !== 48) {
      throw new ValidationError(
        'ConfidentialMPTConvertBack: MPTokenIssuanceID must be a 48-char hex string',
      );
    }
    if (this.MPTAmount === '0') {
      throw new ValidationError(
        'ConfidentialMPTConvertBack: MPTAmount must be non-zero',
      );
    }
    if (!isHex(this.HolderEncryptedAmount) || this.HolderEncryptedAmount.length !== 132) {
      throw new ValidationError(
        'ConfidentialMPTConvertBack: HolderEncryptedAmount must be a 132-char hex string',
      );
    }
    if (!isHex(this.IssuerEncryptedAmount) || this.IssuerEncryptedAmount.length !== 132) {
      throw new ValidationError(
        'ConfidentialMPTConvertBack: IssuerEncryptedAmount must be a 132-char hex string',
      );
    }
    if (!isHex(this.BlindingFactor) || this.BlindingFactor.length !== 64) {
      throw new ValidationError(
        'ConfidentialMPTConvertBack: BlindingFactor must be a 64-char hex string',
      );
    }
    if (!isHex(this.BalanceCommitment) || this.BalanceCommitment.length !== 66) {
      throw new ValidationError(
        'ConfidentialMPTConvertBack: BalanceCommitment must be a 66-char hex string (33 bytes)',
      );
    }
    // 816 bytes = 1632 hex chars
    if (!isHex(this.ZKProof) || this.ZKProof.length !== 1632) {
      throw new ValidationError(
        'ConfidentialMPTConvertBack: ZKProof must be a 1632-char hex string (816 bytes)',
      );
    }
    if (this.AuditorEncryptedAmount !== undefined) {
      if (!isHex(this.AuditorEncryptedAmount) || this.AuditorEncryptedAmount.length !== 132) {
        throw new ValidationError(
          'ConfidentialMPTConvertBack: AuditorEncryptedAmount must be a 132-char hex string',
        );
      }
    }
  }
}
