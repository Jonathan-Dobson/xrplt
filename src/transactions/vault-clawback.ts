/**
 * VaultClawback transaction — clawback assets from a vault, exchanging
 * the holder's shares for the underlying asset and sending the funds
 * to the asset's issuer.
 *
 * Conceptually, performs VaultWithdraw on behalf of the Holder, with
 * the funds going to the asset's Issuer. If `Amount` is 0, claws back
 * all funds up to the total shares the Holder owns.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/vaultclawback
 *
 * Affected amendments:
 * - `SingleAssetVault` (base VaultClawback)
 * - `LendingProtocolV1_1` (LendingProtocolV1_1-specific changes)
 *
 * Validation rules enforced locally:
 *   - `VaultID` required, 64-char hex.
 *   - `Holder` required, valid XRPL account address.
 *   - `Amount` if present: valid ClawbackAmount (trust line / MPT form,
 *     NOT XRP).
 *
 * VaultClawback has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { ClawbackAmount } from '../types/amounts.js';
import { VaultTransaction } from '../groups/vault.js';
import { ValidationError } from '../errors.js';
import { isAccount, isClawbackAmount, isHex, isString } from '../validation/helpers.js';

export interface VaultClawbackTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'VaultClawback';
  /** The ID of the vault to clawback from. 64-char hex. */
  readonly VaultID: string;
  /** The account from which to clawback assets. */
  readonly Holder: string;
  /**
   * Optional asset amount to clawback. When `Amount` is omitted or 0,
   * claws back all funds up to the total shares the Holder owns.
   * Clawback does NOT support XRP.
   */
  readonly Amount?: ClawbackAmount | undefined;
}

export class VaultClawback extends VaultTransaction {
  override readonly TransactionType = 'VaultClawback' as const;

  readonly VaultID: string = undefined as any;
  readonly Holder: string = undefined as any;
  readonly Amount?: ClawbackAmount | undefined = undefined;

  static override readonly TRANSACTION_TYPE = 'VaultClawback' as const;
  static override readonly ASSIGNABLE_FIELDS = ['Amount', 'Holder', 'VaultID'] as const;

  constructor(props: VaultClawbackTxFields) {
    super({ ...props, TransactionType: VaultClawback.TRANSACTION_TYPE });
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
        'VaultClawback: VaultID must be a 64-character hex string',
      );
    }

    // ── Holder ── required, valid XRPL account address.
    if (!isAccount(this.Holder)) {
      throw new ValidationError(
        'VaultClawback: Holder must be a valid XRPL account address',
      );
    }

    // ── Amount ── optional, valid ClawbackAmount (trust line / MPT, NOT XRP).
    if (this.Amount !== undefined && !isClawbackAmount(this.Amount)) {
      throw new ValidationError(
        'VaultClawback: Amount must be a valid ClawbackAmount (trust line / MPT form, NOT XRP)',
      );
    }
  }
}