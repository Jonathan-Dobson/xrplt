/**
 * XChainCommit transaction — lock funds on the locking chain to be claimed on the issuing chain.
 *
 * @see https://xrpl.org/xchaincommit.html
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { XChainTransaction } from '../groups/xchain.js';

import { ValidationError } from '../errors.js';
import { isAmount, isRecord, isNumber } from '../validation/helpers.js';

export interface XChainCommitTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'XChainCommit';
  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown>;
  /** The claim ID on the destination chain. */
  readonly XChainClaimID: number;
  /** The amount to commit. */
  readonly Amount: Amount;
  /** The destination account on the destination chain. */
  readonly OtherChainDestination?: string | undefined;
}

export class XChainCommit extends XChainTransaction {
  override readonly TransactionType = 'XChainCommit' as const;

  /** Definition of the bridge to use. */
  declare readonly XChainBridge: Record<string, unknown>;
  /** The claim ID on the destination chain. */
  declare readonly XChainClaimID: number;
  /** The amount to commit. */
  declare readonly Amount: Amount;
  /** The destination account on the destination chain. */
  readonly OtherChainDestination?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'XChainCommit' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'OtherChainDestination', 'XChainBridge', 'XChainClaimID'
  ] as const;

  constructor(props: XChainCommitTxFields) {
    super({ ...props, TransactionType: XChainCommit.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainCommit: missing or invalid XChainBridge');
    if (!isNumber(this.XChainClaimID)) throw new ValidationError('XChainCommit: missing or invalid XChainClaimID');
    if (!isAmount(this.Amount)) throw new ValidationError('XChainCommit: missing or invalid Amount');
  }
}
