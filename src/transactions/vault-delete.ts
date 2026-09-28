/**
 * VaultDelete transaction — delete an existing vault object.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/vaultdelete
 * @see https://xrpl.org/docs/concepts/tokens/single-asset-vaults
 *
 * Affected amendments:
 * - `SingleAssetVault` (base VaultDelete)
 * - `LendingProtocolV1_1` (LendingProtocolV1_1 introduces the optional
 *   MemoData field for documenting the deletion reason)
 *
 * Validation rules enforced locally:
 *   - `VaultID` required, 64-char hex.
 *   - `MemoData` if present: hex, even-length, ≤ 256 bytes.
 *
 * VaultDelete has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { VaultTransaction } from '../groups/vault.js';
import { ValidationError } from '../errors.js';
import { isHex, isString } from '../validation/helpers.js';

// Maximum encoded MemoData length in bytes (hex is 2 chars per byte).
const MAX_MEMO_DATA_BYTES = 256;

export interface VaultDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultDelete';
  /** The ID of the vault to delete. 64-char hex. */
  readonly VaultID: string;
  /**
   * (LendingProtocolV1_1) Optional arbitrary metadata attached to the
   * deletion, in hex format, ≤ 256 bytes.
   */
  readonly MemoData?: string | undefined;
}

export class VaultDelete extends VaultTransaction {
  override readonly TransactionType = 'VaultDelete' as const;

  readonly VaultID: string = undefined as any;
  readonly MemoData?: string | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'VaultDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = ['MemoData', 'VaultID'] as const;

  constructor(props: VaultDeleteTxFields) {
    super({ ...props, TransactionType: VaultDelete.TRANSACTION_TYPE });
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
        'VaultDelete: VaultID must be a 64-character hex string',
      );
    }

    // ── MemoData ── hex, even-length, ≤ 256 bytes.
    if (this.MemoData !== undefined) {
      if (!isString(this.MemoData) || !isHex(this.MemoData)) {
        throw new ValidationError(
          'VaultDelete: MemoData must be a hex string',
        );
      }
      if (this.MemoData.length % 2 !== 0) {
        throw new ValidationError(
          'VaultDelete: MemoData must be a hex string with an even number of characters',
        );
      }
      const bytes = this.MemoData.length / 2;
      if (bytes > MAX_MEMO_DATA_BYTES) {
        throw new ValidationError(
          `VaultDelete: MemoData exceeds ${MAX_MEMO_DATA_BYTES} bytes (actual: ${bytes})`,
        );
      }
    }
  }
}