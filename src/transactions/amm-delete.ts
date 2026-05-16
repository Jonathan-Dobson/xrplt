/**
 * AMMDelete transaction — delete an empty AMM instance.
 *
 * @see https://xrpl.org/ammdelete.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { AMMTransaction } from '../groups/amm.js';
import { ValidationError } from '../errors.js';
import { isRecord } from '../validation/helpers.js';

export interface AMMDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AMMDelete';
  readonly Asset: Record<string, unknown>;
  readonly Asset2: Record<string, unknown>;
}

export class AMMDeleteTx extends AMMTransaction {
  override readonly TransactionType = 'AMMDelete' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Asset2: Record<string, unknown> = undefined as any;

  constructor(props: AMMDeleteTxFields) {
    super({ ...props, TransactionType: 'AMMDelete' } );
    this.Asset = props.Asset as Record<string, unknown>;
    this.Asset2 = props.Asset2 as Record<string, unknown>;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('AMMDelete: missing or invalid Asset');
    if (!isRecord(this.Asset2)) throw new ValidationError('AMMDelete: missing or invalid Asset2');
  }
}
