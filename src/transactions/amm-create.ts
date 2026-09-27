/**
 * AMMCreate transaction — create a new Automated Market Maker (AMM) instance for a currency pair.
 *
 * @see https://xrpl.org/ammcreate.html
 */
import type { Amount } from '../types/amounts.js';
import type { BaseTransactionFields } from '../types/base.js';
import { AMMTransaction } from '../groups/amm.js';
import { ValidationError } from '../errors.js';
import { isAmount, isNumber } from '../validation/helpers.js';

export interface AMMCreateTxFields extends BaseTransactionFields {
  readonly TransactionType: 'AMMCreate';
  /** The first amount of the asset pair. */
  readonly Amount: Amount;
  /** The second amount of the asset pair. */
  readonly Amount2: Amount;
  /** The trading fee for this AMM (0-1000, representing 0% to 1%). */
  readonly TradingFee: number;
}

export class AMMCreateTx extends AMMTransaction {
  override readonly TransactionType = 'AMMCreate' as const;

  /** The first amount of the asset pair. */
  readonly Amount: Amount = undefined as any;

  /** The second amount of the asset pair. */
  readonly Amount2: Amount = undefined as any;

  /** The trading fee for this AMM (0-1000). */
  readonly TradingFee: number = undefined as any;

  static override readonly TRANSACTION_TYPE = 'AMMCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'Amount2', 'TradingFee'
  ] as const;

  constructor(props: AMMCreateTxFields) {
    super({ ...props, TransactionType: 'AMMCreate' });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isAmount(this.Amount)) throw new ValidationError('AMMCreate: missing or invalid Amount');
    if (!isAmount(this.Amount2)) throw new ValidationError('AMMCreate: missing or invalid Amount2');
    if (!isNumber(this.TradingFee) || this.TradingFee < 0 || this.TradingFee > 1000) {
      throw new ValidationError('AMMCreate: TradingFee must be 0-1000');
    }
  }
}
