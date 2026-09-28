/**
 * VaultWithdraw transaction — withdraw assets from a vault in exchange for shares.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/vaultwithdraw
 * @see https://xrpl.org/docs/concepts/tokens/single-asset-vaults
 *
 * Affected amendments:
 * - `SingleAssetVault` (base VaultWithdraw)
 * - `LendingProtocolV1_1` (LendingProtocolV1_1-specific validate rules)
 * - `Credentials` (CredentialIDs field for permissioned-domain authorization)
 *
 * Validation rules enforced locally:
 *   - `VaultID` required, 64-char hex.
 *   - `Amount` required, valid Amount (XRP / trust line / MPT).
 *   - `Destination` if present: valid XRPL account address.
 *   - `DestinationTag` if present: number.
 *   - `CredentialIDs` if present: array of hex-string credential IDs.
 *
 * VaultWithdraw has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount, MPTAmount } from '../types/amounts.js';
import { VaultTransaction } from '../groups/vault.js';
import { ValidationError } from '../errors.js';
import {
  isAccount,
  isAmount,
  isArray,
  isHex,
  isNumber,
  isString,
} from '../validation/helpers.js';

// Credential IDs are 64-char hex (same as ledger entry IDs).
const CREDENTIAL_ID_LENGTH = 64;

export interface VaultWithdrawTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'VaultWithdraw';
  /** The ID of the vault to withdraw from. 64-char hex. */
  readonly VaultID: string;
  /** Exact amount of vault asset to withdraw (XRP / trust line / MPT). */
  readonly Amount: Amount | MPTAmount;
  /** Optional destination account. Must be able to receive the asset. */
  readonly Destination?: string | undefined;
  /** Optional destination tag identifying the reason for the withdrawal. */
  readonly DestinationTag?: number | undefined;
  /**
   * Optional array of credential IDs authorizing the withdrawal when the
   * vault is gated by a permissioned domain (Credentials amendment).
   */
  readonly CredentialIDs?: string[] | undefined;
}

export class VaultWithdraw extends VaultTransaction {
  override readonly TransactionType = 'VaultWithdraw' as const;

  readonly VaultID: string = undefined as any;
  readonly Amount: Amount | MPTAmount = undefined as any;
  readonly Destination?: string | undefined = undefined;
  readonly DestinationTag?: number | undefined = undefined;
  readonly CredentialIDs?: string[] | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'VaultWithdraw' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount',
    'CredentialIDs',
    'Destination',
    'DestinationTag',
    'VaultID',
  ] as const;

  constructor(props: VaultWithdrawTxFields) {
    super({ ...props, TransactionType: VaultWithdraw.TRANSACTION_TYPE });
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
        'VaultWithdraw: VaultID must be a 64-character hex string',
      );
    }

    // ── Amount ── required, valid Amount.
    if (!isAmount(this.Amount)) {
      throw new ValidationError(
        'VaultWithdraw: Amount must be a valid Amount (XRP / trust line / MPT form)',
      );
    }

    // ── Destination ── valid XRPL account address if present.
    if (this.Destination !== undefined && !isAccount(this.Destination)) {
      throw new ValidationError(
        'VaultWithdraw: Destination must be a valid XRPL account address',
      );
    }

    // ── DestinationTag ── number if present.
    if (this.DestinationTag !== undefined && !isNumber(this.DestinationTag)) {
      throw new ValidationError(
        'VaultWithdraw: DestinationTag must be a number',
      );
    }

    // ── CredentialIDs ── array of 64-char hex strings if present.
    if (this.CredentialIDs !== undefined) {
      if (!isArray(this.CredentialIDs)) {
        throw new ValidationError(
          'VaultWithdraw: CredentialIDs must be an array of credential ID strings',
        );
      }
      for (let i = 0; i < this.CredentialIDs.length; i++) {
        const cid = this.CredentialIDs[i];
        if (
          !isString(cid) ||
          !isHex(cid) ||
          cid.length !== CREDENTIAL_ID_LENGTH
        ) {
          throw new ValidationError(
            `VaultWithdraw: CredentialIDs[${i}] must be a ${CREDENTIAL_ID_LENGTH}-character hex string`,
          );
        }
      }
    }
  }
}