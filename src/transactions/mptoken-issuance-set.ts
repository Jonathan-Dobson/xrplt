/**
 * MPTokenIssuanceSet transaction — update the flags or metadata of an MPT issuance.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';

import { ValidationError } from '../errors.js';
import { isString } from '../validation/helpers.js';

export interface MPTokenIssuanceSetTxFields extends BaseTransactionFields {
  readonly TransactionType: 'MPTokenIssuanceSet';
  /** The unique identifier of the MPT issuance. */
  readonly MPTokenIssuanceID: string;
  /** The account of the holder to update (for specific flags). */
  readonly Holder?: string | undefined;
}

export class MPTokenIssuanceSetTx extends TokenTransaction {
  override readonly TransactionType = 'MPTokenIssuanceSet' as const;

  /** The unique identifier of the MPT issuance. */
  readonly MPTokenIssuanceID: string = undefined as any;

  /** The account of the holder to update (for specific flags). */
  readonly Holder?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'MPTokenIssuanceSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Holder', 'MPTokenIssuanceID'
  ] as const;

  constructor(props: MPTokenIssuanceSetTxFields) {
    super({ ...props, TransactionType: MPTokenIssuanceSetTx.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isString(this.MPTokenIssuanceID)) {
      throw new ValidationError('MPTokenIssuanceSet: missing or invalid MPTokenIssuanceID');
    }
  }
}
