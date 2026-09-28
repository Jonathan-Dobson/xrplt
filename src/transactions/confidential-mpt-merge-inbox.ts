/**
 * ConfidentialMPTMergeInbox transaction — merge your confidential inbox
 * balance into your spending balance.
 *
 * Requires the ConfidentialTransfer amendment.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/confidentialmptmergeinbox
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isHex } from '../validation/helpers.js';

export interface ConfidentialMPTMergeInboxTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'ConfidentialMPTMergeInbox';
  /** UInt192 — MPT issuance identifier (48-char hex). */
  readonly MPTokenIssuanceID: string;
}

export class ConfidentialMPTMergeInbox extends TokenTransaction {
  override readonly TransactionType = 'ConfidentialMPTMergeInbox' as const;

  declare readonly MPTokenIssuanceID: string;

  static override readonly TRANSACTION_TYPE = 'ConfidentialMPTMergeInbox' as const;
  static override readonly ASSIGNABLE_FIELDS = ['MPTokenIssuanceID'] as const;

  constructor(props: ConfidentialMPTMergeInboxTxFields) {
    super({ ...props, TransactionType: ConfidentialMPTMergeInbox.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isHex(this.MPTokenIssuanceID) || this.MPTokenIssuanceID.length !== 48) {
      throw new ValidationError(
        'ConfidentialMPTMergeInbox: MPTokenIssuanceID must be a 48-char hex string',
      );
    }
  }
}
