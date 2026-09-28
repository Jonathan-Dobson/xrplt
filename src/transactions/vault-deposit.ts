/**
 * VaultDeposit transaction — add liquidity to a vault in exchange for shares.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/vaultdeposit
 * @see https://xrpl.org/docs/concepts/tokens/single-asset-vaults
 *
 * Affected amendments:
 * - `SingleAssetVault` (base VaultDeposit)
 * - `LendingProtocolV1_1` (LendingProtocolV1_1-specific validate rules)
 *
 * Validation rules enforced locally:
 *   - `VaultID` required, must be 64-char hex.
 *   - `Amount` required, must be a valid `Amount` (XRP / trust line / MPT).
 *
 * VaultDeposit has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { Amount, MPTAmount } from '../types/amounts.js';
import { VaultTransaction } from '../groups/vault.js';
import { ValidationError } from '../errors.js';
import { isAmount, isHex, isString } from '../validation/helpers.js';

export interface VaultDepositTxFields extends BaseTransactionFields {
  readonly TransactionType: 'VaultDeposit';
  /** The ID of the vault to deposit into. 64-char hex. */
  readonly VaultID: string;
  /** Asset amount to deposit (XRP / trust line / MPT form). */
  readonly Amount: Amount | MPTAmount;
}

export class VaultDeposit extends VaultTransaction {
  override readonly TransactionType = 'VaultDeposit' as const;

  readonly VaultID: string = undefined as any;
  readonly Amount: Amount | MPTAmount = undefined as any;

  static override readonly TRANSACTION_TYPE = 'VaultDeposit' as const;
  static override readonly ASSIGNABLE_FIELDS = ['Amount', 'VaultID'] as const;

  constructor(props: VaultDepositTxFields) {
    super({ ...props, TransactionType: VaultDeposit.TRANSACTION_TYPE });
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
        'VaultDeposit: VaultID must be a 64-character hex string',
      );
    }

    // ── Amount ── required, valid Amount (XRP / trust line / MPT).
    if (!isAmount(this.Amount)) {
      throw new ValidationError(
        'VaultDeposit: Amount must be a valid Amount (XRP / trust line / MPT form)',
      );
    }
  }
}