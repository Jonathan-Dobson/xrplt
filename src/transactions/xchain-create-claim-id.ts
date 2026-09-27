/**
 * XChainCreateClaimID transaction — create a new claim ID on the destination chain.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { XChainTransaction } from '../groups/xchain.js';
import { ValidationError } from '../errors.js';
import { isAmount, isRecord } from '../validation/helpers.js';

export interface XChainCreateClaimIDTxFields extends BaseTransactionFields {
  readonly TransactionType: 'XChainCreateClaimID';
  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown>;
  /** The signature reward for creating the claim ID. */
  readonly SignatureReward: string;
  /** The destination account for the future claim. */
  readonly OtherChainSource: string;
}

export class XChainCreateClaimIDTx extends XChainTransaction {
  override readonly TransactionType = 'XChainCreateClaimID' as const;

  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown> = undefined as any;

  /** The signature reward for creating the claim ID. */
  readonly SignatureReward: string = undefined as any;

  /** The destination account for the future claim. */
  readonly OtherChainSource: string = undefined as any;

  static override readonly TRANSACTION_TYPE = 'XChainCreateClaimID' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'OtherChainSource', 'SignatureReward', 'XChainBridge'
  ] as const;

  constructor(props: XChainCreateClaimIDTxFields) {
    super({ ...props, TransactionType: 'XChainCreateClaimID' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainCreateClaimID: missing or invalid XChainBridge');
    if (!isAmount(this.SignatureReward)) throw new ValidationError('XChainCreateClaimID: missing or invalid SignatureReward');
  }
}
