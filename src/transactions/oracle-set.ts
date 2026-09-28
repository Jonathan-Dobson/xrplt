/**
 * OracleSet transaction — provide or update external data on the ledger.
 *
 * @see https://xrpl.org/oracleset.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isNumber, isArray } from '../validation/helpers.js';

export interface OracleSetTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'OracleSet';
  /** Unique ID for this oracle instance. */
  readonly OracleDocumentID: number;
  /** When the data was last updated. */
  readonly LastUpdateTime: number;
  /** The data series provided by the oracle. */
  readonly PriceDataSeries: Record<string, unknown>[];
  /** Source of the oracle data. */
  readonly Provider?: string | undefined;
  /** Description of the oracle. */
  readonly URI?: string | undefined;
  /** Identifier for the asset base. */
  readonly AssetBase?: string | undefined;
  /** Identifier for the asset quote. */
  readonly AssetQuote?: string | undefined;
}

export class OracleSet extends Transaction {
  override readonly TransactionType = 'OracleSet' as const;

  readonly OracleDocumentID: number = undefined as any;
  readonly LastUpdateTime: number = undefined as any;
  readonly PriceDataSeries: Record<string, unknown>[] = undefined as any;
  readonly Provider?: string | undefined = undefined;
  readonly URI?: string | undefined = undefined;
  readonly AssetBase?: string | undefined = undefined;
  readonly AssetQuote?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'OracleSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'AssetBase', 'AssetQuote', 'LastUpdateTime', 'OracleDocumentID', 'PriceDataSeries', 'Provider', 'URI'
  ] as const;

  constructor(props: OracleSetTxFields) {
    super({ ...props, TransactionType: OracleSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isNumber(this.OracleDocumentID)) throw new ValidationError('OracleSet: missing or invalid OracleDocumentID');
    if (!isNumber(this.LastUpdateTime)) throw new ValidationError('OracleSet: missing or invalid LastUpdateTime');
    if (!isArray(this.PriceDataSeries)) throw new ValidationError('OracleSet: missing or invalid PriceDataSeries');
  }
}
