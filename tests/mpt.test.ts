/**
 * Direct tests for the MPT (Multi-Purpose Token) transaction family.
 *
 * These cover the gaps that the integration.offline round-trip test
 * can't catch: local validate() rules, post-DynamicMPT + ConfidentialTransfer
 * + PermissionedDomains amendments fields/flags, and the complex
 * MPTokenIssuanceSet combination rules.
 *
 * Note on API style: the class-based xrplt API does NOT auto-validate at
 * construction (that's the fp prototype's value prop). Tests must call
 * `tx.validate()` explicitly to trigger the local guards.
 *
 * If a rule here fails, the test message quotes the spec so reviewers can
 * see why the rule exists. Spec links are in the source file headers.
 */
import { describe, it, expect } from 'vitest';
import {
  MPTokenIssuanceCreate,
  MPTokenIssuanceSet,
  MPTokenIssuanceDestroy,
  MPTokenAuthorize,
  MPTokenIssuanceCreateFlags,
  MPTokenIssuanceSetFlags,
  MPTokenImmutableFlags,
} from '../src/index.js';

const ISSUER = 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe';
const HOLDER = 'rN7n7otQDd6FczRgLdSQEuzEUpToJSjkz4';

describe('MPTokenIssuanceCreate', () => {
  it('constructs with required fields only', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      AssetScale: 4,
      MaximumAmount: '50000000',
    });
    expect(tx.TransactionType).toBe('MPTokenIssuanceCreate');
    expect(tx.AssetScale).toBe(4);
    expect(tx.MaximumAmount).toBe('50000000');
    expect(() => tx.validate()).not.toThrow();
  });

  it('accepts DomainID when tfMPTRequireAuth flag is set', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      DomainID:
        'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
      Flags: MPTokenIssuanceCreateFlags.tfMPTRequireAuth,
    });
    expect(tx.DomainID).toBeDefined();
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects DomainID without tfMPTRequireAuth flag', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      DomainID:
        'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
    });
    expect(() => tx.validate()).toThrow(/DomainID requires tfMPTRequireAuth/);
  });

  it('accepts empty DomainID / "0" (the documented way to clear)', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      DomainID: '',
      Flags: MPTokenIssuanceCreateFlags.tfMPTRequireAuth,
    });
    expect(tx.DomainID).toBe('');
    expect(() => tx.validate()).not.toThrow();

    const tx2 = new MPTokenIssuanceCreate({
      Account: ISSUER,
      DomainID: '0',
      Flags: MPTokenIssuanceCreateFlags.tfMPTRequireAuth,
    });
    expect(tx2.DomainID).toBe('0');
  });

  it('rejects non-zero TransferFee without tfMPTCanTransfer flag', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      TransferFee: 100,
    });
    expect(() => tx.validate()).toThrow(/non-zero TransferFee requires tfMPTCanTransfer/);
  });

  it('accepts non-zero TransferFee with tfMPTCanTransfer flag', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      TransferFee: 100,
      Flags: MPTokenIssuanceCreateFlags.tfMPTCanTransfer,
    });
    expect(tx.TransferFee).toBe(100);
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects TransferFee above the 50,000 basis-point cap', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      TransferFee: 50_001,
      Flags: MPTokenIssuanceCreateFlags.tfMPTCanTransfer,
    });
    expect(() => tx.validate()).toThrow(/TransferFee must be in \[0, 50000\]/);
  });

  it('accepts TransferFee at the 50,000 cap', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      TransferFee: 50_000,
      Flags: MPTokenIssuanceCreateFlags.tfMPTCanTransfer,
    });
    expect(tx.TransferFee).toBe(50_000);
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects MaximumAmount of "0"', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      MaximumAmount: '0',
    });
    expect(() => tx.validate()).toThrow(/MaximumAmount must be > 0/);
  });

  it('accepts MaximumAmount at the 2^63-1 cap', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      MaximumAmount: '9223372036854775807',
    });
    expect(tx.MaximumAmount).toBe('9223372036854775807');
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects MaximumAmount > 2^63-1', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      MaximumAmount: '9223372036854775808',
    });
    expect(() => tx.validate()).toThrow(/MaximumAmount must be <= 9223372036854775807/);
  });

  it('rejects MaximumAmount that is not a base-10 string', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      MaximumAmount: 'not-a-number',
    });
    expect(() => tx.validate()).toThrow(/MaximumAmount must be a base-10 integer string/);
  });

  it('rejects MPTokenMetadata of zero length', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      MPTokenMetadata: '',
    });
    expect(() => tx.validate()).toThrow(/MPTokenMetadata length/);
  });

  it('rejects MPTokenMetadata over 1024 bytes (2048 hex chars)', () => {
    const tooLong = 'A'.repeat(2050);
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      MPTokenMetadata: tooLong,
    });
    expect(() => tx.validate()).toThrow(/MPTokenMetadata length/);
  });

  it('accepts MPTokenMetadata at the 1024-byte cap', () => {
    const ok = 'A'.repeat(2048);
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      MPTokenMetadata: ok,
    });
    expect(tx.MPTokenMetadata).toBe(ok);
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects ImmutableFlags of 0', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      ImmutableFlags: 0,
    });
    expect(() => tx.validate()).toThrow(/ImmutableFlags must be non-zero/);
  });

  it('rejects ImmutableFlags with undefined bits', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      ImmutableFlags: 0x00000001,
    });
    expect(() => tx.validate()).toThrow(/ImmutableFlags contains undefined bits/);
  });

  it('accepts ImmutableFlags built from defined tif* bits', () => {
    const tx = new MPTokenIssuanceCreate({
      Account: ISSUER,
      ImmutableFlags:
        MPTokenImmutableFlags.tifMPTCanLock |
        MPTokenImmutableFlags.tifMPTMetadata,
    });
    expect(tx.ImmutableFlags).toBeDefined();
    expect(() => tx.validate()).not.toThrow();
  });
});

describe('MPTokenIssuanceSet', () => {
  const issuanceID = '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA';

  it('constructs with required MPTokenIssuanceID', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
    });
    expect(tx.TransactionType).toBe('MPTokenIssuanceSet');
    expect(tx.MPTokenIssuanceID).toBe(issuanceID);
  });

  it('locks all holders with tfMPTLock and no Holder', () => {
    // The Flags field on the class API is a numeric bitmask; the
    // class doesn't unpack it into individual boolean fields at
    // runtime — that's what the fp prototype does at construction.
    // For the class API, the numeric Flags property is the source
    // of truth. The validate() method reads the bits correctly.
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Flags: MPTokenIssuanceSetFlags.tfMPTLock,
    });
    expect((tx as unknown as { Flags: number }).Flags).toBe(
      MPTokenIssuanceSetFlags.tfMPTLock,
    );
  });

  it('locks a specific holder with Holder + tfMPTLock', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Holder: HOLDER,
      Flags: MPTokenIssuanceSetFlags.tfMPTLock,
    });
    expect(tx.Holder).toBe(HOLDER);
    expect((tx as unknown as { Flags: number }).Flags).toBe(
      MPTokenIssuanceSetFlags.tfMPTLock,
    );
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects tfMPTLock combined with tfMPTUnlock', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Flags:
        MPTokenIssuanceSetFlags.tfMPTLock |
        MPTokenIssuanceSetFlags.tfMPTUnlock,
    });
    expect(() => tx.validate()).toThrow(/tfMPTLock and tfMPTUnlock are mutually exclusive/);
  });

  it('rejects tfMPTLock combined with MPTokenMetadata update', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Flags: MPTokenIssuanceSetFlags.tfMPTLock,
      MPTokenMetadata: 'AABB',
    });
    expect(() => tx.validate()).toThrow(/lock\/unlock flags cannot combine with field updates/);
  });

  it('rejects tfMPTLock combined with a capability-setting flag', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Flags:
        MPTokenIssuanceSetFlags.tfMPTLock |
        MPTokenIssuanceSetFlags.tfMPTSetCanTransfer,
    });
    expect(() => tx.validate()).toThrow(/lock\/unlock flags cannot combine with/);
  });

  it('rejects tfMPTUnlock combined with tfMPTSetCanLock', () => {
    // Spec: lock/unlock cannot combine with capability-setting flags.
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Flags:
        MPTokenIssuanceSetFlags.tfMPTUnlock |
        MPTokenIssuanceSetFlags.tfMPTSetCanLock,
    });
    expect(() => tx.validate()).toThrow(/lock\/unlock flags cannot combine with/);
  });

  it('rejects both Holder and DomainID set', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Holder: HOLDER,
      DomainID:
        'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
    });
    expect(() => tx.validate()).toThrow(/Holder and DomainID are mutually exclusive/);
  });

  it('rejects AuditorEncryptionKey without IssuerEncryptionKey', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      AuditorEncryptionKey: 'A'.repeat(66),
      Flags: MPTokenIssuanceSetFlags.tfMPTSetCanHoldConfidentialBalance,
    });
    expect(() => tx.validate()).toThrow(/AuditorEncryptionKey requires IssuerEncryptionKey/);
  });

  it('accepts both IssuerEncryptionKey and AuditorEncryptionKey together', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      IssuerEncryptionKey: 'A'.repeat(66),
      AuditorEncryptionKey: 'B'.repeat(66),
      Flags: MPTokenIssuanceSetFlags.tfMPTSetCanHoldConfidentialBalance,
    });
    expect(tx.IssuerEncryptionKey).toBeDefined();
    expect(tx.AuditorEncryptionKey).toBeDefined();
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects IssuerEncryptionKey with Holder', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Holder: HOLDER,
      IssuerEncryptionKey: 'A'.repeat(66),
    });
    expect(() => tx.validate()).toThrow(/Holder cannot combine with encryption-key fields/);
  });

  it('rejects tfMPTSetCanHoldConfidentialBalance with Holder', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      Holder: HOLDER,
      Flags: MPTokenIssuanceSetFlags.tfMPTSetCanHoldConfidentialBalance,
    });
    expect(() => tx.validate()).toThrow(/tfMPTSetCanHoldConfidentialBalance cannot combine with Holder/);
  });

  it('rejects DomainID without tfMPTRequireAuth flag', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      DomainID:
        'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
    });
    expect(() => tx.validate()).toThrow(/DomainID requires tfMPTRequireAuth/);
  });

  it('accepts empty DomainID / "0" to clear without other gates', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      DomainID: '',
    });
    expect(tx.DomainID).toBe('');
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects TransferFee above 50,000', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      TransferFee: 50_001,
    });
    expect(() => tx.validate()).toThrow(/TransferFee must be in \[0, 50000\]/);
  });

  it('accepts TransferFee of 0 (clears the field)', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      TransferFee: 0,
    });
    expect(tx.TransferFee).toBe(0);
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects ImmutableFlags of 0', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      ImmutableFlags: 0,
    });
    expect(() => tx.validate()).toThrow(/ImmutableFlags must be non-zero/);
  });

  it('rejects ImmutableFlags with undefined bits', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      ImmutableFlags: 0x00004000,
    });
    expect(() => tx.validate()).toThrow(/ImmutableFlags contains undefined bits/);
  });

  it('rejects MPTokenMetadata over 1024 bytes', () => {
    const tx = new MPTokenIssuanceSet({
      Account: ISSUER,
      MPTokenIssuanceID: issuanceID,
      MPTokenMetadata: 'A'.repeat(2050),
    });
    expect(() => tx.validate()).toThrow(/MPTokenMetadata length/);
  });
});

describe('MPTokenIssuanceDestroy', () => {
  it('constructs with required MPTokenIssuanceID', () => {
    const tx = new MPTokenIssuanceDestroy({
      Account: ISSUER,
      MPTokenIssuanceID: '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA',
    });
    expect(tx.TransactionType).toBe('MPTokenIssuanceDestroy');
  });

  it('validates successfully with issuanceID', () => {
    const tx = new MPTokenIssuanceDestroy({
      Account: ISSUER,
      MPTokenIssuanceID: '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA',
    });
    expect(() => tx.validate()).not.toThrow();
  });

  it('returns affectsTokenBalance=false (ledger-level, not per-holder)', () => {
    const tx = new MPTokenIssuanceDestroy({
      Account: ISSUER,
      MPTokenIssuanceID: '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA',
    });
    expect(tx.affectsTokenBalance()).toBe(false);
  });
});

describe('MPTokenAuthorize', () => {
  it('authorizes the sender as a holder', () => {
    const tx = new MPTokenAuthorize({
      Account: HOLDER,
      MPTokenIssuanceID: '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA',
    });
    expect(tx.TransactionType).toBe('MPTokenAuthorize');
    expect(() => tx.validate()).not.toThrow();
  });

  it('authorizes a third-party holder when sender is the issuer', () => {
    const tx = new MPTokenAuthorize({
      Account: ISSUER,
      MPTokenIssuanceID: '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA',
      Holder: HOLDER,
    });
    expect(tx.Holder).toBe(HOLDER);
    expect(() => tx.validate()).not.toThrow();
  });

  it('revokes with tfMPTUnauthorize flag', () => {
    const tx = new MPTokenAuthorize({
      Account: HOLDER,
      MPTokenIssuanceID: '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA',
      Flags: 0x00000001,
    });
    expect(tx.TransactionType).toBe('MPTokenAuthorize');
    expect(() => tx.validate()).not.toThrow();
  });

  it('returns affectsTokenBalance=true (it owns an MPToken entry)', () => {
    const tx = new MPTokenAuthorize({
      Account: HOLDER,
      MPTokenIssuanceID: '05EECEBE97A7D635DE2393068691A015FED5A89AD203F5AA',
    });
    expect(tx.affectsTokenBalance()).toBe(true);
  });
});