/**
 * ConfidentialMPTClawback transaction — claw back a holder's entire
 * confidential MPT balance (spending + inbox).
 *
 * Requires the ConfidentialTransfer amendment (status: not_enabled on
 * the live network as of v0.6.x; this implementation mirrors the
 * dev-portal / xrpl.js canonical spec).
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/confidentialmptclawback
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isHex, isAccount } from '../validation/helpers.js';

export interface ConfidentialMPTClawbackTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'ConfidentialMPTClawback';
  /** AccountID — the holder being clawed back from. */
  readonly Holder: string;
  /** UInt192 — MPT issuance identifier (48-char hex). */
  readonly MPTokenIssuanceID: string;
  /** UInt64 — plaintext total to claw back. */
  readonly MPTAmount: string;
  /** 64-byte Clawback sigma proof (hex). */
  readonly ZKProof: string;
}

export class ConfidentialMPTClawback extends TokenTransaction {
  override readonly TransactionType = 'ConfidentialMPTClawback' as const;

  declare readonly Holder: string;
  declare readonly MPTokenIssuanceID: string;
  declare readonly MPTAmount: string;
  declare readonly ZKProof: string;

  static override readonly TRANSACTION_TYPE = 'ConfidentialMPTClawback' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Holder', 'MPTokenIssuanceID', 'MPTAmount', 'ZKProof'
  ] as const;

  constructor(props: ConfidentialMPTClawbackTxFields) {
    super({ ...props, TransactionType: ConfidentialMPTClawback.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isAccount(this.Holder)) {
      throw new ValidationError('ConfidentialMPTClawback: invalid Holder');
    }
    if (!isHex(this.MPTokenIssuanceID) || this.MPTokenIssuanceID.length !== 48) {
      throw new ValidationError(
        'ConfidentialMPTClawback: MPTokenIssuanceID must be a 48-char hex string',
      );
    }
    if (this.MPTAmount === '0') {
      throw new ValidationError('ConfidentialMPTClawback: MPTAmount must be non-zero');
    }
    // 64 bytes = 128 hex chars
    if (!isHex(this.ZKProof) || this.ZKProof.length !== 128) {
      throw new ValidationError(
        'ConfidentialMPTClawback: ZKProof must be a 128-char hex string (64 bytes)',
      );
    }
  }
}
