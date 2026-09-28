/**
 * Direct tests for the ConfidentialMPT family.
 *
 * Covers the major validate() invariants for the 5 amendment-driven
 * transaction classes:
 * - ConfidentialMPTClawback
 * - ConfidentialMPTConvert
 * - ConfidentialMPTConvertBack
 * - ConfidentialMPTMergeInbox
 * - ConfidentialMPTSend
 *
 * The cryptographic proofs (ZKProof fields) are tested at the
 * structural level (correct byte-lengths and the conditional
 * cross-field rules), not at the cryptographic level (the ledger
 * enforces the proof verification on submission).
 */
import { describe, it, expect } from 'vitest';
import {
  ConfidentialMPTClawback,
  ConfidentialMPTConvert,
  ConfidentialMPTConvertBack,
  ConfidentialMPTMergeInbox,
  ConfidentialMPTSend,
} from '../src/index.js';

const ISSUER = 'rDB2bV1SRJcJEvJjhi7H5NUxwRpF4o3Ain';
const HOLDER = 'rhdqgMJT8JwqqBJuYU7cAxD7CGX1DeqC7m';
const MP_TOKEN_ISSUANCE_ID = '003CE81F85A1B66910DD3571C42D38A9F5A8EF78F3C8E2C0';

// 64-byte hex (128 chars)
const ZK_64 = 'E4A57C2D220860067BF61BE8DA18C4A920B90998C4B7D53C0EF0D1EB27D6E7DD51CDC8BA598F60C861C708C629930F8B91704CC9135AB22088C74FBCB888850A';

// 66-byte hex (132 chars) — ElGamal ciphertext
const CIPHERTEXT_66 = '024FAC979851DFF67543179FE35994ABDD4E08187FC356BEA2CAB7738B15E7FECD03743577C284F0A47231996E35CC7FB72D432706021E63FDE490387FFA3833E965';

// 33-byte hex (66 chars) — compressed curve point
const COMMITMENT_33 = '02CF7E8DFE5F45D51E2EBC8A03A727D30FE2F55B8323C33CDFF2BE3D0A0E9524B6';

// 32-byte hex (64 chars) — blinding factor
const BLINDING_32 = '4F2228BB35CF43764A87D4A81314CF3E4BF3E3428F42F8B51E1A3699BB299AE5';

// 33-byte holder encryption key (compressed)
const HOLDER_KEY = '0254C80DB095006FC85744E37329E0ABEB69D43276A619C022C1BA7C9F96FB9763';

// 816-byte hex (1632 chars) for ConvertBack
const ZK_816 = 'F'.repeat(1632);

// 946-byte hex (1892 chars) for Send
const ZK_946 = 'F'.repeat(1892);

describe('ConfidentialMPTClawback', () => {
  it('constructs with required fields', () => {
    const tx = new ConfidentialMPTClawback({
      Account: ISSUER,
      Holder: HOLDER,
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
      MPTAmount: '10000',
      ZKProof: ZK_64,
    });
    expect(tx.Holder).toBe(HOLDER);
    expect(tx.MPTAmount).toBe('10000');
    expect(tx.ZKProof).toBe(ZK_64);
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects malformed MPTokenIssuanceID', () => {
    const tx = new ConfidentialMPTClawback({
      Account: ISSUER,
      Holder: HOLDER,
      MPTokenIssuanceID: 'short-id',
      MPTAmount: '10000',
      ZKProof: ZK_64,
    });
    expect(() => tx.validate()).toThrow(/MPTokenIssuanceID/);
  });

  it('rejects zero MPTAmount', () => {
    const tx = new ConfidentialMPTClawback({
      Account: ISSUER,
      Holder: HOLDER,
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
      MPTAmount: '0',
      ZKProof: ZK_64,
    });
    expect(() => tx.validate()).toThrow(/MPTAmount must be non-zero/);
  });

  it('rejects malformed ZKProof (not 64 bytes)', () => {
    const tx = new ConfidentialMPTClawback({
      Account: ISSUER,
      Holder: HOLDER,
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
      MPTAmount: '10000',
      ZKProof: 'deadbeef',
    });
    expect(() => tx.validate()).toThrow(/ZKProof/);
  });

  it('rejects invalid Holder', () => {
    const tx = new ConfidentialMPTClawback({
      Account: ISSUER,
      Holder: 'not-an-address',
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
      MPTAmount: '10000',
      ZKProof: ZK_64,
    });
    expect(() => tx.validate()).toThrow(/Holder/);
  });
});

describe('ConfidentialMPTConvert', () => {
  const minimalConvert = (overrides: Record<string, unknown> = {}) =>
    new ConfidentialMPTConvert({
      Account: ISSUER,
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
      MPTAmount: '10000',
      HolderEncryptedAmount: CIPHERTEXT_66,
      IssuerEncryptedAmount: CIPHERTEXT_66,
      BlindingFactor: BLINDING_32,
      ...overrides,
    });

  it('constructs with required fields', () => {
    expect(() => minimalConvert().validate()).not.toThrow();
  });

  it('requires ZKProof when HolderEncryptionKey is present', () => {
    expect(() =>
      minimalConvert({ HolderEncryptionKey: HOLDER_KEY }).validate(),
    ).toThrow(/ZKProof required when HolderEncryptionKey/);
  });

  it('accepts ZKProof when HolderEncryptionKey is present', () => {
    expect(() =>
      minimalConvert({ HolderEncryptionKey: HOLDER_KEY, ZKProof: ZK_64 }).validate(),
    ).not.toThrow();
  });

  it('rejects malformed ciphertexts', () => {
    expect(() =>
      minimalConvert({ HolderEncryptedAmount: 'short' }).validate(),
    ).toThrow(/HolderEncryptedAmount/);
  });

  it('rejects malformed blinding factor', () => {
    expect(() =>
      minimalConvert({ BlindingFactor: '00' }).validate(),
    ).toThrow(/BlindingFactor/);
  });
});

describe('ConfidentialMPTConvertBack', () => {
  const minimalConvertBack = (overrides: Record<string, unknown> = {}) =>
    new ConfidentialMPTConvertBack({
      Account: ISSUER,
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
      MPTAmount: '10000',
      HolderEncryptedAmount: CIPHERTEXT_66,
      IssuerEncryptedAmount: CIPHERTEXT_66,
      BlindingFactor: BLINDING_32,
      BalanceCommitment: COMMITMENT_33,
      ZKProof: ZK_816,
      ...overrides,
    });

  it('constructs with all required fields', () => {
    expect(() => minimalConvertBack().validate()).not.toThrow();
  });

  it('rejects zero MPTAmount', () => {
    expect(() => minimalConvertBack({ MPTAmount: '0' }).validate()).toThrow(
      /MPTAmount must be non-zero/,
    );
  });

  it('rejects malformed BalanceCommitment', () => {
    expect(() =>
      minimalConvertBack({ BalanceCommitment: 'not66chars' }).validate(),
    ).toThrow(/BalanceCommitment/);
  });

  it('rejects malformed ZKProof (not 816 bytes)', () => {
    expect(() => minimalConvertBack({ ZKProof: ZK_64 }).validate()).toThrow(
      /ZKProof must be a 1632-char hex/,
    );
  });
});

describe('ConfidentialMPTMergeInbox', () => {
  it('constructs with single field', () => {
    const tx = new ConfidentialMPTMergeInbox({
      Account: HOLDER,
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
    });
    expect(tx.MPTokenIssuanceID).toBe(MP_TOKEN_ISSUANCE_ID);
    expect(() => tx.validate()).not.toThrow();
  });

  it('rejects malformed MPTokenIssuanceID', () => {
    const tx = new ConfidentialMPTMergeInbox({
      Account: HOLDER,
      MPTokenIssuanceID: 'nope',
    });
    expect(() => tx.validate()).toThrow(/MPTokenIssuanceID/);
  });
});

describe('ConfidentialMPTSend', () => {
  const minimalSend = (overrides: Record<string, unknown> = {}) =>
    new ConfidentialMPTSend({
      Account: HOLDER,
      MPTokenIssuanceID: MP_TOKEN_ISSUANCE_ID,
      Destination: 'rUUeVf9zJWfg7mxNCLhEXm9mfmeHBGb9w3',
      AmountCommitment: COMMITMENT_33,
      BalanceCommitment: COMMITMENT_33,
      IssuerEncryptedAmount: CIPHERTEXT_66,
      DestinationEncryptedAmount: CIPHERTEXT_66,
      SenderEncryptedAmount: CIPHERTEXT_66,
      ZKProof: ZK_946,
      ...overrides,
    });

  it('constructs with all required fields', () => {
    expect(() => minimalSend().validate()).not.toThrow();
  });

  it('rejects malformed ZKProof (not 946 bytes)', () => {
    expect(() => minimalSend({ ZKProof: ZK_64 }).validate()).toThrow(
      /ZKProof must be a 1892-char hex/,
    );
  });

  it('rejects invalid Destination', () => {
    expect(() =>
      minimalSend({ Destination: 'not-an-address' }).validate(),
    ).toThrow(/Destination/);
  });

  it('rejects malformed AmountCommitment', () => {
    expect(() => minimalSend({ AmountCommitment: 'short' }).validate()).toThrow(
      /AmountCommitment/,
    );
  });

  it('accepts optional AuditorEncryptedAmount', () => {
    expect(() =>
      minimalSend({ AuditorEncryptedAmount: CIPHERTEXT_66 }).validate(),
    ).not.toThrow();
  });
});
