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

export class AMMDelete extends AMMTransaction {
  override readonly TransactionType = 'AMMDelete' as const;

  readonly Asset: Record<string, unknown> = undefined as any;
  readonly Asset2: Record<string, unknown> = undefined as any;

  static override readonly TRANSACTION_TYPE = 'AMMDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Asset', 'Asset2'
  ] as const;

  constructor(props: AMMDeleteTxFields) {
    super({ ...props, TransactionType: AMMDelete.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.Asset)) throw new ValidationError('AMMDelete: missing or invalid Asset');
    if (!isRecord(this.Asset2)) throw new ValidationError('AMMDelete: missing or invalid Asset2');
  }
}
