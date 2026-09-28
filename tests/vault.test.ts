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
  ValidationError,
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
  return new VaultCreate({ Account: OWNER, Asset: asset, ...extras });
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
      expect(() => tx.validate()).toThrow(/Data must be a non-empty hex string/);
    });

    it('rejects non-hex Data', () => {
      const tx = makeVault(IOU_ASSET, { Data: 'NOTHEX' });
      expect(() => tx.validate()).toThrow(/Data must be a non-empty hex string/);
    });

    it('rejects Data > 256 bytes', () => {
      const tx = makeVault(IOU_ASSET, { Data: 'A'.repeat(514) }); // 257 bytes
      expect(() => tx.validate()).toThrow(/Data length must be ≤ 256 bytes/);
    });

    it('accepts Data at the 256-byte cap', () => {
      const tx = makeVault(IOU_ASSET, { Data: 'A'.repeat(512) }); // 256 bytes
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects empty MPTokenMetadata', () => {
      const tx = makeVault(IOU_ASSET, { MPTokenMetadata: '' });
      expect(() => tx.validate()).toThrow(/MPTokenMetadata must be a non-empty hex string/);
    });

    it('rejects MPTokenMetadata > 1024 bytes', () => {
      const tx = makeVault(IOU_ASSET, { MPTokenMetadata: 'A'.repeat(2050) }); // 1025 bytes
      expect(() => tx.validate()).toThrow(/MPTokenMetadata length must be ≤ 1024 bytes/);
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
    it('accepts Scale=0 for XRP vaults', () => {
      const tx = makeVault(XRP_ASSET, { Scale: 0 });
      expect(() => tx.validate()).not.toThrow();
    });

    it('accepts Scale=0 for MPT vaults', () => {
      const tx = makeVault(MPT_ASSET, { Scale: 0 });
      expect(() => tx.validate()).not.toThrow();
    });

    it('rejects Scale > 0 for XRP vaults (fixed at 0)', () => {
      const tx = makeVault(XRP_ASSET, { Scale: 1 });
      expect(() => tx.validate()).toThrow(/Scale must be 0 for XRP vaults/);
    });

    it('rejects Scale > 0 for MPT vaults (fixed at 0)', () => {
      const tx = makeVault(MPT_ASSET, { Scale: 1 });
      expect(() => tx.validate()).toThrow(/Scale must be 0 for MPT vaults/);
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