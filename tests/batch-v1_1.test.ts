/**
 * Direct tests for the Batch (BatchV1_1) transaction.
 *
 * These covers the gaps that the integration.offline round-trip test
 *
 * Note on API style: the class-based xrplt API does NOT auto-validate at
 * construction. Tests must call `tx.validate()` explicitly.
 *
 * Spec links in source file headers; key invariants:
 *   - RawTransactions is required + non-empty array
 *   - Each inner tx must have tfInnerBatchTxn flag (0x40000000)
 *   - Each inner tx must have Fee="0" (outer pays)
 *   - Each inner tx must have SigningPubKey="" (signatures on outer)
 *   - Each inner tx must have NO TxnSignature, NO Signers
 *   - Cannot nest Batch inside Batch
 *   - BatchSigners if present: each entry has required Account
 */
import { describe, it, expect } from 'vitest';
import {
  Batch,
  BatchFlags,
  GlobalFlags,
} from '../src/index.js';
import type { BatchSigner as BatchSignerType } from '../src/index.js';

const TF_INNER_BATCH_TXN = GlobalFlags.tfInnerBatchTxn; // 0x40000000
const ACCOUNT = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const ACCOUNT2 = 'rN7n7otQDd6FczRgLdSQEuzEUpToJSjkz4';

function makeInnerPayment(
  account: string = ACCOUNT,
  flags: number = TF_INNER_BATCH_TXN,
  fee: string = '0',
  signingPubKey: string = '',
): Record<string, unknown> {
  return {
    TransactionType: 'Payment',
    Account: account,
    Destination: ACCOUNT2,
    Amount: '1000000',
    Fee: fee,
    Flags: flags,
    SigningPubKey: signingPubKey,
    Sequence: 0,
  };
}

function makeBatch(
  inner: Record<string, unknown>[] = [makeInnerPayment()],
  batchSigners?: BatchSignerType[],
) {
  return new Batch({
    Account: ACCOUNT,
    Flags: BatchFlags.tfAllOrNothing,
    RawTransactions: inner.map((tx) => ({ RawTransaction: tx })),
    ...(batchSigners ? { BatchSigners: batchSigners } : {}),
  });
}

describe('Batch', () => {
  // ─── Construction ───────────────────────────────────────────────

  describe('construction', () => {
    it('constructs with required RawTransactions', () => {
      const tx = makeBatch();
      expect(tx.TransactionType).toBe('Batch');
      expect(tx.RawTransactions).toHaveLength(1);
    });

    it('accepts BatchSigners (multi-account batch)', () => {
      const tx = makeBatch([makeInnerPayment()], [
        { BatchSigner: { Account: ACCOUNT } },
        { BatchSigner: { Account: ACCOUNT2 } },
      ]);
      expect(tx.BatchSigners).toHaveLength(2);
    });
  });

  // ─── RawTransactions validation ─────────────────────────────────

  describe('RawTransactions validation', () => {
    it('rejects empty RawTransactions', () => {
      const tx = new Batch({ Account: ACCOUNT, RawTransactions: [] });
      expect(() => tx.validate()).toThrow(/RawTransactions must be a non-empty array/);
    });

    it('rejects non-array RawTransactions', () => {
      // @ts-expect-error -- intentional bad input to confirm validate() guards the runtime type
      const tx = new Batch({ Account: ACCOUNT, RawTransactions: 'nope' });
      expect(() => tx.validate()).toThrow(/RawTransactions must be a non-empty array/);
    });

    it('rejects an inner tx that is itself a Batch (no nesting)', () => {
      const tx = makeBatch([
        {
          TransactionType: 'Batch',
          Account: ACCOUNT,
          RawTransactions: [{}],
          Flags: TF_INNER_BATCH_TXN,
          Fee: '0',
          SigningPubKey: '',
        },
      ]);
      expect(() => tx.validate()).toThrow(/is a Batch transaction. Cannot nest/);
    });
  });

  // ─── Inner-tx invariants ───────────────────────────────────────

  describe('inner-tx invariants', () => {
    it('rejects inner tx missing tfInnerBatchTxn flag', () => {
      const tx = makeBatch([makeInnerPayment(ACCOUNT, 0)]);
      expect(() => tx.validate()).toThrow(/must contain the tfInnerBatchTxn flag/);
    });

    it('rejects inner tx with Fee != "0"', () => {
      const tx = makeBatch([makeInnerPayment(ACCOUNT, TF_INNER_BATCH_TXN, '10')]);
      expect(() => tx.validate()).toThrow(/Fee must be "0"/);
    });

    it('accepts inner tx with Fee = null', () => {
      const inner = makeInnerPayment();
      (inner as Record<string, unknown>).Fee = null;
      const tx = makeBatch([inner]);
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects inner tx with SigningPubKey != ""', () => {
      const tx = makeBatch([
        makeInnerPayment(ACCOUNT, TF_INNER_BATCH_TXN, '0', 'ABCDEF'),
      ]);
      expect(() => tx.validate()).toThrow(/SigningPubKey must be ""/);
    });

    it('rejects inner tx with TxnSignature present', () => {
      const inner = makeInnerPayment();
      (inner as Record<string, unknown>).TxnSignature = 'DEADBEEF';
      const tx = makeBatch([inner]);
      expect(() => tx.validate()).toThrow(/TxnSignature must be absent/);
    });

    it('rejects inner tx with Signers present', () => {
      const inner = makeInnerPayment();
      (inner as Record<string, unknown>).Signers = [];
      const tx = makeBatch([inner]);
      expect(() => tx.validate()).toThrow(/Signers must be absent/);
    });

    it('accepts a fully-compliant inner tx', () => {
      const tx = makeBatch();
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── BatchSigners validation ───────────────────────────────────

  describe('BatchSigners validation', () => {
    it('rejects BatchSigners entry without Account', () => {
      const tx = makeBatch([makeInnerPayment()], [
        { BatchSigner: {} as never },
      ]);
      expect(() => tx.validate()).toThrow(/BatchSigners\[0\].BatchSigner.Account is required/);
    });

    it('accepts BatchSigners entry with required Account', () => {
      const tx = makeBatch([makeInnerPayment()], [
        { BatchSigner: { Account: ACCOUNT } },
      ]);
      expect(() => tx.validate()).not.toThrow();
    });
  });
});