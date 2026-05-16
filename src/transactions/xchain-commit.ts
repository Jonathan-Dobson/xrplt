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
  readonly TransactionType: 'XChainCommit';
  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown>;
  /** The claim ID on the destination chain. */
  readonly XChainClaimID: number;
  /** The amount to commit. */
  readonly Amount: Amount;
  /** The destination account on the destination chain. */
  readonly OtherChainDestination?: string | undefined;
}

export class XChainCommitTx extends XChainTransaction {
  override readonly TransactionType = 'XChainCommit' as const;

  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown> = undefined as any;

  /** The claim ID on the destination chain. */
  readonly XChainClaimID: number = undefined as any;

  /** The amount to commit. */
  readonly Amount: Amount = undefined as any;

  /** The destination account on the destination chain. */
  readonly OtherChainDestination?: string | undefined = undefined;

  constructor(props: XChainCommitTxFields) {
    super({ ...props, TransactionType: 'XChainCommit' } );
    this.XChainBridge = props.XChainBridge as Record<string, unknown>;
    this.XChainClaimID = props.XChainClaimID as number;
    this.Amount = props.Amount as Amount;
        this.OtherChainDestination = props.OtherChainDestination as any;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainCommit: missing or invalid XChainBridge');
    if (!isNumber(this.XChainClaimID)) throw new ValidationError('XChainCommit: missing or invalid XChainClaimID');
    if (!isAmount(this.Amount)) throw new ValidationError('XChainCommit: missing or invalid Amount');
  }
}
