/**
 * XChainModifyBridge transaction — update the parameters of an existing cross-chain bridge.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { XChainTransaction } from '../groups/xchain.js';
import { ValidationError } from '../errors.js';
import { isRecord } from '../validation/helpers.js';

export interface XChainModifyBridgeTxFields extends BaseTransactionFields {
  readonly TransactionType: 'XChainModifyBridge';
  /** Definition of the bridge to modify. */
  readonly XChainBridge: Record<string, unknown>;
  /** New minimum account creation amount. */
  readonly MinAccountCreateAmount?: string | undefined;
  /** New signature reward. */
  readonly SignatureReward?: string | undefined;
}

export class XChainModifyBridgeTx extends XChainTransaction {
  override readonly TransactionType = 'XChainModifyBridge' as const;

  /** Definition of the bridge to modify. */
  readonly XChainBridge: Record<string, unknown> = undefined as any;

  readonly MinAccountCreateAmount?: string | undefined = undefined;
  readonly SignatureReward?: string | undefined = undefined;

  constructor(props: XChainModifyBridgeTxFields) {
    super({ ...props, TransactionType: 'XChainModifyBridge' } );
    this.XChainBridge = props.XChainBridge as Record<string, unknown>;
    this.MinAccountCreateAmount = props.MinAccountCreateAmount as string;
    this.SignatureReward = props.SignatureReward as string;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainModifyBridge: missing or invalid XChainBridge');
  }
}
