/**
 * LoanSet transaction — create a new Loan ledger entry between a Loan
 * Broker and a Borrower.
 *
 * The `LoanSet` transaction is a **mutual agreement** between the Loan
 * Broker and Borrower; it must be signed by both parties. The standard
 * multi-signature flow:
 *
 *   1. The borrower or loan broker creates the transaction with the
 *      preagreed terms. They sign and set `SigningPubKey`, `TxnSignature`,
 *      `Signers`, `Account`, `Fee`, `Sequence`, and `Counterparty`.
 *   2. The counterparty verifies the terms and signature, then signs and
 *      submits — adding the `CounterpartySignature` inner object.
 *
 * Affected amendments:
 *   - `LendingProtocol` (base LoanSet + the 16 spec fields below)
 *   - `LendingProtocolV1_1` (closed-ended vault + impairment constraints
 *     are enforced by the ledger; locally we validate the field shapes)
 *   - `fixCleanup3_4_0` (interest-rate units: 1/10 basis points, range
 *     0–100000 inclusive, 0%–100%; CounterpartySignature role-specific
 *     hash prefixes)
 *
 * Validation rules enforced locally (the ledger enforces parallel rules):
 *   1. `LoanBrokerID` required, 64-char hex (ledger entry ID).
 *   2. `PrincipalRequested` required, non-negative XRPL number string.
 *   3. `Data` if present: hex, length in (0, 512] characters.
 *   4. `OverpaymentFee` if present: integer in [0, 100000].
 *   5. `InterestRate` if present: integer in [0, 100000].
 *   6. `LateInterestRate` if present: integer in [0, 100000].
 *   7. `CloseInterestRate` if present: integer in [0, 100000].
 *   8. `OverpaymentInterestRate` if present: integer in [0, 100000].
 *   9. `PaymentInterval` if present: integer ≥ 60 seconds.
 *  10. `GracePeriod` if present: must be ≤ `PaymentInterval` when both
 *      present.
 *
 * Rules deferred to the ledger:
 *   - `PrincipalRequested` / fee amounts precision relative to the
 *     vault's asset scale (tecPRECISION_LOSS).
 *   - `GracePeriod` must be ≥ 60s (we do enforce ≥ 60s on PaymentInterval
 *     but not on GracePeriod since the ledger allows GracePeriod up to
 *     PaymentInterval).
 *   - Closed-ended vault timing constraints (LendingProtocolV1_1).
 *
 * NOTE: LoanSet has the `tfLoanOverpayment` flag, but per the same MPT
 * flag-derivation gap we documented for VaultCreate, the per-bit
 * `tf*` boolean is not auto-derived from numeric `Flags`. Consumers
 * should check `tx.Flags & LoanSetFlags.tfLoanOverpayment` directly.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/loanset
 * @see https://xrpl.org/docs/concepts/tokens/lending-protocol
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { CounterpartySignature } from '../types/common.js';
import { LoanTransaction } from '../groups/loan.js';
import { ValidationError } from '../errors.js';
import {
  isAccount,
  isHex,
  isNumber,
  isString,
} from '../validation/helpers.js';

// All fees/rates are in units of 1/10 basis point (0–100000 = 0%–100%).
const MAX_RATE_1_10BP = 100_000;
// Minimum allowed PaymentInterval (seconds) — spec requires >= 60s.
const MIN_PAYMENT_INTERVAL_SECONDS = 60;
// Maximum Data field length in **characters** (hex-encoded).
const MAX_DATA_LENGTH_CHARS = 512;

export interface LoanSetTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'LoanSet';
  /** The ID of the `LoanBroker` ledger entry. 64-char hex. */
  readonly LoanBrokerID: string;
  /** Principal loan amount requested by the Borrower (XRPLNumber). */
  readonly PrincipalRequested: string;
  /** Counterparty of the loan (the Borrower when sender is Loan Broker). */
  readonly Counterparty?: string | undefined;
  /** Counterparty's signature (added by the second signer). */
  readonly CounterpartySignature?: CounterpartySignature | undefined;
  /** Arbitrary metadata in hex format, ≤ 512 characters. */
  readonly Data?: string | undefined;
  /** Nominal fee paid to LoanBroker.Owner at loan creation (XRPLNumber). */
  readonly LoanOriginationFee?: string | undefined;
  /** Nominal fee paid with every loan payment (XRPLNumber). */
  readonly LoanServiceFee?: string | undefined;
  /** Nominal fee for late payments (XRPLNumber). */
  readonly LatePaymentFee?: string | undefined;
  /** Nominal fee for early full repayment (XRPLNumber). */
  readonly ClosePaymentFee?: string | undefined;
  /** Overpayment fee in 1/10 bp units, 0–100000 (0%–100%). */
  readonly OverpaymentFee?: number | undefined;
  /** Annualized interest rate in 1/10 bp units, 0–100000 (0%–100%). */
  readonly InterestRate?: number | undefined;
  /** Premium for late payments, 1/10 bp units, 0–100000. */
  readonly LateInterestRate?: number | undefined;
  /** Early-repayment fee rate, 1/10 bp units, 0–100000. */
  readonly CloseInterestRate?: number | undefined;
  /** Interest rate on overpayments, 1/10 bp units, 0–100000. */
  readonly OverpaymentInterestRate?: number | undefined;
  /** Total number of payments to be made against the loan. */
  readonly PaymentTotal?: number | undefined;
  /** Number of seconds between loan payments (≥ 60). */
  readonly PaymentInterval?: number | undefined;
  /** Seconds after payment due date when loan can be defaulted (≤ PaymentInterval). */
  readonly GracePeriod?: number | undefined;
}

export class LoanSet extends LoanTransaction {
  override readonly TransactionType = 'LoanSet' as const;

  declare readonly LoanBrokerID: string;
  declare readonly PrincipalRequested: string;
  readonly Counterparty?: string | undefined = undefined;
  readonly CounterpartySignature?: CounterpartySignature | undefined = undefined;
  readonly Data?: string | undefined = undefined;
  readonly LoanOriginationFee?: string | undefined = undefined;
  readonly LoanServiceFee?: string | undefined = undefined;
  readonly LatePaymentFee?: string | undefined = undefined;
  readonly ClosePaymentFee?: string | undefined = undefined;
  readonly OverpaymentFee?: number | undefined = undefined;
  readonly InterestRate?: number | undefined = undefined;
  readonly LateInterestRate?: number | undefined = undefined;
  readonly CloseInterestRate?: number | undefined = undefined;
  readonly OverpaymentInterestRate?: number | undefined = undefined;
  readonly PaymentTotal?: number | undefined = undefined;
  readonly PaymentInterval?: number | undefined = undefined;
  readonly GracePeriod?: number | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'LoanSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'CloseInterestRate',
    'ClosePaymentFee',
    'Counterparty',
    'CounterpartySignature',
    'Data',
    'GracePeriod',
    'InterestRate',
    'LateInterestRate',
    'LatePaymentFee',
    'LoanBrokerID',
    'LoanOriginationFee',
    'LoanServiceFee',
    'OverpaymentFee',
    'OverpaymentInterestRate',
    'PaymentInterval',
    'PaymentTotal',
    'PrincipalRequested',
  ] as const;

  constructor(props: LoanSetTxFields) {
    super({ ...props, TransactionType: LoanSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // ── LoanBrokerID ── required, 64-char hex.
    if (
      !isString(this.LoanBrokerID) ||
      !isHex(this.LoanBrokerID) ||
      this.LoanBrokerID.length !== 64
    ) {
      throw new ValidationError(
        'LoanSet: LoanBrokerID must be a 64-character hex string',
      );
    }

    // ── PrincipalRequested ── required, non-negative base-10 integer string.
    if (
      !isString(this.PrincipalRequested) ||
      !/^[0-9]+$/u.test(this.PrincipalRequested)
    ) {
      throw new ValidationError(
        'LoanSet: PrincipalRequested must be a non-negative base-10 integer string',
      );
    }

    // ── Counterparty ── valid XRPL account if present.
    if (this.Counterparty !== undefined && !isAccount(this.Counterparty)) {
      throw new ValidationError(
        'LoanSet: Counterparty must be a valid XRPL account address',
      );
    }

    // ── Data ── hex, ≤ 512 characters.
    if (this.Data !== undefined) {
      if (!isString(this.Data) || !isHex(this.Data)) {
        throw new ValidationError(
          'LoanSet: Data must be a valid non-empty hex string',
        );
      }
      if (this.Data.length === 0 || this.Data.length > MAX_DATA_LENGTH_CHARS) {
        throw new ValidationError(
          `LoanSet: Data must be 1 to ${MAX_DATA_LENGTH_CHARS} hex characters (actual: ${this.Data.length})`,
        );
      }
    }

    // ── Rate / fee ranges (all 1/10 bp units, 0–100000).
    if (this.OverpaymentFee !== undefined && this.rateOutOfRange(this.OverpaymentFee)) {
      throw new ValidationError(
        `LoanSet: OverpaymentFee must be between 0 and ${MAX_RATE_1_10BP} inclusive`,
      );
    }
    if (this.InterestRate !== undefined && this.rateOutOfRange(this.InterestRate)) {
      throw new ValidationError(
        `LoanSet: InterestRate must be between 0 and ${MAX_RATE_1_10BP} inclusive`,
      );
    }
    if (this.LateInterestRate !== undefined && this.rateOutOfRange(this.LateInterestRate)) {
      throw new ValidationError(
        `LoanSet: LateInterestRate must be between 0 and ${MAX_RATE_1_10BP} inclusive`,
      );
    }
    if (this.CloseInterestRate !== undefined && this.rateOutOfRange(this.CloseInterestRate)) {
      throw new ValidationError(
        `LoanSet: CloseInterestRate must be between 0 and ${MAX_RATE_1_10BP} inclusive`,
      );
    }
    if (this.OverpaymentInterestRate !== undefined && this.rateOutOfRange(this.OverpaymentInterestRate)) {
      throw new ValidationError(
        `LoanSet: OverpaymentInterestRate must be between 0 and ${MAX_RATE_1_10BP} inclusive`,
      );
    }

    // ── PaymentInterval ── ≥ 60 seconds.
    if (this.PaymentInterval !== undefined) {
      if (
        !isNumber(this.PaymentInterval) ||
        !Number.isInteger(this.PaymentInterval) ||
        this.PaymentInterval < MIN_PAYMENT_INTERVAL_SECONDS
      ) {
        throw new ValidationError(
          `LoanSet: PaymentInterval must be an integer ≥ ${MIN_PAYMENT_INTERVAL_SECONDS} seconds`,
        );
      }

      // GracePeriod ≤ PaymentInterval when both present.
      if (
        this.GracePeriod !== undefined &&
        isNumber(this.GracePeriod) &&
        this.GracePeriod > this.PaymentInterval
      ) {
        throw new ValidationError(
          'LoanSet: GracePeriod must not be greater than PaymentInterval',
        );
      }
    }
  }

  /**
   * Helper: rate/fee values must be integers within the 1/10 bp range.
   * Shared by all 5 rate fields (OverpaymentFee, InterestRate, etc.).
   */
  private rateOutOfRange(value: number): boolean {
    return (
      !isNumber(value) ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > MAX_RATE_1_10BP
    );
  }
}