/**
 * XChainClaim transaction — claim funds on the destination chain that were committed on the source chain.
 *
 * @see https://xrpl.org/xchainclaim.html
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { XChainTransaction } from '../groups/xchain.js';
import { ValidationError } from '../errors.js';
import { isAmount, isRecord, isNumber } from '../validation/helpers.js';

export interface XChainClaimTxFields extends BaseTransactionFields {
  readonly TransactionType: 'XChainClaim';
  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown>;
  /** The claim ID on the destination chain. */
  readonly XChainClaimID: number;
  /** The destination account for the funds. */
  readonly Destination: string;
  /** The amount to claim. */
  readonly Amount: Amount;
}

export class XChainClaimTx extends XChainTransaction {
  override readonly TransactionType = 'XChainClaim' as const;

  /** Definition of the bridge to use. */
  readonly XChainBridge: Record<string, unknown> = undefined as any;

  /** The claim ID on the destination chain. */
  readonly XChainClaimID: number = undefined as any;

  /** The destination account for the funds. */
  readonly Destination: string = undefined as any;

  /** The amount to claim. */
  readonly Amount: Amount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'XChainClaim' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'Destination', 'XChainBridge', 'XChainClaimID'
  ] as const;

  constructor(props: XChainClaimTxFields) {
    super({ ...props, TransactionType: 'XChainClaim' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainClaim: missing or invalid XChainBridge');
    if (!isNumber(this.XChainClaimID)) throw new ValidationError('XChainClaim: missing or invalid XChainClaimID');
    if (!isAmount(this.Amount)) throw new ValidationError('XChainClaim: missing or invalid Amount');
  }
}
