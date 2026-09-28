/**
 * LoanBrokerCoverWithdraw transaction — withdraw First-Loss Capital from
 * a LoanBroker object.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanbrokercoverwithdraw
 * @see https://xrpl.org/docs/concepts/tokens/lending-protocol
 *
 * Affected amendments:
 *   - `LendingProtocolV1_1` (base LoanBrokerCoverWithdraw)
 *   - `Credentials` (CredentialIDs for permissioned-domain authorization)
 *
 * Validation rules enforced locally:
 *   - `LoanBrokerID` required, 64-char hex.
 *   - `Amount` required, valid Amount (XRP / trust line / MPT).
 *   - `Destination` if present: valid XRPL account address.
 *   - `DestinationTag` if present: number.
 *   - `CredentialIDs` if present: array of 64-char hex credential IDs.
 *
 * LoanBrokerCoverWithdraw has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount, MPTAmount } from '../types/amounts.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import {
  isAccount,
  isAmount,
  isArray,
  isHex,
  isNumber,
  isString,
} from '../validation/helpers.js';

const CREDENTIAL_ID_LENGTH = 64;

export interface LoanBrokerCoverWithdrawTxFields
  extends BaseTransactionFields {
  readonly TransactionType?: 'LoanBrokerCoverWithdraw';
  /** Loan Broker ID to withdraw First-Loss Capital from. 64-char hex. */
  readonly LoanBrokerID: string;
  /** First-Loss Capital amount to withdraw (XRP / trust line / MPT). */
  readonly Amount: Amount | MPTAmount;
  /** Optional destination account. Must be able to receive the asset. */
  readonly Destination?: string | undefined;
  /** Optional destination tag. */
  readonly DestinationTag?: number | undefined;
  /** Optional array of 64-char hex credential IDs for domain auth. */
  readonly CredentialIDs?: string[] | undefined;
}

export class LoanBrokerCoverWithdraw extends LoanTransaction {
  override readonly TransactionType = 'LoanBrokerCoverWithdraw' as const;

  readonly LoanBrokerID: string = undefined as any;
  readonly Amount: Amount | MPTAmount = undefined as any;
  readonly Destination?: string | undefined = undefined;
  readonly DestinationTag?: number | undefined = undefined;
  readonly CredentialIDs?: string[] | undefined = undefined;

  static override readonly TRANSACTION_TYPE =
    'LoanBrokerCoverWithdraw' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount',
    'CredentialIDs',
    'Destination',
    'DestinationTag',
    'LoanBrokerID',
  ] as const;

  constructor(props: LoanBrokerCoverWithdrawTxFields) {
    super({
      ...props,
      TransactionType: LoanBrokerCoverWithdraw.TRANSACTION_TYPE,
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
        'LoanBrokerCoverWithdraw: LoanBrokerID must be a 64-character hex string',
      );
    }

    if (!isAmount(this.Amount)) {
      throw new ValidationError(
        'LoanBrokerCoverWithdraw: Amount must be a valid Amount (XRP / trust line / MPT form)',
      );
    }

    if (this.Destination !== undefined && !isAccount(this.Destination)) {
      throw new ValidationError(
        'LoanBrokerCoverWithdraw: Destination must be a valid XRPL account address',
      );
    }

    if (this.DestinationTag !== undefined && !isNumber(this.DestinationTag)) {
      throw new ValidationError(
        'LoanBrokerCoverWithdraw: DestinationTag must be a number',
      );
    }

    if (this.CredentialIDs !== undefined) {
      if (!isArray(this.CredentialIDs)) {
        throw new ValidationError(
          'LoanBrokerCoverWithdraw: CredentialIDs must be an array of credential ID strings',
        );
      }
      for (let i = 0; i < this.CredentialIDs.length; i++) {
        const cid = this.CredentialIDs[i];
        if (
          !isString(cid) ||
          !isHex(cid) ||
          cid.length !== CREDENTIAL_ID_LENGTH
        ) {
          throw new ValidationError(
            `LoanBrokerCoverWithdraw: CredentialIDs[${i}] must be a ${CREDENTIAL_ID_LENGTH}-character hex string`,
          );
        }
      }
    }
  }
}