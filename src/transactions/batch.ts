/**
 * Batch transaction — submit multiple transactions in a single atomic bundle.
 *
 * BatchV1_1 amendment defines four mutually-exclusive batch modes:
 *   - `ALLORNOTHING` (tfAllOrNothing): all must succeed or none apply.
 *   - `ONLYONE` (tfOnlyOne): first success wins, others skipped.
 *   - `UNTILFAILURE` (tfUntilFailure): apply until first failure.
 *   - `INDEPENDENT` (tfIndependent): apply all regardless of failures.
 *
 * Inner transactions must:
 *   - Include the `tfInnerBatchTxn` global flag (0x40000000).
 *   - Have `Fee = "0"` (the outer tx pays all fees).
 *   - Have `SigningPubKey = ""` (signatures come from outer tx).
 *   - Omit `TxnSignature` and `Signers` (signatures live on outer).
 *   - Not themselves be a Batch (no nesting).
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/batch
 * @see https://xrpl.org/docs/concepts/transactions/batch-transactions
 *
 * Affected amendments:
 *   - `BatchV1_1` (the Batch transaction itself, including the 4 mode
 *     flags + RawTransactions/BatchSigners shapes + inner-tx invariants)
 *   - `fixInnerObjPosition` (related fix amendment)
 *
 * Validation rules enforced locally:
 *   - `RawTransactions` required, non-empty array.
 *   - Each inner tx: not a Batch; has `tfInnerBatchTxn` flag; has
 *     `Fee="0"` (or null); has `SigningPubKey=""` (or null); has no
 *     `TxnSignature`; has no `Signers`.
 *   - `BatchSigners` if present: each entry is a record with required
 *     `Account`, optional `SigningPubKey`/`TxnSignature`/`Signers`.
 *
 * Note: the 4 batch-mode flags (tfAllOrNothing, tfOnlyOne,
 * tfUntilFailure, tfIndependent) are mutually exclusive per the spec.
 * Local validation does NOT enforce this exclusivity — we trust the
 * caller to set the right mode and rely on the ledger to enforce.
 * Adding local exclusivity would over-constrain the Batch flags field
 * for legitimate multi-purpose use cases.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Signer } from '../types/common.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import {
  isArray,
  isRecord,
  isString,
} from '../validation/helpers.js';
import { GlobalFlags } from '../types/flags.js';

/**
 * A single inner transaction wrapped in the Batch's `RawTransactions` array.
 * Per BatchV1_1, the wrapping object has exactly one key: `RawTransaction`.
 */
export interface RawTransaction {
  readonly RawTransaction: Record<string, unknown>;
}

/**
 * A counterparty signature for a Batch tx. Used in multi-account batches
 * where each participating account must sign the outer tx.
 */
export interface BatchSigner {
  readonly BatchSigner: {
    readonly Account: string;
    readonly SigningPubKey?: string;
    readonly TxnSignature?: string;
    readonly Signers?: Signer[];
  };
}

export interface BatchTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'Batch';
  /**
   * Array of wrapped inner transactions. Each entry is
   * `{ RawTransaction: <tx> }`.
   */
  readonly RawTransactions: RawTransaction[];
  /** Optional array of counterparty signatures for multi-account batches. */
  readonly BatchSigners?: BatchSigner[] | undefined;
}

export class Batch extends Transaction {
  override readonly TransactionType = 'Batch' as const;

  declare readonly RawTransactions: RawTransaction[];
  readonly BatchSigners?: BatchSigner[] | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'Batch' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'BatchSigners',
    'RawTransactions',
  ] as const;

  constructor(props: BatchTxFields) {
    super({ ...props, TransactionType: Batch.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // ── RawTransactions ── required, non-empty array.
    if (!isArray(this.RawTransactions) || this.RawTransactions.length === 0) {
      throw new ValidationError(
        'Batch: RawTransactions must be a non-empty array',
      );
    }

    // ── Validate each inner transaction.
    this.RawTransactions.forEach((wrapper, index) => {
      if (!isRecord(wrapper)) {
        throw new ValidationError(
          `Batch: RawTransactions[${index}] is not an object`,
        );
      }

      const inner = wrapper.RawTransaction;
      if (inner === undefined) {
        throw new ValidationError(
          `Batch: RawTransactions[${index}] is missing the 'RawTransaction' key`,
        );
      }
      if (!isRecord(inner)) {
        throw new ValidationError(
          `Batch: RawTransactions[${index}].RawTransaction is not an object`,
        );
      }

      validateBatchInnerTransaction(inner, index);
    });

    // ── BatchSigners ── optional; if present, each entry must be a record
    //    with required Account + optional signing fields.
    if (this.BatchSigners !== undefined) {
      if (!isArray(this.BatchSigners)) {
        throw new ValidationError('Batch: BatchSigners must be an array');
      }
      this.BatchSigners.forEach((signerWrapper, index) => {
        if (!isRecord(signerWrapper)) {
          throw new ValidationError(
            `Batch: BatchSigners[${index}] is not an object`,
          );
        }
        const signer = signerWrapper.BatchSigner;
        if (!isRecord(signer)) {
          throw new ValidationError(
            `Batch: BatchSigners[${index}] is missing the 'BatchSigner' key`,
          );
        }
        if (!isString(signer.Account) || signer.Account.length === 0) {
          throw new ValidationError(
            `Batch: BatchSigners[${index}].BatchSigner.Account is required and must be a non-empty string`,
          );
        }
      });
    }
  }
}

/**
 * Per-inner-tx invariants enforced by the BatchV1_1 spec.
 * Exported for testability; not part of the public API surface.
 */
export function validateBatchInnerTransaction(
  inner: Record<string, unknown>,
  index: number,
): void {
  // ── Cannot nest a Batch inside a Batch.
  if (inner.TransactionType === 'Batch') {
    throw new ValidationError(
      `Batch: RawTransactions[${index}] is a Batch transaction. Cannot nest Batch transactions.`,
    );
  }

  // ── tfInnerBatchTxn flag (global) required.
  const flags = (inner as { Flags?: number }).Flags;
  if (
    typeof flags !== 'number' ||
    (flags & GlobalFlags.tfInnerBatchTxn) !== GlobalFlags.tfInnerBatchTxn
  ) {
    throw new ValidationError(
      `Batch: RawTransactions[${index}] must contain the tfInnerBatchTxn flag`,
    );
  }

  // ── Fee must be "0" or null (outer tx pays all fees).
  const fee = (inner as { Fee?: unknown }).Fee;
  if (fee !== '0' && fee !== null && fee !== undefined) {
    throw new ValidationError(
      `Batch: RawTransactions[${index}].RawTransaction.Fee must be "0" (outer tx pays all fees)`,
    );
  }

  // ── SigningPubKey must be "" or null.
  const signingPubKey = (inner as { SigningPubKey?: unknown }).SigningPubKey;
  if (signingPubKey !== '' && signingPubKey !== null && signingPubKey !== undefined) {
    throw new ValidationError(
      `Batch: RawTransactions[${index}].RawTransaction.SigningPubKey must be ""`,
    );
  }

  // ── TxnSignature must be absent.
  if ((inner as { TxnSignature?: unknown }).TxnSignature !== undefined) {
    throw new ValidationError(
      `Batch: RawTransactions[${index}].RawTransaction.TxnSignature must be absent`,
    );
  }

  // ── Signers must be absent.
  if ((inner as { Signers?: unknown }).Signers !== undefined) {
    throw new ValidationError(
      `Batch: RawTransactions[${index}].RawTransaction.Signers must be absent`,
    );
  }
}