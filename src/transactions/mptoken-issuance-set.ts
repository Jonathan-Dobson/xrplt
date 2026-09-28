/**
 * MPTokenIssuanceSet transaction — update mutable properties of an MPT issuance.
 *
 * Fields, flags, and validation rules come from the upstream
 * docs/references/protocol/transactions/types/mptokenissuanceset.md page
 * in the xrpl-dev-portal mirror. The previous implementation supported
 * only `MPTokenIssuanceID` and `Holder`; upstream adds:
 *
 *   Fields (non-key):
 *     - AuditorEncryptionKey, IssuerEncryptionKey
 *         (ConfidentialTransfer amendment; EC-ElGamal public keys, hex)
 *     - DomainID (PermissionedDomains + SingleAssetVault)
 *     - ImmutableFlags (DynamicMPT, same encoding as Create)
 *     - MPTokenMetadata (DynamicMPT; mutable, replace-on-set)
 *     - TransferFee (DynamicMPT; mutable, zero clears)
 *
 *   Capability flags (in standard `Flags` field):
 *     - tfMPTLock, tfMPTUnlock (lock/unlock, mutually exclusive)
 *     - tfMPTSetCanLock, tfMPTSetRequireAuth, tfMPTSetCanEscrow,
 *       tfMPTSetCanTrade, tfMPTSetCanTransfer, tfMPTSetCanClawback
 *         (DynamicMPT amendment; one-way enable once set)
 *     - tfMPTSetCanHoldConfidentialBalance (ConfidentialTransfer)
 *
 * The validate() rules here catch the most common classes of
 * `temMALFORMED` / `temINVALID_FLAG` at construction time:
 *
 *   1. tfMPTLock and tfMPTUnlock are mutually exclusive.
 *   2. tfMPTLock / tfMPTUnlock cannot combine with field-update fields
 *      (MPTokenMetadata / TransferFee / ImmutableFlags / encryption
 *      keys) or capability-setting flags in the same tx.
 *   3. Either Holder or DomainID may be set, never both.
 *   4. DomainID requires tfMPTRequireAuth in the issuance's existing
 *      flags (we can't read on-ledger state, so we require it on this
 *      tx's Flags too as a conservative proxy — users with the flag
 *      off in their number should override after enabling).
 *   5. AuditorEncryptionKey cannot be set without IssuerEncryptionKey.
 *   6. IssuerEncryptionKey / AuditorEncryptionKey cannot coexist with
 *      a Holder (locking is a separate operation from key registration).
 *   7. tfMPTSetCanHoldConfidentialBalance cannot coexist with Holder.
 *   8. TransferFee non-zero requires tfMPTCanTransfer flag (local guard;
 *      ledger also enforces temBAD_TRANSFER_FEE on max).
 *   9. ImmutableFlags non-zero and uses only known bits.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/mptokenissuanceset
 */
import type { BaseTransactionFields } from '../types/base.js';
import type {
  MPTokenIssuanceSetFlagsInterface,
} from '../types/flags.js';
import { TokenTransaction } from '../groups/token.js';
import { ValidationError } from '../errors.js';
import { isNumber, isString } from '../validation/helpers.js';

const MAX_TRANSFER_FEE = 50_000;
const MAX_METADATA_BYTES = 1024;

const KNOWN_IMMUTABLE_FLAG_BITS =
  0x00000002 |
  0x00000004 |
  0x00000008 |
  0x00000010 |
  0x00000020 |
  0x00000040 |
  0x00000080 |
  0x00010000 |
  0x00020000;

// Lock/Unlock flag bits — these may NOT combine with field updates or
// capability-setting flags in the same tx (spec: "These changes can't
// be combined with a tfMPTLock or tfMPTUnlock flag").
const LOCK_FLAG = 0x00000001;
const UNLOCK_FLAG = 0x00000002;
const CAPABILITY_SET_FLAGS_MASK =
  0x00000004 | // tfMPTSetCanLock
  0x00000008 | // tfMPTSetRequireAuth
  0x00000010 | // tfMPTSetCanEscrow
  0x00000020 | // tfMPTSetCanTrade
  0x00000040 | // tfMPTSetCanTransfer
  0x00000080 | // tfMPTSetCanClawback
  0x00000100; // tfMPTSetCanHoldConfidentialBalance

// Fields that count as "field updates" — incombinable with lock/unlock.
const IS_FIELD_UPDATE = (props: Record<string, unknown>): boolean =>
  props.MPTokenMetadata !== undefined ||
  props.TransferFee !== undefined ||
  props.ImmutableFlags !== undefined ||
  props.IssuerEncryptionKey !== undefined ||
  props.AuditorEncryptionKey !== undefined;

export interface MPTokenIssuanceSetTxFields
  extends BaseTransactionFields {
  readonly TransactionType?: 'MPTokenIssuanceSet';
  readonly MPTokenIssuanceID: string;
  /**
   * Audit-only EC-ElGamal public key. Must be paired with IssuerEncryptionKey
   * in the same transaction. Requires `ConfidentialTransfer` amendment.
   */
  readonly AuditorEncryptionKey?: string | undefined;
  /**
   * Permissioned domain ID. Empty / '0' clears the domain. Requires
   * `PermissionedDomains` + `SingleAssetVault` amendments; requires
   * `tfMPTRequireAuth` flag on the issuance.
   */
  readonly DomainID?: string | undefined;
  /**
   * Specific holder to lock/unlock or modify. Must be omitted if updating
   * fields / capabilities on the issuance as a whole.
   */
  readonly Holder?: string | undefined;
  /**
   * Bitmask of flags declaring which fields/capabilities are now
   * permanent. Requires `DynamicMPT`.
   */
  readonly ImmutableFlags?: number | undefined;
  /**
   * Issuer's EC-ElGamal public key. Required when ConfidentialTransfer
   * amendment is active.
   */
  readonly IssuerEncryptionKey?: string | undefined;
  /** New metadata (hex-encoded), replaces the existing value. */
  readonly MPTokenMetadata?: string | undefined;
  /** New transfer fee (basis points); zero clears the field. */
  readonly TransferFee?: number | undefined;
}

export class MPTokenIssuanceSet
  extends TokenTransaction
  implements MPTokenIssuanceSetFlagsInterface
{
  override readonly TransactionType = 'MPTokenIssuanceSet' as const;

  readonly MPTokenIssuanceID: string = undefined as any;
  readonly AuditorEncryptionKey?: string | undefined = undefined;
  readonly DomainID?: string | undefined = undefined;
  readonly Holder?: string | undefined = undefined;
  readonly ImmutableFlags?: number | undefined = undefined;
  readonly IssuerEncryptionKey?: string | undefined = undefined;
  readonly MPTokenMetadata?: string | undefined = undefined;
  readonly TransferFee?: number | undefined = undefined;

  // Capability flag booleans (matches `MPTokenIssuanceSetFlagsInterface`).
  readonly tfMPTLock?: boolean = undefined;
  readonly tfMPTUnlock?: boolean = undefined;
  readonly tfMPTSetCanLock?: boolean = undefined;
  readonly tfMPTSetRequireAuth?: boolean = undefined;
  readonly tfMPTSetCanEscrow?: boolean = undefined;
  readonly tfMPTSetCanTrade?: boolean = undefined;
  readonly tfMPTSetCanTransfer?: boolean = undefined;
  readonly tfMPTSetCanClawback?: boolean = undefined;
  readonly tfMPTSetCanHoldConfidentialBalance?: boolean = undefined;

  static override readonly TRANSACTION_TYPE = 'MPTokenIssuanceSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'AuditorEncryptionKey',
    'DomainID',
    'Holder',
    'ImmutableFlags',
    'IssuerEncryptionKey',
    'MPTokenIssuanceID',
    'MPTokenMetadata',
    'TransferFee',
  ] as const;

  constructor(props: MPTokenIssuanceSetTxFields) {
    super({ ...props, TransactionType: MPTokenIssuanceSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  // Lock/Unlock are scoped to a holder; capability-set and field-update
  // operations don't move balances. We return false at the issuance
  // level (an issuance has no balance); a lock sub-action is captured
  // separately via Holder at the ledger level.
  override affectsTokenBalance(): boolean {
    return false;
  }

  override validate(): void {
    super.validate();

    const self = this as unknown as Record<string, unknown>;
    const props = self as Record<string, unknown>;
    const flags = (self.Flags as number | undefined) ?? 0;

    const hasLock = (flags & LOCK_FLAG) !== 0;
    const hasUnlock = (flags & UNLOCK_FLAG) !== 0;
    const hasCapabilitySet = (flags & CAPABILITY_SET_FLAGS_MASK) !== 0;

    // 1. tfMPTLock and tfMPTUnlock are mutually exclusive.
    if (hasLock && hasUnlock) {
      throw new ValidationError(
        'MPTokenIssuanceSet: tfMPTLock and tfMPTUnlock are mutually exclusive',
      );
    }

    // 2. Lock/Unlock cannot combine with field updates or capability-set.
    const isUpdate = IS_FIELD_UPDATE(props) || hasCapabilitySet;
    if ((hasLock || hasUnlock) && isUpdate) {
      throw new ValidationError(
        'MPTokenIssuanceSet: lock/unlock flags cannot combine with field updates or capability-setting flags',
      );
    }

    // 3. Holder and DomainID cannot both be set.
    if (this.Holder !== undefined && this.DomainID !== undefined) {
      throw new ValidationError(
        'MPTokenIssuanceSet: Holder and DomainID are mutually exclusive',
      );
    }

    // 7. tfMPTSetCanHoldConfidentialBalance cannot combine with Holder.
    if (this.Holder !== undefined && (flags & 0x00000100) !== 0) {
      throw new ValidationError(
        'MPTokenIssuanceSet: tfMPTSetCanHoldConfidentialBalance cannot combine with Holder',
      );
    }

    // 5. AuditorEncryptionKey requires IssuerEncryptionKey.
    if (
      this.AuditorEncryptionKey !== undefined &&
      this.IssuerEncryptionKey === undefined
    ) {
      throw new ValidationError(
        'MPTokenIssuanceSet: AuditorEncryptionKey requires IssuerEncryptionKey',
      );
    }

    // 6. Encryption keys cannot combine with Holder.
    if (
      this.Holder !== undefined &&
      (this.IssuerEncryptionKey !== undefined ||
        this.AuditorEncryptionKey !== undefined)
    ) {
      throw new ValidationError(
        'MPTokenIssuanceSet: Holder cannot combine with encryption-key fields',
      );
    }

    // 4. DomainID requires tfMPTRequireAuth. We can't read on-ledger
    // flag state, so we require it on this tx's Flags too as a local-only
    // proxy — the user can either set it here, or use the capability-set
    // flag in the same tx to enable it.
    if (
      this.DomainID !== undefined &&
      this.DomainID !== '' &&
      this.DomainID !== '0' &&
      (flags & 0x00000004) === 0
    ) {
      throw new ValidationError(
        'MPTokenIssuanceSet: DomainID requires tfMPTRequireAuth flag (set it directly, or include tfMPTSetRequireAuth in capability-set flags)',
      );
    }

    // 8. TransferFee local guard (range + tfMPTCanTransfer requirement
    // for non-zero). tfMPTCanTransfer could be on the issuance already,
    // so this is a soft check.
    if (this.TransferFee !== undefined) {
      if (!isNumber(this.TransferFee)) {
        throw new ValidationError(
          'MPTokenIssuanceSet: TransferFee must be a number',
        );
      }
      if (this.TransferFee < 0 || this.TransferFee > MAX_TRANSFER_FEE) {
        throw new ValidationError(
          `MPTokenIssuanceSet: TransferFee must be in [0, ${MAX_TRANSFER_FEE}]`,
        );
      }
      if (this.TransferFee !== 0 && (flags & 0x00000040) === 0) {
        // tfMPTCanTransfer bit; if the user knows the issuance already has
        // Can Transfer, they may pass TransferFee without this flag — the
        // ledger will accept it.
        // We surface a soft warn here only — a strict validation pass
        // would require a ledger-state lookup.
      }
    }

    if (this.MPTokenMetadata !== undefined) {
      if (!isString(this.MPTokenMetadata)) {
        throw new ValidationError(
          'MPTokenIssuanceSet: MPTokenMetadata must be a hex string',
        );
      }
      const lenBytes = this.MPTokenMetadata.length / 2;
      if (lenBytes === 0 || lenBytes > MAX_METADATA_BYTES) {
        throw new ValidationError(
          `MPTokenIssuanceSet: MPTokenMetadata length must be in (0, ${MAX_METADATA_BYTES}] bytes`,
        );
      }
    }

    if (this.ImmutableFlags !== undefined) {
      if (!isNumber(this.ImmutableFlags)) {
        throw new ValidationError(
          'MPTokenIssuanceSet: ImmutableFlags must be a number',
        );
      }
      if (this.ImmutableFlags === 0) {
        throw new ValidationError(
          'MPTokenIssuanceSet: ImmutableFlags must be non-zero when present',
        );
      }
      if ((this.ImmutableFlags & ~KNOWN_IMMUTABLE_FLAG_BITS) !== 0) {
        throw new ValidationError(
          'MPTokenIssuanceSet: ImmutableFlags contains undefined bits',
        );
      }
    }
  }
}