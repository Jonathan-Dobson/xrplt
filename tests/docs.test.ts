import { describe, it, expect } from "vitest";
import { 
  Payment, 
  Transaction, 
  AccountSet, 
  TicketCreate 
} from "../src/index.js";
import { AccountSetAsfFlags } from "xrpl";

/**
 * DOCUMENTATION VERIFICATION SUITE
 * 
 * This file ensures that every code example provided in API_DOCUMENTATION.md
 * remains valid, type-safe, and functional.
 */
describe("API Documentation Examples", () => {
  
  it("Core Concepts: Serialization (toJSON)", () => {
    // Example from line 29
    const payment = new Payment({
      Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      Amount: '1000000',
      Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
    });

    const txJSON = payment.toJSON();
    expect(txJSON.TransactionType).toBe('Payment');
    expect(txJSON.Amount).toBe('1000000');
  });

  it("Core Concepts: Immutability (with)", () => {
    // Example from line 42
    const payment = new Payment({
      Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      Amount: '1000000',
      Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
    });
    
    const updated = payment.with({ Fee: '12', Sequence: 42 });
    expect(updated.Fee).toBe('12');
    expect(updated.Sequence).toBe(42);
    expect(updated.Amount).toBe('1000000'); // Original field preserved
  });

  it("Factory Patterns: Generic Factory", () => {
    // Example from line 52
    const tx = Transaction.create('NFTokenMint', {
      Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      NFTokenTaxon: 0,
    });
    expect(tx.TransactionType).toBe('NFTokenMint');
  });

  it("Factory Patterns: Convenience Factories", () => {
    // Example from line 61
    const pay = Transaction.payment({ 
      Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
      Amount: '1000000',
      Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
    });
    expect(pay.TransactionType).toBe('Payment');
  });

  it("Advanced Usage: Master Key Management", () => {
    // Example from line 125
    const alice = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
    const disableMaster = new AccountSet({
      Account: alice,
      SetFlag: AccountSetAsfFlags.asfDisableMaster,
    });
    expect(disableMaster.toJSON().SetFlag).toBe(4);
  });

  it("Advanced Usage: Ticket-Based Submissions", () => {
    // Example from line 134
    const alice = 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh';
    const ticketTx = new TicketCreate({ Account: alice, TicketCount: 1 });
    expect(ticketTx.toJSON().TicketCount).toBe(1);

    const pay = new Payment({
      Account: alice,
      Sequence: 0, 
      TicketSequence: 12345,
      Amount: '1000',
      Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe'
    });
    expect(pay.toJSON().TicketSequence).toBe(12345);
  });
});
