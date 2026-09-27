/**
 * MPTokenIssuanceCreate transaction — create a new Multi-Purpose Token (MPT) issuance.
 *
 * Fields captured here come from the upstream docs/references/protocol/
 * transactions/types/mptokenissuancecreate.md page in the xrpl-dev-portal
 * mirror. Six fields on top of the original (MaximumAmount, AssetScale,
 * TransferFee, MPTokenMetadata) plus two new ones:
 *
 *   - `DomainID` — gated by the PermissionedDomains amendment, requires
 *     `tfMPTRequireAuth` to be set.
 *   - `ImmutableFlags` — bitfield declared at creation time; the specified
 *     fields/capability flags can never be changed after issuance. Gated
 *     by the DynamicMPT amendment.
 *
 * Capability-setting flags (`tfMPTCanLock`, `tfMPTCanTransfer`, ...,
 * `tfMPTCanHoldConfidentialBalance`) ride on the standard `Flags` field
 * via `MPTokenIssuanceCreateFlags` and are defined in `src/types/flags.ts`.
 * The `tifMPTCanLock` / `tifMPTMetadata` style flags are BITS inside the
 * `ImmutableFlags` number, not separate JSON fields.
 *
 * Validation rules enforced here (ledger enforces parallel rules; we
 * catch them earlier in the dev loop):
 *
 *   - `TransferFee` non-zero requires `tfMPTCanTransfer` flag.
 *   - `TransferFee` <= 50,000 (enforced by ledger as `temBAD_TRANSFER_FEE`).
 *   - `MaximumAmount` > 0 and <= 2^63 - 1.
 *   - `MPTokenMetadata` length in (0, 1024] bytes when given as hex.
 *   - `DomainID` requires `tfMPTRequireAuth` flag.
 *   - `ImmutableFlags` must be non-zero and use only defined bits.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuancecreate
 */
import type { BaseTransactionFields } from '../types/base.js';
import type {
  MPTokenIssuanceCreateFlagsInterface,
} from '../types/flags.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isNumber, isString } from '../validation/helpers.js';

// Maximum allowed transfer fee in basis points (0.000% — 50.000%).
const MAX_TRANSFER_FEE = 50_000;
// Maximum amount per the current spec (2^63 - 1, encoded as a base-10 string).
const MAX_ISSUANCE_AMOUNT = '9223372036854775807';
// Maximum encoded metadata length in bytes.
const MAX_METADATA_BYTES = 1024;

// Bitmask of all known `tif*` bits (used to validate `ImmutableFlags`).
const KNOWN_IMMUTABLE_FLAG_BITS =
  0x00000002 | // tifMPTCanLock
  0x00000004 | // tifMPTRequireAuth
  0x00000008 | // tifMPTCanEscrow
  0x00000010 | // tifMPTCanTrade
  0x00000020 | // tifMPTCanTransfer
  0x00000040 | // tifMPTCanClawback
  0x00000080 | // tifMPTCanHoldConfidentialBalance
  0x00010000 | // tifMPTMetadata
  0x00020000; // tifMPTTransferFee

export interface MPTokenIssuanceCreateTxFields
  extends BaseTransactionFields {
  readonly TransactionType: 'MPTokenIssuanceCreate';
  /** Decimal precision for the MPT (0–15). Determines share conversion scale. */
  readonly AssetScale?: number | undefined;
  /**
   * Ledger entry ID of a permissioned domain restricting access. Requires
   * `tfMPTRequireAuth` to be set. Requires both `PermissionedDomains`
   * and `SingleAssetVault` amendments enabled on the ledger.
   */
  readonly DomainID?: string | undefined;
  /**
   * Secondary-sale transfer fee in basis points (0–50,000). Non-zero
   * values require the `tfMPTCanTransfer` flag.
   */
  readonly TransferFee?: number | undefined;
  /**
   * Maximum amount of this MPT that can ever be issued, encoded as a
   * base-10 number string. Current spec allows up to 2^63-1.
   */
  readonly MaximumAmount?: string | undefined;
  /**
   * Arbitrary metadata about this issuance. Hex-encoded; 0 < length <= 1024
   * bytes after decoding.
   */
  readonly MPTokenMetadata?: string | undefined;
  /**
   * Bitmask of flags declaring which fields and capability flags are
   * immutable from issuance onward. Requires the `DynamicMPT` amendment.
   */
  readonly ImmutableFlags?: number | undefined;
}

export class MPTokenIssuanceCreate
  extends TokenTransaction
  implements MPTokenIssuanceCreateFlagsInterface
{
  override readonly TransactionType = 'MPTokenIssuanceCreate' as const;

  readonly AssetScale?: number | undefined = undefined;
  readonly DomainID?: string | undefined = undefined;
  readonly TransferFee?: number | undefined = undefined;
  readonly MaximumAmount?: string | undefined = undefined;
  readonly MPTokenMetadata?: string | undefined = undefined;
  readonly ImmutableFlags?: number | undefined = undefined;

  // Capability flag booleans (matches `MPTokenIssuanceCreateFlagsInterface`).
  // `?: boolean` under `exactOptionalPropertyTypes: true` resolves to
  // "may be absent or boolean" (not "may be undefined"), so we omit the
  // explicit `| undefined` here — the assignment default of undefined
  // satisfies the absent case.
  readonly tfMPTCanLock?: boolean = undefined;
  readonly tfMPTRequireAuth?: boolean = undefined;
  readonly tfMPTCanEscrow?: boolean = undefined;
  readonly tfMPTCanTrade?: boolean = undefined;
  readonly tfMPTCanTransfer?: boolean = undefined;
  readonly tfMPTCanClawback?: boolean = undefined;
  readonly tfMPTCanHoldConfidentialBalance?: boolean = undefined;

  static override readonly TRANSACTION_TYPE = 'MPTokenIssuanceCreate' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'AssetScale',
    'DomainID',
    'ImmutableFlags',
    'MPTokenMetadata',
    'MaximumAmount',
    'TransferFee',
  ] as const;

  constructor(props: MPTokenIssuanceCreateTxFields) {
    super({ ...props, TransactionType: MPTokenIssuanceCreate.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  // Creating an MPT issuance doesn't move balances — the issuance object
  // has only `OutstandingAmount` metadata. Ledger tracks the issuance
  // separately, not as a holder balance, so this returns false here.
  override affectsTokenBalance(): boolean {
    return false;
  }

  override validate(): void {
    super.validate();

    const self = this as unknown as Record<string, unknown>;
    const flags = (self.Flags as number | undefined) ?? 0;

    if (this.TransferFee !== undefined) {
      if (!isNumber(this.TransferFee)) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: TransferFee must be a number',
        );
      }
      if (this.TransferFee < 0 || this.TransferFee > MAX_TRANSFER_FEE) {
        throw new ValidationError(
          `MPTokenIssuanceCreate: TransferFee must be in [0, ${MAX_TRANSFER_FEE}]`,
        );
      }
      if (this.TransferFee !== 0 && (flags & 0x00000020) === 0) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: non-zero TransferFee requires tfMPTCanTransfer flag',
        );
      }
    }

    if (this.MaximumAmount !== undefined) {
      if (!isString(this.MaximumAmount)) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: MaximumAmount must be a string',
        );
      }
      if (this.MaximumAmount === '0') {
        throw new ValidationError(
          'MPTokenIssuanceCreate: MaximumAmount must be > 0',
        );
      }
      try {
        const n = BigInt(this.MaximumAmount);
        const max = BigInt(MAX_ISSUANCE_AMOUNT);
        if (n > max) {
          throw new ValidationError(
            `MPTokenIssuanceCreate: MaximumAmount must be <= ${MAX_ISSUANCE_AMOUNT}`,
          );
        }
      } catch {
        throw new ValidationError(
          'MPTokenIssuanceCreate: MaximumAmount must be a base-10 integer string',
        );
      }
    }

    if (this.MPTokenMetadata !== undefined) {
      if (!isString(this.MPTokenMetadata)) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: MPTokenMetadata must be a hex string',
        );
      }
      const lenBytes = this.MPTokenMetadata.length / 2;
      if (lenBytes === 0 || lenBytes > MAX_METADATA_BYTES) {
        throw new ValidationError(
          `MPTokenIssuanceCreate: MPTokenMetadata length must be in (0, ${MAX_METADATA_BYTES}] bytes`,
        );
      }
    }

    if (this.DomainID !== undefined && this.DomainID !== '' && this.DomainID !== '0') {
      if ((flags & 0x00000004) === 0) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: DomainID requires tfMPTRequireAuth flag',
        );
      }
    }

    if (this.ImmutableFlags !== undefined) {
      if (!isNumber(this.ImmutableFlags)) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: ImmutableFlags must be a number',
        );
      }
      if (this.ImmutableFlags === 0) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: ImmutableFlags must be non-zero when present',
        );
      }
      if ((this.ImmutableFlags & ~KNOWN_IMMUTABLE_FLAG_BITS) !== 0) {
        throw new ValidationError(
          'MPTokenIssuanceCreate: ImmutableFlags contains undefined bits',
        );
      }
    }
  }
}