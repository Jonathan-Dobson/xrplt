/**
 * AMMVote transaction — vote on the trading fee of an AMM instance.
 *
 * @see https://xrpl.org/ammvote.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { AMMTransaction } from '../groups/amm.js';
import { ValidationError } from '../errors.js';
import { isRecord, isNumber } from '../validation/helpers.js';

export interface AMMVoteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AMMVote';
  readonly Asset: Record<string, unknown>;
  readonly Asset2: Record<string, unknown>;
  /** The proposed trading fee (0-1000). */
  readonly TradingFee: number;
}

export class AMMVoteTx extends AMMTransaction {
  override readonly TransactionType = 'AMMVote' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Asset2: Record<string, unknown> = undefined as any;
  readonly TradingFee: number = undefined as any;

  static override readonly TRANSACTION_TYPE = 'AMMVote' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Asset', 'Asset2', 'TradingFee'
  ] as const;

  constructor(props: AMMVoteTxFields) {
    super({ ...props, TransactionType: 'AMMVote' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('AMMVote: missing or invalid Asset');
    if (!isRecord(this.Asset2)) throw new ValidationError('AMMVote: missing or invalid Asset2');
    if (!isNumber(this.TradingFee) || this.TradingFee < 0 || this.TradingFee > 1000) {
      throw new ValidationError('AMMVote: TradingFee must be 0-1000');
    }
  }
}
