/**
 * Direct tests for the Vault (Single-Asset Vault) transaction family.
 *
 * These cover the gaps that the integration.offline round-trip test
 * can't catch: local validate() rules, post-SingleAssetVault +
 * LendingProtocolV1_1 + PermissionedDomains + MPTokensV1 amendments
 * fields, and the closed-ended vault lifecycle invariants.
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
  VaultCreate,
  VaultCreateFlags,
  VaultSet,
  VaultDeposit,
  VaultWithdraw,
  VaultDelete,
  VaultClawback,
} from '../src/index.js';

const OWNER = 'rNGHoQwNG753zyfDrib4qDvvswtmV8Es';
const ISSUER = 'rXJSJiZMxaLuH3kQBUV5DLipnYtrE6iVb';

// ─── Asset fixtures ──────────────────────────────────────────────────

const XRP_ASSET = { currency: 'XRP' };
const IOU_ASSET = { currency: 'USD', issuer: ISSUER };
const MPT_ASSET = { mpt_issuance_id: '00000001' };

// ─── Common scaffolding ──────────────────────────────────────────────

function makeVault(
  asset: Record<string, unknown> = IOU_ASSET,
  extras: Record<string, unknown> = {},
) {
  // `Asset` is typed as Currency (XRP / trust line / MPT union) but
  // `Record<string, unknown>` allows constructing invalid shapes in tests.
  return new VaultCreate({ Account: OWNER, Asset: asset as never, ...extras });
}

describe('VaultCreate', () => {
  // ─── Construction ────────────────────────────────────────────────

  describe('construction', () => {
    it('constructs with required Asset only', () => {
      const tx = makeVault();
      expect(tx.TransactionType).toBe('VaultCreate');
      expect(tx.Asset).toEqual(IOU_ASSET);
    });

    it('accepts all 3 Asset forms (XRP, trust line, MPT)', () => {
      expect(makeVault(XRP_ASSET).Asset).toEqual(XRP_ASSET);
      expect(makeVault(IOU_ASSET).Asset).toEqual(IOU_ASSET);
      expect(makeVault(MPT_ASSET).Asset).toEqual(MPT_ASSET);
    });

    it('accepts all 10 spec fields + 2 flags', () => {
      const sub = Math.floor(Date.now() / 1000) + 1000;
      const red = sub + 3600;
      const tx = new VaultCreate({
        Account: OWNER,
        Asset: IOU_ASSET,
        AssetsMaximum: '1000000',
        Data: '5661756C74206D65746164617461',
        DomainID:
          'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
        MPTokenMetadata: '7B2274797065223A2274657374227D',
        Scale: 6,
        VaultKind: 1,
        SubscriptionDate: sub,
        RedemptionDate: red,
        WithdrawalPolicy: 0x0001,
        Flags:
          VaultCreateFlags.tfVaultPrivate |
          VaultCreateFlags.tfVaultShareNonTransferable,
      });
      // Field values
      expect(tx.VaultKind).toBe(1);
      expect(tx.Scale).toBe(6);
      expect(tx.AssetsMaximum).toBe('1000000');
      expect(tx.WithdrawalPolicy).toBe(0x0001);
      // Flags pass through; per-bit booleans are NOT auto-derived
      // (see class docstring + flag booleans test below).
      const flags = tx.Flags as number;
      expect(flags & VaultCreateFlags.tfVaultPrivate).toBe(
        VaultCreateFlags.tfVaultPrivate,
      );
      expect(flags & VaultCreateFlags.tfVaultShareNonTransferable).toBe(
        VaultCreateFlags.tfVaultShareNonTransferable,
      );
    });
  });

  // ─── Asset validation ────────────────────────────────────────────

  describe('Asset validation', () => {
    it('rejects missing Asset (no default)', () => {
      // VaultCreate sets Asset to undefined as any — but validate() catches
      // the missing shape. Note: TS prevents this at compile time, so we
      // cast through unknown to test runtime.
      const tx = makeVault();
      (tx as unknown as Record<string, unknown>).Asset = undefined;
      expect(() => tx.validate()).toThrow(/Asset must be a valid Currency/);
    });

    it('rejects Asset with extra keys', () => {
      const tx = makeVault();
      (tx as unknown as Record<string, unknown>).Asset = {
        currency: 'USD',
        issuer: ISSUER,
        value: '100',
      };
      expect(() => tx.validate()).toThrow(/Asset must be a valid Currency/);
    });

    it('rejects Asset with no recognized shape', () => {
      const tx = makeVault();
      (tx as unknown as Record<string, unknown>).Asset = { foo: 'bar' };
      expect(() => tx.validate()).toThrow(/Asset must be a valid Currency/);
    });
  });

  // ─── Data + MPTokenMetadata length validation ────────────────────

  describe('Data and MPTokenMetadata validation', () => {
    it('rejects empty Data', () => {
      const tx = makeVault(IOU_ASSET, { Data: '' });
      expect(() => tx.validate()).toThrow(/Data must be a hex string/);
    });

    it('rejects non-hex Data', () => {
      const tx = makeVault(IOU_ASSET, { Data: 'NOTHEX' });
      expect(() => tx.validate()).toThrow(/Data must be a hex string/);
    });

    it('rejects Data > 256 bytes', () => {
      const tx = makeVault(IOU_ASSET, { Data: 'A'.repeat(514) }); // 257 bytes
      expect(() => tx.validate()).toThrow(/Data exceeds 256 bytes \(actual: 257\)/);
    });

    it('rejects Data with odd hex length', () => {
      const tx = makeVault(IOU_ASSET, { Data: 'ABC' }); // 3 chars = 1.5 bytes
      expect(() => tx.validate()).toThrow(/Data must be a hex string with an even number of characters/);
    });

    it('accepts Data at the 256-byte cap', () => {
      const tx = makeVault(IOU_ASSET, { Data: 'A'.repeat(512) }); // 256 bytes
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects empty MPTokenMetadata', () => {
      const tx = makeVault(IOU_ASSET, { MPTokenMetadata: '' });
      expect(() => tx.validate()).toThrow(/MPTokenMetadata must be a valid non-empty hex string/);
    });

    it('rejects MPTokenMetadata > 1024 bytes', () => {
      const tx = makeVault(IOU_ASSET, { MPTokenMetadata: 'A'.repeat(2050) }); // 1025 bytes
      expect(() => tx.validate()).toThrow(/MPTokenMetadata exceeds 1024 bytes \(actual: 1025\)/);
    });

    it('accepts MPTokenMetadata at the 1024-byte cap', () => {
      const tx = makeVault(IOU_ASSET, { MPTokenMetadata: 'A'.repeat(2048) }); // 1024 bytes
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── WithdrawalPolicy validation ─────────────────────────────────

  describe('WithdrawalPolicy validation', () => {
    it('rejects unsupported WithdrawalPolicy values', () => {
      const tx = makeVault(IOU_ASSET, { WithdrawalPolicy: 0x0002 });
      expect(() => tx.validate()).toThrow(/WithdrawalPolicy must be 0x0001/);
    });

    it('accepts WithdrawalPolicy = 0x0001 (FCFS)', () => {
      const tx = makeVault(IOU_ASSET, { WithdrawalPolicy: 0x0001 });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── AssetsMaximum validation ─────────────────────────────────────

  describe('AssetsMaximum validation', () => {
    it('rejects non-numeric AssetsMaximum', () => {
      const tx = makeVault(IOU_ASSET, { AssetsMaximum: '100.5' });
      expect(() => tx.validate()).toThrow(/AssetsMaximum must be a non-negative base-10 integer string/);
    });

    it('rejects negative AssetsMaximum', () => {
      const tx = makeVault(IOU_ASSET, { AssetsMaximum: '-1' });
      expect(() => tx.validate()).toThrow(/AssetsMaximum must be a non-negative base-10 integer string/);
    });

    it('accepts zero AssetsMaximum', () => {
      const tx = makeVault(IOU_ASSET, { AssetsMaximum: '0' });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts large AssetsMaximum', () => {
      const tx = makeVault(IOU_ASSET, { AssetsMaximum: '1000000000000000' });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── VaultKind + closed-ended lifecycle invariants ───────────────

  describe('VaultKind + closed-ended lifecycle', () => {
    const NOW = Math.floor(Date.now() / 1000);

    it('accepts VaultKind=0 (open-ended, default)', () => {
      const tx = makeVault(IOU_ASSET, { VaultKind: 0 });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts VaultKind=1 with both dates within range', () => {
      const tx = makeVault(IOU_ASSET, {
        VaultKind: 1,
        SubscriptionDate: NOW + 1000,
        RedemptionDate: NOW + 1000 + 3600,
      });
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects VaultKind=1 missing SubscriptionDate', () => {
      const tx = makeVault(IOU_ASSET, {
        VaultKind: 1,
        RedemptionDate: NOW + 5000,
      });
      expect(() => tx.validate()).toThrow(/VaultKind=1 \(closed-ended\) requires both SubscriptionDate and RedemptionDate/);
    });

    it('rejects VaultKind=1 missing RedemptionDate', () => {
      const tx = makeVault(IOU_ASSET, {
        VaultKind: 1,
        SubscriptionDate: NOW + 1000,
      });
      expect(() => tx.validate()).toThrow(/VaultKind=1 \(closed-ended\) requires both SubscriptionDate and RedemptionDate/);
    });

    it('rejects VaultKind=0 with SubscriptionDate present', () => {
      const tx = makeVault(IOU_ASSET, {
        VaultKind: 0,
        SubscriptionDate: NOW + 1000,
        RedemptionDate: NOW + 5000,
      });
      expect(() => tx.validate()).toThrow(/VaultKind=0 \(open-ended\) must not include SubscriptionDate or RedemptionDate/);
    });

    it('rejects date gap < 180 seconds', () => {
      const tx = makeVault(IOU_ASSET, {
        VaultKind: 1,
        SubscriptionDate: NOW + 1000,
        RedemptionDate: NOW + 1100, // 100s gap
      });
      expect(() => tx.validate()).toThrow(/RedemptionDate - SubscriptionDate must be in/);
    });

    it('rejects date gap >= 30 years (946708560s)', () => {
      const tx = makeVault(IOU_ASSET, {
        VaultKind: 1,
        SubscriptionDate: NOW + 1000,
        RedemptionDate: NOW + 1000 + 946708560,
      });
      expect(() => tx.validate()).toThrow(/RedemptionDate - SubscriptionDate must be in/);
    });

    it('accepts date gap at the 180-second minimum', () => {
      const tx = makeVault(IOU_ASSET, {
        VaultKind: 1,
        SubscriptionDate: NOW + 1000,
        RedemptionDate: NOW + 1000 + 180,
      });
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects VaultKind out of range', () => {
      const tx = makeVault(IOU_ASSET, { VaultKind: 2 });
      expect(() => tx.validate()).toThrow(/VaultKind must be 0/);
    });
  });

  // ─── Scale validation (asset-type-conditional) ───────────────────

  describe('Scale validation', () => {
    it('rejects Scale for XRP vaults (must not be provided)', () => {
      const tx = makeVault(XRP_ASSET, { Scale: 1 });
      expect(() => tx.validate()).toThrow(/Scale parameter must not be provided for XRP or MPT assets/);
    });

    it('rejects Scale for MPT vaults (must not be provided)', () => {
      const tx = makeVault(MPT_ASSET, { Scale: 1 });
      expect(() => tx.validate()).toThrow(/Scale parameter must not be provided for XRP or MPT assets/);
    });

    it('rejects Scale=0 for XRP vaults too (parameter must not be provided at all)', () => {
      // The canonical impl rejects Scale on XRP/MPT even if value is 0 —
      // the spec says Scale is "must not be provided" for these asset types.
      const tx = makeVault(XRP_ASSET, { Scale: 0 });
      expect(() => tx.validate()).toThrow(/Scale parameter must not be provided/);
    });

    it('rejects Scale=0 for MPT vaults too (parameter must not be provided at all)', () => {
      const tx = makeVault(MPT_ASSET, { Scale: 0 });
      expect(() => tx.validate()).toThrow(/Scale parameter must not be provided/);
    });

    it('accepts Scale 0–18 for trust line tokens', () => {
      for (const s of [0, 6, 18]) {
        const tx = makeVault(IOU_ASSET, { Scale: s });
        expect(() => tx.validate()).not.toThrow();
      }
    });

    it('rejects Scale > 18 for trust line tokens', () => {
      const tx = makeVault(IOU_ASSET, { Scale: 19 });
      expect(() => tx.validate()).toThrow(/Scale must be an integer in \[0, 18\]/);
    });

    it('rejects non-integer Scale', () => {
      const tx = makeVault(IOU_ASSET, { Scale: 1.5 });
      expect(() => tx.validate()).toThrow(/Scale must be an integer/);
    });
  });

  // ─── DomainID validation ─────────────────────────────────────────

  describe('DomainID validation', () => {
    it('rejects DomainID that is too short', () => {
      const tx = makeVault(IOU_ASSET, { DomainID: 'A'.repeat(63) });
      expect(() => tx.validate()).toThrow(/DomainID must be a 64-character hex string/);
    });

    it('rejects DomainID with non-hex chars', () => {
      const tx = makeVault(IOU_ASSET, {
        DomainID: 'Z'.repeat(64),
      });
      expect(() => tx.validate()).toThrow(/DomainID must be a 64-character hex string/);
    });

    it('accepts a valid 64-char hex DomainID', () => {
      const tx = makeVault(IOU_ASSET, {
        DomainID:
          'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
        Flags: VaultCreateFlags.tfVaultPrivate,
      });
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects DomainID when tfVaultPrivate flag is missing', () => {
      const tx = makeVault(IOU_ASSET, {
        DomainID:
          'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
      });
      expect(() => tx.validate()).toThrow(/Cannot set DomainID unless tfVaultPrivate flag is set/);
    });

    it('accepts DomainID when tfVaultPrivate flag is set', () => {
      const tx = makeVault(IOU_ASSET, {
        DomainID:
          'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
        Flags: VaultCreateFlags.tfVaultPrivate,
      });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  // ─── Flag math ───────────────────────────────────────────────────

  describe('flag booleans', () => {
    // NOTE: per-bit booleans (tx.tfVaultPrivate, tx.tfVaultShareNonTransferable)
    // are declared on the class to satisfy VaultCreateFlagsInterface but are
    // NOT auto-derived from the numeric Flags field. This is the same gap
    // that exists in the MPT family. Use `tx.Flags` directly with the enum.

    it('passes tfVaultPrivate via Flags numeric', () => {
      const tx = makeVault(IOU_ASSET, {
        Flags: VaultCreateFlags.tfVaultPrivate,
      });
      expect(tx.Flags).toBe(VaultCreateFlags.tfVaultPrivate);
      expect((tx.Flags as number & VaultCreateFlags) & VaultCreateFlags.tfVaultPrivate).toBe(
        VaultCreateFlags.tfVaultPrivate,
      );
    });

    it('combines tfVaultPrivate + tfVaultShareNonTransferable', () => {
      const tx = makeVault(IOU_ASSET, {
        Flags:
          VaultCreateFlags.tfVaultPrivate |
          VaultCreateFlags.tfVaultShareNonTransferable,
      });
      const flags = tx.Flags as number;
      expect(flags & VaultCreateFlags.tfVaultPrivate).toBe(VaultCreateFlags.tfVaultPrivate);
      expect(flags & VaultCreateFlags.tfVaultShareNonTransferable).toBe(
        VaultCreateFlags.tfVaultShareNonTransferable,
      );
    });

    it('leaves Flags = 0 (or undefined) when not set', () => {
      const tx = makeVault(IOU_ASSET);
      const flags = tx.Flags as number | undefined;
      if (flags !== undefined) {
        expect(flags & VaultCreateFlags.tfVaultPrivate).toBe(0);
        expect(flags & VaultCreateFlags.tfVaultShareNonTransferable).toBe(0);
      }
    });
  });
});
describe('VaultSet', () => {
  const VAULT_ID =
    'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890'; // 64 hex chars
  const OWNER = 'rNGHoQwNG753zyfDrib4qDvvswtmV8Es';

  function makeVaultSet(
    extras: Record<string, unknown> = {},
    vaultId = VAULT_ID,
  ) {
    return new VaultSet({ Account: OWNER, VaultID: vaultId, ...extras });
  }

  describe('construction', () => {
    it('constructs with required VaultID only', () => {
      const tx = makeVaultSet();
      expect(tx.TransactionType).toBe('VaultSet');
      expect(tx.VaultID).toBe(VAULT_ID);
    });

    it('accepts all 4 spec fields', () => {
      const tx = new VaultSet({
        Account: OWNER,
        VaultID: VAULT_ID,
        Data: '5661756C74206D65746164617461',
        AssetsMaximum: '1000000',
        DomainID:
          'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
      });
      expect(tx.VaultID).toBe(VAULT_ID);
      expect(tx.Data).toBeDefined();
      expect(tx.AssetsMaximum).toBe('1000000');
      expect(tx.DomainID).toBeDefined();
    });
  });

  describe('VaultID validation', () => {
    it('rejects missing VaultID (undefined)', () => {
      const tx = makeVaultSet();
      (tx as unknown as Record<string, unknown>).VaultID = undefined;
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });

    it('rejects VaultID that is too short', () => {
      const tx = makeVaultSet({}, VAULT_ID.slice(0, 63));
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });

    it('rejects VaultID that is too long', () => {
      const tx = makeVaultSet({}, VAULT_ID + 'A');
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });

    it('rejects VaultID with non-hex chars', () => {
      const tx = makeVaultSet({}, 'Z'.repeat(64));
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });

    it('accepts a valid 64-char hex VaultID', () => {
      const tx = makeVaultSet();
      expect(() => tx.validate()).not.toThrow();
    });
  });

  describe('Data validation', () => {
    it('rejects empty Data', () => {
      const tx = makeVaultSet({ Data: '' });
      expect(() => tx.validate()).toThrow(/Data must be a hex string/);
    });

    it('rejects non-hex Data', () => {
      const tx = makeVaultSet({ Data: 'NOTHEX' });
      expect(() => tx.validate()).toThrow(/Data must be a hex string/);
    });

    it('rejects Data with odd hex length', () => {
      const tx = makeVaultSet({ Data: 'ABC' });
      expect(() => tx.validate()).toThrow(/Data must be a hex string with an even number of characters/);
    });

    it('rejects Data > 256 bytes', () => {
      const tx = makeVaultSet({ Data: 'A'.repeat(514) });
      expect(() => tx.validate()).toThrow(/Data exceeds 256 bytes \(actual: 257\)/);
    });

    it('accepts Data at the 256-byte cap', () => {
      const tx = makeVaultSet({ Data: 'A'.repeat(512) });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  describe('AssetsMaximum validation', () => {
    it('rejects non-numeric AssetsMaximum', () => {
      const tx = makeVaultSet({ AssetsMaximum: '100.5' });
      expect(() => tx.validate()).toThrow(/AssetsMaximum must be a non-negative base-10 integer string/);
    });

    it('rejects negative AssetsMaximum', () => {
      const tx = makeVaultSet({ AssetsMaximum: '-1' });
      expect(() => tx.validate()).toThrow(/AssetsMaximum must be a non-negative base-10 integer string/);
    });

    it('accepts zero AssetsMaximum', () => {
      const tx = makeVaultSet({ AssetsMaximum: '0' });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts large AssetsMaximum', () => {
      const tx = makeVaultSet({ AssetsMaximum: '999999999999999999' });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  describe('DomainID validation', () => {
    it('rejects DomainID that is too short', () => {
      const tx = makeVaultSet({ DomainID: 'A'.repeat(63) });
      expect(() => tx.validate()).toThrow(/DomainID must be a 64-character hex string/);
    });

    it('rejects DomainID with non-hex chars', () => {
      const tx = makeVaultSet({ DomainID: 'Z'.repeat(64) });
      expect(() => tx.validate()).toThrow(/DomainID must be a 64-character hex string/);
    });

    it('accepts a valid 64-char hex DomainID', () => {
      const tx = makeVaultSet({
        DomainID:
          'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
      });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  describe('field combination', () => {
    // NOTE: VaultSet does NOT require tfVaultPrivate for DomainID (unlike
    // VaultCreate which sets the flag). VaultSet just modifies an existing
    // vault; the flag was set at creation time.
    it('accepts DomainID without any flags (vault was already private)', () => {
      const tx = makeVaultSet({
        DomainID:
          'A730EB18A9D4BB52502C898589558B4CCEB4BE10044500EE5581137A2E80E849',
      });
      expect(() => tx.validate()).not.toThrow();
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// VaultDeposit
// ───────────────────────────────────────────────────────────────────────

describe('VaultDeposit', () => {
  const VAULT_ID =
    'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890';
  const OWNER = 'rNGHoQwNG753zyfDrib4qDvvswtmV8Es';

  function makeDeposit(
    amount: Record<string, unknown> | string = '1000000',
    vaultId = VAULT_ID,
  ) {
    // `Amount` is typed as `Amount | MPTAmount`; cast through `never` for
    // tests that intentionally construct invalid shapes.
    return new VaultDeposit({
      Account: OWNER,
      VaultID: vaultId,
      Amount: amount as never,
    });
  }

  describe('construction', () => {
    it('constructs with required VaultID + Amount (XRP)', () => {
      const tx = new VaultDeposit({
        Account: OWNER,
        VaultID: VAULT_ID,
        Amount: '1000000',
      });
      expect(tx.TransactionType).toBe('VaultDeposit');
      expect(tx.VaultID).toBe(VAULT_ID);
      expect(tx.Amount).toBe('1000000');
    });

    it('accepts trust-line Amount', () => {
      const tx = new VaultDeposit({
        Account: OWNER,
        VaultID: VAULT_ID,
        Amount: { currency: 'USD', issuer: 'rXJSJiZMxaLuH3kQBUV5DLipnYtrE6iVb', value: '100' },
      });
      expect(tx.Amount).toEqual({ currency: 'USD', issuer: 'rXJSJiZMxaLuH3kQBUV5DLipnYtrE6iVb', value: '100' });
    });

    it('accepts MPT Amount', () => {
      const tx = new VaultDeposit({
        Account: OWNER,
        VaultID: VAULT_ID,
        Amount: { mpt_issuance_id: '00000001', value: '50' },
      });
      expect(tx.Amount).toEqual({ mpt_issuance_id: '00000001', value: '50' });
    });
  });

  describe('VaultID validation', () => {
    it('rejects bad VaultID', () => {
      const tx = makeDeposit('1000000', 'NOTHEX');
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });
  });

  describe('Amount validation', () => {
    it('rejects missing Amount', () => {
      // @ts-expect-error — testing validate() rejection of missing Amount
      const tx = new VaultDeposit({
        Account: OWNER,
        VaultID: VAULT_ID,
      });
      expect(() => tx.validate()).toThrow(/Amount must be a valid Amount/);
    });

    it('rejects invalid Amount shape', () => {
      const tx = new VaultDeposit({
        Account: OWNER,
        VaultID: VAULT_ID,
        // @ts-expect-error — intentionally invalid shape (number)
        Amount: 42,
      });
      expect(() => tx.validate()).toThrow(/Amount must be a valid Amount/);
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// VaultWithdraw
// ───────────────────────────────────────────────────────────────────────

describe('VaultWithdraw', () => {
  const VAULT_ID =
    'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890';
  const OWNER = 'rNGHoQwNG753zyfDrib4qDvvswtmV8Es';
  const DEST = 'rN7n7otQDd6FczRgLdSQEuzEUpToJSjkz4';

  function makeWithdraw(extras: Record<string, unknown> = {}) {
    return new VaultWithdraw({
      Account: OWNER,
      VaultID: VAULT_ID,
      Amount: '1000000',
      ...extras,
    });
  }

  describe('construction', () => {
    it('constructs with required VaultID + Amount', () => {
      const tx = makeWithdraw();
      expect(tx.TransactionType).toBe('VaultWithdraw');
    });

    it('accepts all 5 spec fields', () => {
      const tx = new VaultWithdraw({
        Account: OWNER,
        VaultID: VAULT_ID,
        Amount: '500000',
        Destination: DEST,
        DestinationTag: 42,
        CredentialIDs: [
          'A'.repeat(64),
          'B'.repeat(64),
        ],
      });
      expect(tx.Destination).toBe(DEST);
      expect(tx.DestinationTag).toBe(42);
      expect(tx.CredentialIDs?.length).toBe(2);
    });
  });

  describe('VaultID + Amount validation', () => {
    it('rejects bad VaultID', () => {
      const tx = makeWithdraw();
      (tx as unknown as Record<string, unknown>).VaultID = 'bad';
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });

    it('rejects missing Amount', () => {
      const tx = makeWithdraw();
      (tx as unknown as Record<string, unknown>).Amount = undefined;
      expect(() => tx.validate()).toThrow(/Amount must be a valid Amount/);
    });
  });

  describe('Destination validation', () => {
    it('rejects bad Destination address', () => {
      const tx = makeWithdraw({ Destination: 'NOTADDRESS' });
      expect(() => tx.validate()).toThrow(/Destination must be a valid XRPL account address/);
    });

    it('accepts valid Destination', () => {
      const tx = makeWithdraw({ Destination: DEST });
      expect(() => tx.validate()).not.toThrow();
    });
  });

  describe('DestinationTag validation', () => {
    it('rejects non-number DestinationTag', () => {
      const tx = makeWithdraw({ DestinationTag: '123' });
      expect(() => tx.validate()).toThrow(/DestinationTag must be a number/);
    });
  });

  describe('CredentialIDs validation', () => {
    it('rejects non-array CredentialIDs', () => {
      const tx = makeWithdraw({ CredentialIDs: 'A'.repeat(64) });
      expect(() => tx.validate()).toThrow(/CredentialIDs must be an array/);
    });

    it('rejects wrong-length credential', () => {
      const tx = makeWithdraw({ CredentialIDs: ['A'.repeat(63)] });
      expect(() => tx.validate()).toThrow(/CredentialIDs\[0\] must be a 64-character hex string/);
    });

    it('rejects non-hex credential', () => {
      const tx = makeWithdraw({ CredentialIDs: ['Z'.repeat(64)] });
      expect(() => tx.validate()).toThrow(/CredentialIDs\[0\] must be a 64-character hex string/);
    });

    it('accepts array of valid 64-char hex credentials', () => {
      const tx = makeWithdraw({
        CredentialIDs: ['A'.repeat(64), 'B'.repeat(64)],
      });
      expect(() => tx.validate()).not.toThrow();
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// VaultDelete
// ───────────────────────────────────────────────────────────────────────

describe('VaultDelete', () => {
  const VAULT_ID =
    'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890';
  const OWNER = 'rNGHoQwNG753zyfDrib4qDvvswtmV8Es';

  function makeDelete(extras: Record<string, unknown> = {}) {
    return new VaultDelete({
      Account: OWNER,
      VaultID: VAULT_ID,
      ...extras,
    });
  }

  describe('construction', () => {
    it('constructs with required VaultID only', () => {
      const tx = makeDelete();
      expect(tx.TransactionType).toBe('VaultDelete');
      expect(tx.VaultID).toBe(VAULT_ID);
    });

    it('accepts optional MemoData', () => {
      const tx = makeDelete({ MemoData: '5661756C74206D65746164617461' });
      expect(tx.MemoData).toBe('5661756C74206D65746164617461');
    });
  });

  describe('VaultID validation', () => {
    it('rejects bad VaultID', () => {
      const tx = makeDelete();
      (tx as unknown as Record<string, unknown>).VaultID = 'bad';
      expect(() => tx.validate()).toThrow(/VaultID must be a 64-character hex string/);
    });
  });

  describe('MemoData validation', () => {
    it('rejects non-hex MemoData', () => {
      const tx = makeDelete({ MemoData: 'NOTHEX' });
      expect(() => tx.validate()).toThrow(/MemoData must be a hex string/);
    });

    it('rejects odd-length MemoData', () => {
      const tx = makeDelete({ MemoData: 'ABC' });
      expect(() => tx.validate()).toThrow(/MemoData must be a hex string with an even number of characters/);
    });

    it('rejects MemoData > 256 bytes', () => {
      const tx = makeDelete({ MemoData: 'A'.repeat(514) });
      expect(() => tx.validate()).toThrow(/MemoData exceeds 256 bytes \(actual: 257\)/);
    });

    it('accepts MemoData at the 256-byte cap', () => {
      const tx = makeDelete({ MemoData: 'A'.repeat(512) });
      expect(() => tx.validate()).not.toThrow();
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
// VaultClawback
// ───────────────────────────────────────────────────────────────────────

describe('VaultClawback', () => {
  const VAULT_ID =
    'ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890';
  const ISSUER = 'rXJSJiZMxaLuH3kQBUV5DLipnYtrE6iVb';
  const HOLDER = 'rN7n7otQDd6FczRgLdSQEuzEUpToJSjkz4';

  function makeClawback(extras: Record<string, unknown> = {}) {
    return new VaultClawback({
      Account: ISSUER,
      VaultID: VAULT_ID,
      Holder: HOLDER,
      ...extras,
    });
  }

  describe('construction', () => {
    it('constructs with required VaultID + Holder', () => {
      const tx = makeClawback();
      expect(tx.TransactionType).toBe('VaultClawback');
      expect(tx.Holder).toBe(HOLDER);
    });

    it('accepts optional Amount (claws back partial)', () => {
      const tx = new VaultClawback({
        Account: ISSUER,
        VaultID: VAULT_ID,
        Holder: HOLDER,
        Amount: { currency: 'USD', issuer: ISSUER, value: '50' },
      });
      expect(tx.Amount).toEqual({ currency: 'USD', issuer: ISSUER, value: '50' });
    });
  });

  describe('Holder validation', () => {
    it('rejects bad Holder address', () => {
      const tx = makeClawback();
      (tx as unknown as Record<string, unknown>).Holder = 'NOTADDRESS';
      expect(() => tx.validate()).toThrow(/Holder must be a valid XRPL account address/);
    });

    it('rejects missing Holder', () => {
      const tx = makeClawback();
      (tx as unknown as Record<string, unknown>).Holder = undefined;
      expect(() => tx.validate()).toThrow(/Holder must be a valid XRPL account address/);
    });
  });

  describe('Amount validation', () => {
    it('rejects XRP Amount (not allowed for clawback)', () => {
      const tx = makeClawback({ Amount: '1000000' });
      expect(() => tx.validate()).toThrow(/Amount must be a valid ClawbackAmount/);
    });

    it('rejects invalid Amount shape', () => {
      const tx = makeClawback({ Amount: 42 });
      expect(() => tx.validate()).toThrow(/Amount must be a valid ClawbackAmount/);
    });

    it('accepts trust-line ClawbackAmount', () => {
      const tx = makeClawback({
        Amount: { currency: 'USD', issuer: ISSUER, value: '50' },
      });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts MPT ClawbackAmount', () => {
      const tx = makeClawback({
        Amount: { mpt_issuance_id: '00000001', value: '50' },
      });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts omitted Amount (claws back all)', () => {
      const tx = makeClawback();
      expect(() => tx.validate()).not.toThrow();
    });
  });
});
