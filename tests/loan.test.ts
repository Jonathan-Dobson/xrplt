/**
 * Direct tests for the Loan (LendingProtocol) transaction family.
 *
 * These cover the gaps that the integration.offline round-trip test
 * can't catch: local validate() rules, post-LendingProtocol +
 * LendingProtocolV1_1 amendments fields, and the complex
 * rate-range + CounterpartySignature inner-object rules.
 *
 * Note on API style: the class-based xrplt API does NOT auto-validate at
 * construction (that's the FP prototype's value prop). Tests must call
 * `tx.validate()` explicitly to trigger the local guards.
 *
 * If a rule here fails, the test message quotes the spec so reviewers can
 * see why the rule exists. Spec links are in the source file headers.
 */
import { describe, it, expect } from 'vitest';
import {
  LoanSet,
  LoanSetFlags,
  LoanBrokerSet,
  LoanBrokerDelete,
  LoanPay,
  LoanPayFlags,
  ValidationError,
} from '../src/index.js';

// 64-char hex ledger entry ID for LoanBroker
const LOAN_BROKER_ID =
  'A1B1C3D4E5F60718293A4B5C6D7E8F900112233445566778899AABBCCDDEEFF0';
const BROKER = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const BORROWER = 'rN7n7otQDd6FczRgLdSQEuzEUpToJSjkz4';

function makeLoanSet(
  extras: Record<string, unknown> = {},
  loanBrokerId = LOAN_BROKER_ID,
) {
  return new LoanSet({
    Account: BROKER,
    LoanBrokerID: loanBrokerId,
    PrincipalRequested: '10000',
    ...extras,
  });
}

describe('LoanSet', () => {
  // ─── Construction ────────────────────────────────────────────────

  describe('construction', () => {
    it('constructs with required LoanBrokerID + PrincipalRequested', () => {
      const tx = makeLoanSet();
      expect(tx.TransactionType).toBe('LoanSet');
      expect(tx.LoanBrokerID).toBe(LOAN_BROKER_ID);
      expect(tx.PrincipalRequested).toBe('10000');
    });

    it('accepts all 18 spec fields', () => {
      const tx = new LoanSet({
        Account: BROKER,
        LoanBrokerID: LOAN_BROKER_ID,
        PrincipalRequested: '10000',
        Counterparty: BORROWER,
        CounterpartySignature: {
          SigningPubKey: '03C040CAC1E164B0E385D31E41447FE6B8960E0D202811CFDA08B55BA29E08C6B0',
          TxnSignature: '30440220AABBCCDD',
        },
        Data: '546869732069732061726269747261727920646174612061626F757420746865206C6F616E2E',
        LoanOriginationFee: '100',
        LoanServiceFee: '10',
        LatePaymentFee: '5',
        ClosePaymentFee: '20',
        OverpaymentFee: 5,
        InterestRate: 500,
        LateInterestRate: 1000,
        CloseInterestRate: 200,
        OverpaymentInterestRate: 5,
        PaymentTotal: 12,
        PaymentInterval: 2592000,
        GracePeriod: 604800,
        Flags: LoanSetFlags.tfLoanOverpayment,
      });
      expect(tx.Counterparty).toBe(BORROWER);
      expect(tx.CounterpartySignature?.SigningPubKey).toBeDefined();
      expect(tx.PaymentInterval).toBe(2592000);
      expect(tx.GracePeriod).toBe(604800);
    });
  });

  // ─── LoanBrokerID validation ────────────────────────────────────

  describe('LoanBrokerID validation', () => {
    it('rejects missing LoanBrokerID', () => {
      const tx = makeLoanSet();
      (tx as unknown as Record<string, unknown>).LoanBrokerID = undefined;
      expect(() => tx.validate()).toThrow(/LoanBrokerID must be a 64-character hex string/);
    });

    it('rejects short LoanBrokerID', () => {
      const tx = makeLoanSet({}, 'A'.repeat(63));
      expect(() => tx.validate()).toThrow(/LoanBrokerID must be a 64-character hex string/);
    });

    it('rejects non-hex LoanBrokerID', () => {
      const tx = makeLoanSet({}, 'Z'.repeat(64));
      expect(() => tx.validate()).toThrow(/LoanBrokerID must be a 64-character hex string/);
    });

    it('accepts a valid 64-char hex LoanBrokerID', () => {
      const tx = makeLoanSet();
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── PrincipalRequested validation ─────────────────────────────

  describe('PrincipalRequested validation', () => {
    it('rejects missing PrincipalRequested', () => {
      const tx = makeLoanSet();
      (tx as unknown as Record<string, unknown>).PrincipalRequested = undefined;
      expect(() => tx.validate()).toThrow(/PrincipalRequested must be a non-negative base-10 integer string/);
    });

    it('rejects negative PrincipalRequested', () => {
      const tx = makeLoanSet({ PrincipalRequested: '-100' });
      expect(() => tx.validate()).toThrow(/PrincipalRequested must be a non-negative base-10 integer string/);
    });

    it('rejects non-numeric PrincipalRequested', () => {
      const tx = makeLoanSet({ PrincipalRequested: '100.5' });
      expect(() => tx.validate()).toThrow(/PrincipalRequested must be a non-negative base-10 integer string/);
    });

    it('accepts zero PrincipalRequested', () => {
      const tx = makeLoanSet({ PrincipalRequested: '0' });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── Counterparty validation ─────────────────────────────────────

  describe('Counterparty validation', () => {
    it('rejects bad Counterparty address', () => {
      const tx = makeLoanSet({ Counterparty: 'NOTADDRESS' });
      expect(() => tx.validate()).toThrow(/Counterparty must be a valid XRPL account address/);
    });

    it('accepts valid Counterparty', () => {
      const tx = makeLoanSet({ Counterparty: BORROWER });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── CounterpartySignature inner object ─────────────────────────

  describe('CounterpartySignature inner object', () => {
    it('accepts a minimal CounterpartySignature with just SigningPubKey', () => {
      const tx = makeLoanSet({
        CounterpartySignature: {
          SigningPubKey: '03C040CAC1E164B0E385D31E41447FE6B8960E0D202811CFDA08B55BA29E08C6B0',
        },
      });
      expect(tx.CounterpartySignature?.SigningPubKey).toBeDefined();
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts a CounterpartySignature with all 3 optional fields', () => {
      const tx = makeLoanSet({
        CounterpartySignature: {
          SigningPubKey: '03C040CAC1E164B0E385D31E41447FE6B8960E0D202811CFDA08B55BA29E08C6B0',
          TxnSignature: '30440220AABBCCDD',
          Signers: [
            {
              Signer: {
                Account: BORROWER,
                SigningPubKey: '03C040CAC1E164B0E385D31E41447FE6B8960E0D202811CFDA08B55BA29E08C6B0',
                TxnSignature: '30440220AABBCCDD',
              },
            },
          ],
        },
      });
      expect(tx.CounterpartySignature?.Signers?.length).toBe(1);
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── Data validation ────────────────────────────────────────────

  describe('Data validation', () => {
    it('rejects empty Data', () => {
      const tx = makeLoanSet({ Data: '' });
      expect(() => tx.validate()).toThrow(/Data must be a valid non-empty hex string/);
    });

    it('rejects non-hex Data', () => {
      const tx = makeLoanSet({ Data: 'NOTHEX' });
      expect(() => tx.validate()).toThrow(/Data must be a valid non-empty hex string/);
    });

    it('rejects Data > 512 chars', () => {
      const tx = makeLoanSet({ Data: 'A'.repeat(514) });
      expect(() => tx.validate()).toThrow(/Data must be 1 to 512 hex characters \(actual: 514\)/);
    });

    it('accepts Data at the 512-char cap', () => {
      const tx = makeLoanSet({ Data: 'A'.repeat(512) });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── Rate / fee range validation ────────────────────────────────

  describe.each([
    ['OverpaymentFee', 100_000],
    ['InterestRate', 100_000],
    ['LateInterestRate', 100_000],
    ['CloseInterestRate', 100_000],
    ['OverpaymentInterestRate', 100_000],
  ])('%s range validation', (fieldName, maxValue) => {
    it(`rejects negative ${fieldName}`, () => {
      const tx = makeLoanSet({ [fieldName]: -1 });
      expect(() => tx.validate()).toThrow(new RegExp(`${fieldName} must be between 0 and ${maxValue}`));
    });

    it(`rejects ${fieldName} above max`, () => {
      const tx = makeLoanSet({ [fieldName]: maxValue + 1 });
      expect(() => tx.validate()).toThrow(new RegExp(`${fieldName} must be between 0 and ${maxValue}`));
    });

    it(`accepts ${fieldName} at the max`, () => {
      const tx = makeLoanSet({ [fieldName]: maxValue });
      expect(() => tx.validate()).not.toThrow();
    });

    it(`accepts ${fieldName} = 0`, () => {
      const tx = makeLoanSet({ [fieldName]: 0 });
      expect(() => tx.validate()).not.toThrow();
    });

    it(`rejects non-integer ${fieldName}`, () => {
      const tx = makeLoanSet({ [fieldName]: 1.5 });
      expect(() => tx.validate()).toThrow(new RegExp(`${fieldName} must be between 0 and ${maxValue}`));
    });
  });

  // ─── PaymentInterval + GracePeriod invariants ───────────────────

  describe('PaymentInterval + GracePeriod invariants', () => {
    it('rejects PaymentInterval < 60', () => {
      const tx = makeLoanSet({ PaymentInterval: 30 });
      expect(() => tx.validate()).toThrow(/PaymentInterval must be an integer ≥ 60/);
    });

    it('rejects non-integer PaymentInterval', () => {
      const tx = makeLoanSet({ PaymentInterval: 60.5 });
      expect(() => tx.validate()).toThrow(/PaymentInterval must be an integer ≥ 60/);
    });

    it('accepts PaymentInterval = 60 (minimum)', () => {
      const tx = makeLoanSet({ PaymentInterval: 60 });
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects GracePeriod > PaymentInterval', () => {
      const tx = makeLoanSet({ PaymentInterval: 100, GracePeriod: 200 });
      expect(() => tx.validate()).toThrow(/GracePeriod must not be greater than PaymentInterval/);
    });

    it('accepts GracePeriod == PaymentInterval', () => {
      const tx = makeLoanSet({ PaymentInterval: 100, GracePeriod: 100 });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts GracePeriod < PaymentInterval', () => {
      const tx = makeLoanSet({ PaymentInterval: 100, GracePeriod: 50 });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts GracePeriod without PaymentInterval (no cross-check possible)', () => {
      const tx = makeLoanSet({ GracePeriod: 50 });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── Flag pass-through ───────────────────────────────────────────

  describe('flag pass-through', () => {
    // Same MPT/Vault gap: per-bit booleans not auto-derived; consumers
    // use numeric Flags with the enum.

    it('passes tfLoanOverpayment via Flags numeric', () => {
      const tx = makeLoanSet({ Flags: LoanSetFlags.tfLoanOverpayment });
      const flags = tx.Flags as number;
      expect(flags & LoanSetFlags.tfLoanOverpayment).toBe(
        LoanSetFlags.tfLoanOverpayment,
      );
    });

    it('leaves Flags = 0 (or undefined) when not set', () => {
      const tx = makeLoanSet();
      const flags = tx.Flags as number | undefined;
      if (flags !== undefined) {
        expect(flags & LoanSetFlags.tfLoanOverpayment).toBe(0);
      }
    });
  });
});
// ───────────────────────────────────────────────────────────────────────
// LoanBrokerSet
// ───────────────────────────────────────────────────────────────────────

describe('LoanBrokerSet', () => {
  const VAULT_ID =
    'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890';
  const LOAN_BROKER_ID =
    'A1B1C3D4E5F60718293A4B5C6D7E8F900112233445566778899AABBCCDDEEFF0';
  const OWNER = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';

  function makeBrokerSet(
    extras: Record<string, unknown> = {},
    vaultId = VAULT_ID,
  ) {
    return new LoanBrokerSet({
      Account: OWNER,
      VaultID: vaultId,
      ...extras,
    });
  }

  describe('construction', () => {
    it('constructs with required VaultID only (create mode)', () => {
      const tx = new LoanBrokerSet({
        Account: OWNER,
        VaultID: VAULT_ID,
      });
      expect(tx.TransactionType).toBe('LoanBrokerSet');
      expect(tx.VaultID).toBe(VAULT_ID);
    });

    it('accepts all 7 spec fields (update mode with LoanBrokerID)', () => {
      const tx = new LoanBrokerSet({
        Account: OWNER,
        VaultID: VAULT_ID,
        LoanBrokerID: LOAN_BROKER_ID,
        Data: '546869732069732061726269747261727920646174612061626F757420746865206C6F616E2E',
        ManagementFeeRate: 5000,
        DebtMaximum: '1000000000',
        CoverRateMinimum: 10000,
        CoverRateLiquidation: 5000,
      });
      expect(tx.LoanBrokerID).toBe(LOAN_BROKER_ID);
      expect(tx.ManagementFeeRate).toBe(5000);
    });
  });

  describe('VaultID validation', () => {
    it('rejects bad VaultID', () => {
      const tx = makeBrokerSet({}, 'NOTHEX');
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });

    it('rejects missing VaultID', () => {
      const tx = makeBrokerSet();
      (tx as unknown as Record<string, unknown>).VaultID = undefined;
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });
  });

  describe('LoanBrokerID validation (update mode)', () => {
    it('rejects bad LoanBrokerID', () => {
      const tx = makeBrokerSet({ LoanBrokerID: 'bad' });
      expect(() => tx.validate()).toThrow(/LoanBrokerID must be a 64-character hex string/);
    });

    it('accepts valid LoanBrokerID', () => {
      const tx = makeBrokerSet({ LoanBrokerID: LOAN_BROKER_ID });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  describe('Data validation', () => {
    it('rejects Data > 512 chars', () => {
      const tx = makeBrokerSet({ Data: 'A'.repeat(514) });
      expect(() => tx.validate()).toThrow(/Data must be 1 to 512 hex characters/);
    });
  });

  describe('ManagementFeeRate validation', () => {
    it('rejects ManagementFeeRate > 10000', () => {
      const tx = makeBrokerSet({ ManagementFeeRate: 10001 });
      expect(() => tx.validate()).toThrow(/ManagementFeeRate must be between 0 and 10000/);
    });

    it('accepts ManagementFeeRate = 10000 (cap)', () => {
      const tx = makeBrokerSet({ ManagementFeeRate: 10000 });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  describe('DebtMaximum validation', () => {
    it('rejects negative DebtMaximum', () => {
      const tx = makeBrokerSet({ DebtMaximum: '-1' });
      expect(() => tx.validate()).toThrow(/DebtMaximum must be a non-negative base-10 integer string/);
    });
  });

  describe('Cover rate coupling rule', () => {
    it('rejects CoverRateMinimum set but CoverRateLiquidation = 0', () => {
      const tx = makeBrokerSet({
        CoverRateMinimum: 10000,
        CoverRateLiquidation: 0,
      });
      expect(() => tx.validate()).toThrow(/CoverRateMinimum and CoverRateLiquidation must both be zero or both be non-zero/);
    });

    it('rejects CoverRateLiquidation set but CoverRateMinimum = 0', () => {
      const tx = makeBrokerSet({
        CoverRateMinimum: 0,
        CoverRateLiquidation: 5000,
      });
      expect(() => tx.validate()).toThrow(/CoverRateMinimum and CoverRateLiquidation must both be zero or both be non-zero/);
    });

    it('accepts both CoverRate values set', () => {
      const tx = makeBrokerSet({
        CoverRateMinimum: 10000,
        CoverRateLiquidation: 5000,
      });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts both CoverRate values = 0', () => {
      const tx = makeBrokerSet({
        CoverRateMinimum: 0,
        CoverRateLiquidation: 0,
      });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts neither CoverRate value set (default 0/0)', () => {
      const tx = makeBrokerSet();
      expect(() => tx.validate()).not.toThrow();
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// LoanBrokerDelete
// ───────────────────────────────────────────────────────────────────────

describe('LoanBrokerDelete', () => {
  const LOAN_BROKER_ID =
    'A1B1C3D4E5F60718293A4B5C6D7E8F900112233445566778899AABBCCDDEEFF0';
  const OWNER = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';

  function makeBrokerDelete(loanBrokerId = LOAN_BROKER_ID) {
    return new LoanBrokerDelete({
      Account: OWNER,
      LoanBrokerID: loanBrokerId,
    });
  }

  it('constructs with required LoanBrokerID', () => {
    const tx = makeBrokerDelete();
    expect(tx.TransactionType).toBe('LoanBrokerDelete');
    expect(tx.LoanBrokerID).toBe(LOAN_BROKER_ID);
  });

  it('rejects bad LoanBrokerID', () => {
    const tx = makeBrokerDelete('bad');
    expect(() => tx.validate()).toThrow(/LoanBrokerID must be a 64-character hex string/);
  });

  it('rejects missing LoanBrokerID', () => {
    const tx = makeBrokerDelete();
    (tx as unknown as Record<string, unknown>).LoanBrokerID = undefined;
    expect(() => tx.validate()).toThrow(/LoanBrokerID must be a 64-character hex string/);
  });

  it('accepts valid LoanBrokerID', () => {
    const tx = makeBrokerDelete();
    expect(() => tx.validate()).not.toThrow();
  });
});

// ───────────────────────────────────────────────────────────────────────
// LoanPay
// ───────────────────────────────────────────────────────────────────────

describe('LoanPay', () => {
  const LOAN_ID =
    'A1B1C3D4E5F60718293A4B5C6D7E8F900112233445566778899AABBCCDDEEFF0';
  const BORROWER = 'rN7n7otQDd6FczRgLdSQEuzEUpToJSjkz4';

  function makeLoanPay(
    amount: Record<string, unknown> | string = '5000',
    loanId = LOAN_ID,
    flags?: number,
  ) {
    return new LoanPay({
      Account: BORROWER,
      LoanID: loanId,
      Amount: amount,
      ...(flags !== undefined ? { Flags: flags } : {}),
    });
  }

  describe('construction', () => {
    it('constructs with required LoanID + Amount', () => {
      const tx = makeLoanPay();
      expect(tx.TransactionType).toBe('LoanPay');
      expect(tx.LoanID).toBe(LOAN_ID);
    });
  });

  describe('LoanID + Amount validation', () => {
    it('rejects bad LoanID', () => {
      const tx = makeLoanPay('5000', 'NOTHEX');
      expect(() => tx.validate()).toThrow(/LoanID must be a 64-character hex string/);
    });

    it('rejects missing Amount', () => {
      const tx = makeLoanPay();
      (tx as unknown as Record<string, unknown>).Amount = undefined;
      expect(() => tx.validate()).toThrow(/Amount must be a valid Amount/);
    });
  });

  describe('payment-type flag exclusivity', () => {
    it('accepts a single flag', () => {
      const tx = makeLoanPay('5000', LOAN_ID, 0x00010000); // tfLoanOverpayment
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects tfLoanOverpayment + tfLoanFullPayment', () => {
      const tx = makeLoanPay('5000', LOAN_ID, 0x00010000 | 0x00020000);
      expect(() => tx.validate()).toThrow(/Only one of tfLoanLatePayment, tfLoanFullPayment, or tfLoanOverpayment flags can be set/);
    });

    it('rejects tfLoanFullPayment + tfLoanLatePayment', () => {
      const tx = makeLoanPay('5000', LOAN_ID, 0x00020000 | 0x00040000);
      expect(() => tx.validate()).toThrow(/Only one of tfLoanLatePayment, tfLoanFullPayment, or tfLoanOverpayment flags can be set/);
    });

    it('rejects all 3 payment flags', () => {
      const tx = makeLoanPay('5000', LOAN_ID, 0x00010000 | 0x00020000 | 0x00040000);
      expect(() => tx.validate()).toThrow(/Only one of tfLoanLatePayment, tfLoanFullPayment, or tfLoanOverpayment flags can be set/);
    });

    it('accepts Flags = 0 (no payment type set)', () => {
      const tx = makeLoanPay('5000', LOAN_ID, 0);
      expect(() => tx.validate()).not.toThrow();
    });
  });
});
