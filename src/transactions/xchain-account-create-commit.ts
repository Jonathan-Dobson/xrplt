/**
 * XChainAccountCreateCommit transaction — commit funds to create a new account on a destination chain.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { XChainTransaction } from '../groups/xchain.js';
import { ValidationError } from '../errors.js';
import { isAmount, isRecord } from '../validation/helpers.js';

export interface XChainAccountCreateCommitTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'XChainAccountCreateCommit';
  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown>;
  /** The address of the account to create on the destination chain. */
  readonly Destination: string;
  /** The amount to commit for account creation. */
  readonly Amount: string;
  /** The signature reward for the account creation. */
  readonly SignatureReward: string;
}

export class XChainAccountCreateCommit extends XChainTransaction {
  override readonly TransactionType = 'XChainAccountCreateCommit' as const;

  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown> = undefined as any;

  /** The address of the account to create on the destination chain. */
  readonly Destination: string = undefined as any;

  /** The amount to commit for account creation. */
  readonly Amount: string = undefined as any;

  /** The signature reward for the account creation. */
  readonly SignatureReward: string = undefined as any;

  static override readonly TRANSACTION_TYPE = 'XChainAccountCreateCommit' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'Destination', 'SignatureReward', 'XChainBridge'
  ] as const;

  constructor(props: XChainAccountCreateCommitTxFields) {
    super({ ...props, TransactionType: XChainAccountCreateCommit.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainAccountCreateCommit: missing or invalid XChainBridge');
    if (!isAmount(this.Amount)) throw new ValidationError('XChainAccountCreateCommit: missing or invalid Amount');
  }
}
