/**
 * MPTokenIssuanceDestroy transaction — permanently remove an MPT issuance from the ledger.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isString } from '../validation/helpers.js';

export interface MPTokenIssuanceDestroyTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'MPTokenIssuanceDestroy';
  /** The unique identifier of the MPT issuance. */
  readonly MPTokenIssuanceID: string;
}

export class MPTokenIssuanceDestroy extends TokenTransaction {
  override readonly TransactionType = 'MPTokenIssuanceDestroy' as const;

  /** The unique identifier of the MPT issuance. */
  declare readonly MPTokenIssuanceID: string;
  static override readonly TRANSACTION_TYPE = 'MPTokenIssuanceDestroy' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'MPTokenIssuanceID'
  ] as const;

  constructor(props: MPTokenIssuanceDestroyTxFields) {
    super({ ...props, TransactionType: MPTokenIssuanceDestroy.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isString(this.MPTokenIssuanceID)) {
      throw new ValidationError('MPTokenIssuanceDestroy: missing or invalid MPTokenIssuanceID');
    }
  }
}
