/**
 * LoanBrokerCoverDeposit transaction — deposit First-Loss Capital into a
 * LoanBroker object. The cover protects the vault's depositors from
 * loan defaults.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanbrokercoverdeposit
 * @see https://xrpl.org/docs/concepts/tokens/lending-protocol
 *
 * Affected amendments:
 *   - `LendingProtocolV1_1` (base LoanBrokerCoverDeposit)
 *
 * Validation rules enforced locally:
 *   - `LoanBrokerID` required, 64-char hex.
 *   - `Amount` required, valid Amount (XRP / trust line / MPT).
 *
 * LoanBrokerCoverDeposit has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount, MPTAmount } from '../types/amounts.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import { isAmount, isHex, isString } from '../validation/helpers.js';

export interface LoanBrokerCoverDepositTxFields
  extends BaseTransactionFields {
  readonly TransactionType?: 'LoanBrokerCoverDeposit';
  /** The Loan Broker ID to deposit First-Loss Capital into. 64-char hex. */
  readonly LoanBrokerID: string;
  /** First-Loss Capital amount to deposit (XRP / trust line / MPT). */
  readonly Amount: Amount | MPTAmount;
}

export class LoanBrokerCoverDeposit extends LoanTransaction {
  override readonly TransactionType = 'LoanBrokerCoverDeposit' as const;

  declare readonly LoanBrokerID: string;
  declare readonly Amount: Amount | MPTAmount;
  static override readonly TRANSACTION_TYPE =
    'LoanBrokerCoverDeposit' as const;
  static override readonly ASSIGNABLE_FIELDS = ['Amount', 'LoanBrokerID'] as const;

  constructor(props: LoanBrokerCoverDepositTxFields) {
    super({
      ...props,
      TransactionType: LoanBrokerCoverDeposit.TRANSACTION_TYPE,
    });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    if (
      !isString(this.LoanBrokerID) ||
      !isHex(this.LoanBrokerID) ||
      this.LoanBrokerID.length !== 64
    ) {
      throw new ValidationError(
        'LoanBrokerCoverDeposit: LoanBrokerID must be a 64-character hex string',
      );
    }

    if (!isAmount(this.Amount)) {
      throw new ValidationError(
        'LoanBrokerCoverDeposit: Amount must be a valid Amount (XRP / trust line / MPT form)',
      );
    }
  }
}