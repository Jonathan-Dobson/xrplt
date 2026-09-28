/**
 * LedgerStateFix transaction — internal fix to a ledger entry's storage
 * state that isn't triggered by user action. This transaction type is
 * used by the network itself; users typically do not submit these.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/ledgerstatefix
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface LedgerStateFixTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'LedgerStateFix';
}

export class LedgerStateFix extends Transaction {
  override readonly TransactionType = 'LedgerStateFix' as const;

  static override readonly TRANSACTION_TYPE = 'LedgerStateFix' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: LedgerStateFixTxFields) {
    super({ ...props, TransactionType: LedgerStateFix.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }
}
