/**
 * VaultSet transaction — modify mutable fields on an existing Vault object.
 *
 * Updates `Data`, `AssetsMaximum`, and/or `DomainID` on a vault identified
 * by `VaultID`. Note: the spec rule that `AssetsMaximum` cannot be lowered
 * below the current `AssetsTotal` (unless 0) is enforced by the ledger
 * (`tecLIMIT_EXCEEDED`); we can't read on-ledger state in local validate.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/vaultset
 * @see https://xrpl.org/docs/concepts/tokens/single-asset-vaults
 *
 * Affected amendments:
 * - `SingleAssetVault` (base VaultSet)
 * - `LendingProtocolV1_1` (LendingProtocolV1_1-specific changes to fields)
 * - `PermissionedDomains` (DomainID field)
 *
 * Validation rules enforced locally:
 *   - `VaultID` required, must be 64-char hex (ledger entry ID).
 *   - `Data` if present: hex, even-length, ≤ 256 bytes.
 *   - `AssetsMaximum` if present: non-negative base-10 integer string.
 *   - `DomainID` if present: 64-char hex string.
 *
 * VaultSet has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { VaultTransaction } from '../groups/vault.js';
import { ValidationError } from '../errors.js';
import {
  isDomainID,
  isHex,
  isString,
} from '../validation/helpers.js';

// Maximum encoded Data length in bytes (hex is 2 chars per byte).
const MAX_DATA_BYTES = 256;

export interface VaultSetTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'VaultSet';
  /** The ID of the vault to modify. 64-char hex (ledger entry ID). */
  readonly VaultID: string;
  /** Arbitrary vault metadata, hex-encoded, 0 < length ≤ 256 bytes. */
  readonly Data?: string | undefined;
  /**
   * The maximum asset amount the vault can hold. Cannot be lowered below
   * the current `AssetsTotal` (unless 0); that rule is ledger-enforced.
   */
  readonly AssetsMaximum?: string | undefined;
  /**
   * The PermissionedDomain object ID associated with the vault's shares.
   * 64-char hex. Requires `PermissionedDomains` amendment.
   */
  readonly DomainID?: string | undefined;
}

export class VaultSet extends VaultTransaction {
  override readonly TransactionType = 'VaultSet' as const;

  readonly VaultID: string = undefined as any;
  readonly Data?: string | undefined = undefined;
  readonly AssetsMaximum?: string | undefined = undefined;
  readonly DomainID?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'VaultSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'AssetsMaximum',
    'Data',
    'DomainID',
    'VaultID',
  ] as const;

  constructor(props: VaultSetTxFields) {
    super({ ...props, TransactionType: VaultSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // ── VaultID ── required, 64-char hex.
    if (
      !isString(this.VaultID) ||
      !isHex(this.VaultID) ||
      this.VaultID.length !== 64
    ) {
      throw new ValidationError(
        'VaultSet: VaultID must be a 64-character hex string',
      );
    }

    // ── Data ── hex, even-length, ≤ 256 bytes.
    if (this.Data !== undefined) {
      if (!isString(this.Data) || !isHex(this.Data)) {
        throw new ValidationError(
          'VaultSet: Data must be a hex string',
        );
      }
      if (this.Data.length % 2 !== 0) {
        throw new ValidationError(
          'VaultSet: Data must be a hex string with an even number of characters',
        );
      }
      const bytes = this.Data.length / 2;
      if (bytes > MAX_DATA_BYTES) {
        throw new ValidationError(
          `VaultSet: Data exceeds ${MAX_DATA_BYTES} bytes (actual: ${bytes})`,
        );
      }
    }

    // ── AssetsMaximum ── non-negative base-10 integer string.
    if (this.AssetsMaximum !== undefined) {
      if (
        !isString(this.AssetsMaximum) ||
        !/^[0-9]+$/u.test(this.AssetsMaximum)
      ) {
        throw new ValidationError(
          'VaultSet: AssetsMaximum must be a non-negative base-10 integer string',
        );
      }
    }

    // ── DomainID ── 64-char hex.
    if (this.DomainID !== undefined && !isDomainID(this.DomainID)) {
      throw new ValidationError(
        'VaultSet: DomainID must be a 64-character hex string',
      );
    }
  }
}