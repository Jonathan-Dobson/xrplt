/**
 * XChainCreateBridge transaction — define a new cross-chain bridge on the ledger.
 *
 * @see https://xrpl.org/xchaincreatebridge.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { XChainTransaction } from '../groups/xchain.js';
import { ValidationError } from '../errors.js';
import { isAmount, isRecord } from '../validation/helpers.js';

export interface XChainCreateBridgeTxFields extends BaseTransactionFields {
  readonly TransactionType: 'XChainCreateBridge';
  /** Definition of the bridge (locking/issuing chains and assets). */
  readonly XChainBridge: Record<string, unknown>;
  /** Minimum amount required to create an account on the destination chain. */
  readonly MinAccountCreateAmount?: string | undefined;
  /** Signature reward for witness servers. */
  readonly SignatureReward: string;
}

export class XChainCreateBridgeTx extends XChainTransaction {
  override readonly TransactionType = 'XChainCreateBridge' as const;

  /** Definition of the bridge. */
  readonly XChainBridge: Record<string, unknown> = undefined as any;

  readonly MinAccountCreateAmount?: string | undefined = undefined;

  /** Signature reward for witness servers. */
  readonly SignatureReward: string = undefined as any;

  constructor(props: XChainCreateBridgeTxFields) {
    super({ ...props, TransactionType: 'XChainCreateBridge' } );
    this.XChainBridge = props.XChainBridge as Record<string, unknown>;
    this.SignatureReward = props.SignatureReward as string;
    this.MinAccountCreateAmount = props.MinAccountCreateAmount as string;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainCreateBridge: missing or invalid XChainBridge');
    if (!isAmount(this.SignatureReward)) throw new ValidationError('XChainCreateBridge: missing or invalid SignatureReward');
  }
}
