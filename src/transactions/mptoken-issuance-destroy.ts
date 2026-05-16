/**
 * MPTokenIssuanceDestroy transaction — permanently remove an MPT issuance from the ledger.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isString } from '../validation/helpers.js';

export interface MPTokenIssuanceDestroyTxFields extends BaseTransactionFields {
  readonly TransactionType: 'MPTokenIssuanceDestroy';
  /** The unique identifier of the MPT issuance. */
  readonly MPTokenIssuanceID: string;
}

export class MPTokenIssuanceDestroyTx extends TokenTransaction {
  override readonly TransactionType = 'MPTokenIssuanceDestroy' as const;

  /** The unique identifier of the MPT issuance. */
  readonly MPTokenIssuanceID: string = undefined as any;

  constructor(props: MPTokenIssuanceDestroyTxFields) {
    super({ ...props, TransactionType: 'MPTokenIssuanceDestroy' } );
    this.MPTokenIssuanceID = props.MPTokenIssuanceID as string;
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (!isString(this.MPTokenIssuanceID)) {
      throw new ValidationError('MPTokenIssuanceDestroy: missing or invalid MPTokenIssuanceID');
    }
  }
}
