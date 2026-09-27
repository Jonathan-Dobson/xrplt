/**
 * AMMWithdraw transaction — remove liquidity from an AMM instance.
 *
 * @see https://xrpl.org/ammwithdraw.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import { AMMTransaction } from '../groups/amm.js';

import { ValidationError } from '../errors.js';
import { isRecord } from '../validation/helpers.js';

export interface AMMWithdrawTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AMMWithdraw';
  readonly Asset: Record<string, unknown>;
  readonly Asset2: Record<string, unknown>;
  readonly Amount?: Amount | undefined;
  readonly Amount2?: Amount | undefined;
  readonly EPrice?: Amount | undefined;
  readonly LPTokenIn?: Amount | undefined;
}

export class AMMWithdrawTx extends AMMTransaction {
  override readonly TransactionType = 'AMMWithdraw' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Asset2: Record<string, unknown> = undefined as any;
  readonly Amount?: Amount | undefined = undefined;
  readonly Amount2?: Amount | undefined = undefined;
  readonly EPrice?: Amount | undefined = undefined;
  readonly LPTokenIn?: Amount | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'AMMWithdraw' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'Amount2', 'Asset', 'Asset2', 'EPrice', 'LPTokenIn'
  ] as const;

  constructor(props: AMMWithdrawTxFields) {
    super({ ...props, TransactionType: 'AMMWithdraw' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('AMMWithdraw: missing or invalid Asset');
    if (!isRecord(this.Asset2)) throw new ValidationError('AMMWithdraw: missing or invalid Asset2');
  }
}
