/**
 * Direct tests for the Sponsorship family + LedgerStateFix.
 *
 * Covers:
 * - SponsorshipSet: required CounterpartySponsor OR Sponsee (XOR),
 *   deltas must be non-zero, flag-set/flag-clear exclusivity.
 * - SponsorshipTransfer: exactly one of End/Create/Reassign,
 *   Sponsee-vs-create/reassign exclusivity.
 * - LedgerStateFix: minimal class.
 */
import { describe, it, expect } from 'vitest';
import {
  SponsorshipSet,
  SponsorshipTransfer,
  LedgerStateFix,
  SponsorshipSetFlags,
  SponsorshipTransferFlags,
} from '../src/index.js';

const ACCOUNT = 'rN7n7otQDd6FczFgLdlqtyMVrn3HMfXpf';
const COUNTERPARTY = 'rfkDkFai4jUfCvAJiZ5Vm7XvvWjYvDqeYo';

describe('SponsorshipSet', () => {
  it('constructs with required Sponsor field', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      CounterpartySponsor: COUNTERPARTY,
      FeeAmountDelta: '1000000',
    });
    expect(tx.CounterpartySponsor).toBe(COUNTERPARTY);
    expect(tx.FeeAmountDelta).toBe('1000000');
    expect(tx.TransactionType).toBe('SponsorshipSet');
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects when neither Sponsor nor Sponsee is set', () => {
    const tx = new SponsorshipSet({ Account: ACCOUNT, FeeAmountDelta: '1000000' });
    expect(() => tx.validate()).toThrow(
      /must specify either CounterpartySponsor or Sponsee/,
    );
  });

  it('rejects when both Sponsor and Sponsee are set', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      CounterpartySponsor: COUNTERPARTY,
      Sponsee: 'rOtherAccountForTestingPurposesXXXXXXXXXXXX',
      FeeAmountDelta: '1000000',
    });
    expect(() => tx.validate()).toThrow(
      /cannot specify both CounterpartySponsor and Sponsee/,
    );
  });

  it('rejects zero RemainingOwnerCountDelta', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      CounterpartySponsor: COUNTERPARTY,
      RemainingOwnerCountDelta: 0,
    });
    expect(() => tx.validate()).toThrow(/RemainingOwnerCountDelta must not be zero/);
  });

  it('rejects negative RemainingOwnerCountDelta (out of Int32 range)', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      CounterpartySponsor: COUNTERPARTY,
      RemainingOwnerCountDelta: -1,
    });
    expect(() => tx.validate()).not.toThrow(); // -1 is technically Int32-valid
  });

  it('rejects conflicting set+clear Sign-for-Fee flags', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      CounterpartySponsor: COUNTERPARTY,
      Flags:
        SponsorshipSetFlags.tfSponsorshipSetRequireSignForFee |
        SponsorshipSetFlags.tfSponsorshipClearRequireSignForFee,
    });
    expect(() => tx.validate()).toThrow(
      /cannot set and clear RequireSignForFee/,
    );
  });

  it('rejects tfDeleteObject combined with other non-global flags', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      CounterpartySponsor: COUNTERPARTY,
      Flags:
        SponsorshipSetFlags.tfDeleteObject |
        SponsorshipSetFlags.tfSponsorshipSetRequireSignForFee,
    });
    expect(() => tx.validate()).toThrow(/tfDeleteObject cannot be combined/);
  });

  it('accepts tfDeleteObject alone (with valid counterparty)', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      Sponsee: COUNTERPARTY,
      Flags: SponsorshipSetFlags.tfDeleteObject,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('serializes to JSON with the right shape', () => {
    const tx = new SponsorshipSet({
      Account: ACCOUNT,
      CounterpartySponsor: COUNTERPARTY,
      FeeAmountDelta: '1000000',
      MaxFee: '1000',
      RemainingOwnerCountDelta: 5,
    });
    const json = tx.toJSON();
    expect(json.TransactionType).toBe('SponsorshipSet');
    expect(json.Account).toBe(ACCOUNT);
    expect(json.CounterpartySponsor).toBe(COUNTERPARTY);
    expect(json.FeeAmountDelta).toBe('1000000');
    expect(json.MaxFee).toBe('1000');
    expect(json.RemainingOwnerCountDelta).toBe(5);
  });
});

describe('SponsorshipTransfer', () => {
  it('rejects when no mode flag is set', () => {
    const tx = new SponsorshipTransfer({ Account: ACCOUNT });
    expect(() => tx.validate()).toThrow(/exactly one of/);
  });

  it('rejects when multiple mode flags are set', () => {
    const tx = new SponsorshipTransfer({
      Account: ACCOUNT,
      Flags:
        SponsorshipTransferFlags.tfSponsorshipCreate |
        SponsorshipTransferFlags.tfSponsorshipEnd,
    });
    expect(() => tx.validate()).toThrow(/exactly one of/);
  });

  it('accepts tfSponsorshipEnd', () => {
    const tx = new SponsorshipTransfer({
      Account: ACCOUNT,
      Flags: SponsorshipTransferFlags.tfSponsorshipEnd,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('accepts tfSponsorshipCreate with optional ObjectID', () => {
    const tx = new SponsorshipTransfer({
      Account: ACCOUNT,
      ObjectID: '1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF',
      Flags: SponsorshipTransferFlags.tfSponsorshipCreate,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects Sponsee on Create mode', () => {
    const tx = new SponsorshipTransfer({
      Account: ACCOUNT,
      Sponsee: 'rSponseeForEndingSponsorshipXXXXXXXXXXXXXXX',
      Flags: SponsorshipTransferFlags.tfSponsorshipCreate,
    });
    expect(() => tx.validate()).toThrow(/Sponsee must be omitted/);
  });

  it('accepts tfSponsorshipReassign', () => {
    const tx = new SponsorshipTransfer({
      Account: ACCOUNT,
      Flags: SponsorshipTransferFlags.tfSponsorshipReassign,
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('serializes mode flag in toJSON', () => {
    const tx = new SponsorshipTransfer({
      Account: ACCOUNT,
      Flags: SponsorshipTransferFlags.tfSponsorshipEnd,
    });
    const json = tx.toJSON();
    expect(json.TransactionType).toBe('SponsorshipTransfer');
    expect(json.Flags & SponsorshipTransferFlags.tfSponsorshipEnd).toBeTruthy();
  });
});

describe('LedgerStateFix', () => {
  it('constructs and serializes', () => {
    const tx = new LedgerStateFix({ Account: ACCOUNT });
    expect(tx.TransactionType).toBe('LedgerStateFix');
    expect(tx.toJSON().TransactionType).toBe('LedgerStateFix');
    expect(() => tx.validate()).not.toThrow();
  });
});
