/**
 * AMMDeposit transaction — add liquidity to an AMM instance.
 *
 * @see https://xrpl.org/ammdeposit.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount } from '../types/amounts.js';
import { AMMTransaction } from '../groups/amm.js';

import { ValidationError } from '../errors.js';
import { isRecord } from '../validation/helpers.js';

export interface AMMDepositTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AMMDeposit';
  readonly Asset: Record<string, unknown>;
  readonly Asset2: Record<string, unknown>;
  readonly Amount?: Amount | undefined;
  readonly Amount2?: Amount | undefined;
  readonly EPrice?: Amount | undefined;
  readonly LPTokenOut?: Amount | undefined;
}

export class AMMDepositTx extends AMMTransaction {
  override readonly TransactionType = 'AMMDeposit' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Asset2: Record<string, unknown> = undefined as any;
  readonly Amount?: Amount | undefined = undefined;
  readonly Amount2?: Amount | undefined = undefined;
  readonly EPrice?: Amount | undefined = undefined;
  readonly LPTokenOut?: Amount | undefined = undefined;

  constructor(props: AMMDepositTxFields) {
    super({ ...props, TransactionType: 'AMMDeposit' } );
    this.Asset = props.Asset as Record<string, unknown>;
    this.Asset2 = props.Asset2 as Record<string, unknown>;
        this.Amount = props.Amount as any;
    this.Amount2 = props.Amount2 as any;
    this.EPrice = props.EPrice as any;
    this.LPTokenOut = props.LPTokenOut as any;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('AMMDeposit: missing or invalid Asset');
    if (!isRecord(this.Asset2)) throw new ValidationError('AMMDeposit: missing or invalid Asset2');
  }
}
