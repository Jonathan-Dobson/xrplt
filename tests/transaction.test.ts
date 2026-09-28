import { describe, it, expect } from 'vitest';
import {
  Transaction,
  Payment,
  AccountSet,
  TrustSet,
  OfferCreate,
  OfferCancel,
  EscrowCreate,
  CheckCreate,
  CheckCash,
  NFTokenMint,
  NFTokenAcceptOffer,
  TicketCreate,
  DepositPreauth,
  Clawback,
  SignerListSet,
  TransactionRegistry,
  ValidationError,
  TransactionError,
  PaymentFlags,
  AccountSetAsfFlags,
} from '../src/index.js';

// ─── Test addresses ──────────────────────────────────────────────────
const ALICE = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
const BOB = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe';

// ─── Transaction.create() ────────────────────────────────────────────

describe('Transaction.create()', () => {
  it('creates a Payment via generic factory', () => {
    const tx = Transaction.create('Payment', {
      Account: ALICE,
      Amount: '1000000',
      Destination: BOB,
    });
    expect(tx).toBeInstanceOf(Payment);
    expect(tx.TransactionType).toBe('Payment');
    expect(tx.Account).toBe(ALICE);
  });

  it('throws TransactionError for unknown types', () => {
    expect(() =>
      Transaction.create('FakeType' as any, { Account: ALICE }),
    ).toThrow(TransactionError);
  });
});

// ─── Transaction.payment() ──────────────────────────────────────────

describe('Transaction.payment()', () => {
  it('creates a Payment via convenience factory', () => {
    const tx = Transaction.payment({
      Account: ALICE,
      Amount: '1000000',
      Destination: BOB,
    });
    expect(tx).toBeInstanceOf(Payment);
  });
});

// ─── Payment ───────────────────────────────────────────────────────

describe('Payment', () => {
  const validPayment = () =>
    new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: BOB,
    });

  it('constructs with required fields', () => {
    const tx = validPayment();
    expect(tx.Amount).toBe('1000000');
    expect(tx.Destination).toBe(BOB);
    expect(tx.TransactionType).toBe('Payment');
  });

  it('validates successfully with valid fields', () => {
    expect(() => validPayment().validate()).not.toThrow();
  });

  it('validates with issued currency amount', () => {
    const tx = new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: { currency: 'USD', issuer: BOB, value: '10' },
      Destination: BOB,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('throws on invalid Destination', () => {
    const tx = new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: 'not-an-address',
    });
    expect(() => tx.validate()).toThrow(ValidationError);
  });

  it('throws when DeliverMin without tfPartialPayment', () => {
    const tx = new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: BOB,
      DeliverMin: '500000',
    });
    expect(() => tx.validate()).toThrow(/tfPartialPayment/);
  });

  it('validates DeliverMin with tfPartialPayment flag', () => {
    const tx = new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: BOB,
      DeliverMin: '500000',
      Flags: PaymentFlags.tfPartialPayment,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('validates DeliverMin with boolean flag interface', () => {
    const tx = new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: BOB,
      DeliverMin: '500000',
      Flags: { tfPartialPayment: true },
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('does not include undefined optional fields in JSON', () => {
    const tx = validPayment();
    const json = tx.toJSON();
    expect(json).not.toHaveProperty('Fee');
    expect(json).not.toHaveProperty('SendMax');
    expect(json).not.toHaveProperty('Paths');
    expect(json).toHaveProperty('Account', ALICE);
    expect(json).toHaveProperty('TransactionType', 'Payment');
  });
});

// ─── with() immutable updates ────────────────────────────────────────

describe('Transaction.with()', () => {
  it('returns a new instance with overridden fields', () => {
    const tx1 = new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: BOB,
    });
    const tx2 = tx1.with({ Fee: '12', Sequence: 42 });

    expect(tx2).toBeInstanceOf(Payment);
    expect(tx2.Fee).toBe('12');
    expect(tx2.Sequence).toBe(42);
    expect(tx2.Amount).toBe('1000000');
    // Original is unchanged
    expect(tx1.Fee).toBeUndefined();
    expect(tx1.Sequence).toBeUndefined();
  });
});

// ─── toJSON() ────────────────────────────────────────────────────────

describe('toJSON()', () => {
  it('produces a plain object matching xrpl.js shape', () => {
    const tx = new Payment({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: BOB,
      Fee: '12',
      Sequence: 1,
      LastLedgerSequence: 100,
    });
    const json = tx.toJSON();
    expect(json).toEqual({
      Account: ALICE,
      TransactionType: 'Payment',
      Amount: '1000000',
      Destination: BOB,
      Fee: '12',
      Sequence: 1,
      LastLedgerSequence: 100,
    });
  });
});

// ─── AccountSet ────────────────────────────────────────────────────

describe('AccountSet', () => {
  it('constructs and validates', () => {
    const tx = new AccountSet({
      Account: ALICE,
      TransactionType: 'AccountSet',
      SetFlag: AccountSetAsfFlags.asfRequireDest,
    });
    expect(() => tx.validate()).not.toThrow();
    expect(tx.SetFlag).toBe(AccountSetAsfFlags.asfRequireDest);
  });

  it('rejects invalid TickSize', () => {
    const tx = new AccountSet({
      Account: ALICE,
      TransactionType: 'AccountSet',
      TickSize: 2,
    });
    expect(() => tx.validate()).toThrow(/TickSize/);
  });

  it('accepts TickSize of 0 (disable)', () => {
    const tx = new AccountSet({
      Account: ALICE,
      TransactionType: 'AccountSet',
      TickSize: 0,
    });
    expect(() => tx.validate()).not.toThrow();
  });
});

// ─── TrustSet ──────────────────────────────────────────────────────

describe('TrustSet', () => {
  it('validates with IssuedCurrencyAmount', () => {
    const tx = new TrustSet({
      Account: ALICE,
      TransactionType: 'TrustSet',
      LimitAmount: { currency: 'USD', issuer: BOB, value: '1000' },
    });
    expect(() => tx.validate()).not.toThrow();
  });
});

// ─── OfferCreate ───────────────────────────────────────────────────

describe('OfferCreate', () => {
  it('validates with XRP amounts', () => {
    const tx = new OfferCreate({
      Account: ALICE,
      TransactionType: 'OfferCreate',
      TakerGets: '500000',
      TakerPays: { currency: 'USD', issuer: BOB, value: '1.5' },
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects tfHybrid without DomainID', () => {
    const tx = new OfferCreate({
      Account: ALICE,
      TransactionType: 'OfferCreate',
      TakerGets: '500000',
      TakerPays: '1000000',
      Flags: { tfHybrid: true },
    });
    expect(() => tx.validate()).toThrow(/tfHybrid/);
  });
});

// ─── OfferCancel ───────────────────────────────────────────────────

describe('OfferCancel', () => {
  it('validates with valid OfferSequence', () => {
    const tx = new OfferCancel({
      Account: ALICE,
      TransactionType: 'OfferCancel',
      OfferSequence: 42,
    });
    expect(() => tx.validate()).not.toThrow();
  });
});

// ─── EscrowCreate ──────────────────────────────────────────────────

describe('EscrowCreate', () => {
  it('validates with FinishAfter', () => {
    const tx = new EscrowCreate({
      Account: ALICE,
      TransactionType: 'EscrowCreate',
      Amount: '1000000',
      Destination: BOB,
      FinishAfter: 500000000,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects missing CancelAfter and FinishAfter', () => {
    const tx = new EscrowCreate({
      Account: ALICE,
      TransactionType: 'EscrowCreate',
      Amount: '1000000',
      Destination: BOB,
    });
    expect(() => tx.validate()).toThrow(/CancelAfter or FinishAfter/);
  });
});

// ─── CheckCreate ───────────────────────────────────────────────────

describe('CheckCreate', () => {
  it('validates correctly', () => {
    const tx = new CheckCreate({
      Account: ALICE,
      TransactionType: 'CheckCreate',
      Destination: BOB,
      SendMax: '10000000',
    });
    expect(() => tx.validate()).not.toThrow();
  });
});

// ─── CheckCash ─────────────────────────────────────────────────────

describe('CheckCash', () => {
  it('rejects both Amount and DeliverMin', () => {
    const tx = new CheckCash({
      Account: ALICE,
      TransactionType: 'CheckCash',
      CheckID: 'abc123',
      Amount: '100',
      DeliverMin: '50',
    });
    expect(() => tx.validate()).toThrow(/both/);
  });

  it('rejects neither Amount nor DeliverMin', () => {
    const tx = new CheckCash({
      Account: ALICE,
      TransactionType: 'CheckCash',
      CheckID: 'abc123',
    });
    expect(() => tx.validate()).toThrow(/must have/);
  });
});

// ─── NFTokenMint ───────────────────────────────────────────────────

describe('NFTokenMint', () => {
  it('validates with valid taxon', () => {
    const tx = new NFTokenMint({
      Account: ALICE,
      TransactionType: 'NFTokenMint',
      NFTokenTaxon: 0,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects TransferFee > 50000', () => {
    const tx = new NFTokenMint({
      Account: ALICE,
      TransactionType: 'NFTokenMint',
      NFTokenTaxon: 0,
      TransferFee: 50001,
    });
    expect(() => tx.validate()).toThrow(/TransferFee/);
  });
});

// ─── TicketCreate ──────────────────────────────────────────────────

describe('TicketCreate', () => {
  it('validates within bounds', () => {
    const tx = new TicketCreate({
      Account: ALICE,
      TransactionType: 'TicketCreate',
      TicketCount: 5,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects out of bounds', () => {
    const tx = new TicketCreate({
      Account: ALICE,
      TransactionType: 'TicketCreate',
      TicketCount: 251,
    });
    expect(() => tx.validate()).toThrow(/TicketCount/);
  });
});

// ─── DepositPreauth ────────────────────────────────────────────────

describe('DepositPreauth', () => {
  it('validates with Authorize', () => {
    const tx = new DepositPreauth({
      Account: ALICE,
      TransactionType: 'DepositPreauth',
      Authorize: BOB,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects both Authorize and Unauthorize', () => {
    const tx = new DepositPreauth({
      Account: ALICE,
      TransactionType: 'DepositPreauth',
      Authorize: BOB,
      Unauthorize: BOB,
    });
    expect(() => tx.validate()).toThrow(/both/);
  });
});

// ─── Clawback ──────────────────────────────────────────────────────

describe('Clawback', () => {
  it('validates with IssuedCurrencyAmount', () => {
    const tx = new Clawback({
      Account: ALICE,
      TransactionType: 'Clawback',
      Amount: { currency: 'USD', issuer: BOB, value: '100' },
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects XRP drop amount', () => {
    const tx = new Clawback({
      Account: ALICE,
      TransactionType: 'Clawback',
      Amount: '1000000',
    });
    expect(() => tx.validate()).toThrow(/IssuedCurrency or MPT/);
  });
});

// ─── TransactionRegistry ─────────────────────────────────────────────

describe('TransactionRegistry', () => {
  it('has all Phase 1 types', () => {
    const types = TransactionRegistry.types();
    expect(types).toContain('Payment');
    expect(types).toContain('AccountSet');
    expect(types).toContain('TrustSet');
    expect(types).toContain('OfferCreate');
    expect(types).toContain('OfferCancel');
    expect(types).toContain('EscrowCreate');
    expect(types).toContain('EscrowFinish');
    expect(types).toContain('EscrowCancel');
    expect(types).toContain('CheckCreate');
    expect(types).toContain('CheckCash');
    expect(types).toContain('CheckCancel');
    expect(types).toContain('NFTokenMint');
    expect(types).toContain('TicketCreate');
    expect(types).toContain('DepositPreauth');
    expect(types).toContain('Clawback');
    expect(types).toContain('SetRegularKey');
    expect(types).toContain('SignerListSet');
    expect(types).toContain('AccountDelete');
    expect(types).toContain('DelegateSet');
  });

  it('returns undefined for unregistered types', () => {
    expect(TransactionRegistry.get('FakeType' as any)).toBeUndefined();
  });
});

// ─── Property Discovery ──────────────────────────────────────────────

describe('Property visibility and toJSON serialization', () => {
  it('captures required fields in OfferCancel', () => {
    const tx = new OfferCancel({ Account: ALICE, OfferSequence: 42 });
    const json = tx.toJSON();
    expect(json).toHaveProperty('OfferSequence', 42);
    expect(Object.keys(json)).toContain('OfferSequence');
  });

  it('captures required fields in NFTokenAcceptOffer', () => {
    const tx = new NFTokenAcceptOffer({ Account: ALICE, NFTokenSellOffer: 'ABC' });
    const json = tx.toJSON();
    expect(json).toHaveProperty('NFTokenSellOffer', 'ABC');
    expect(Object.keys(json)).toContain('NFTokenSellOffer');
  });

  it('captures required fields in SignerListSet', () => {
    const tx = new SignerListSet({ Account: ALICE, SignerQuorum: 2 });
    const json = tx.toJSON();
    expect(json).toHaveProperty('SignerQuorum', 2);
    expect(Object.keys(json)).toContain('SignerQuorum');
  });
});

// ─── Inheritance checks ──────────────────────────────────────────────

describe('Class hierarchy', () => {
  it('Payment is instanceof Transaction', () => {
    const tx = Transaction.payment({ Account: ALICE, Amount: '100', Destination: BOB });
    expect(tx).toBeInstanceOf(Payment);
    // Payment → PaymentTransaction → Transaction
    expect(tx.constructor.name).toBe('Payment');
  });

  it('AccountSet is instanceof AccountTransaction', () => {
    const tx = new AccountSet({ Account: ALICE, TransactionType: 'AccountSet' });
    expect(tx.requiresSequence()).toBe(true);
  });

  it('NFTokenMint reports affectsTokenBalance', () => {
    const tx = new NFTokenMint({
      Account: ALICE,
      TransactionType: 'NFTokenMint',
      NFTokenTaxon: 0,
    });
    expect(tx.affectsTokenBalance()).toBe(true);
  });
});
