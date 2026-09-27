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

  static override readonly TRANSACTION_TYPE = 'XChainModifyBridge' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'MinAccountCreateAmount', 'SignatureReward', 'XChainBridge'
  ] as const;

  constructor(props: XChainModifyBridgeTxFields) {
    super({ ...props, TransactionType: 'XChainModifyBridge' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainModifyBridge: missing or invalid XChainBridge');
  }
}
