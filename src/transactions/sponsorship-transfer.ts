/**
 * SponsorshipTransfer transaction — create, transfer, or end reserve
 * sponsorship for a ledger object or account.
 *
 * Requires the Sponsor amendment (status: not_enabled on the live network
 * as of v0.6.x; this implementation mirrors the dev-portal / xrpl.js
 * canonical spec).
 *
 * The transaction operates in one of three modes, selected by exactly one
 * of the three exclusive flags:
 *   - `tfSponsorshipEnd` (0x00010000)
 *   - `tfSponsorshipCreate` (0x00020000)
 *   - `tfSponsorshipReassign` (0x00040000)
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/sponsortransfer
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isString, isAccount } from '../validation/helpers.js';
import { SponsorshipTransferFlags } from '../types/flags.js';
// Re-export shape so consumers can also import from this module path.
export { SponsorshipTransferFlags };
export type { SponsorshipTransferFlagsInterface } from '../types/flags.js';

export interface SponsorshipTransferTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'SponsorshipTransfer';
  /** Hash256 — the ledger entry to transfer sponsorship of. */
  readonly ObjectID?: string | undefined;
  /** AccountID — the sponsee (only used when ending sponsorship). */
  readonly Sponsee?: string | undefined;
}

export class SponsorshipTransfer extends Transaction {
  override readonly TransactionType = 'SponsorshipTransfer' as const;

  declare readonly ObjectID?: string | undefined;
  declare readonly Sponsee?: string | undefined;

  static override readonly TRANSACTION_TYPE = 'SponsorshipTransfer' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'ObjectID', 'Sponsee'
  ] as const;

  constructor(props: SponsorshipTransferTxFields) {
    super({ ...props, TransactionType: SponsorshipTransfer.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    // Flags is typed against the global interface; treat any object value
    // as not setting our local bits (numeric form is the documented mode).
    const flags = this.Flags;
    const numericFlags = typeof flags === 'number' ? flags : 0;

    const end = numericFlags & SponsorshipTransferFlags.tfSponsorshipEnd;
    const create = numericFlags & SponsorshipTransferFlags.tfSponsorshipCreate;
    const reassign = numericFlags & SponsorshipTransferFlags.tfSponsorshipReassign;

    const modeCount = [end, create, reassign].filter(Boolean).length;
    if (modeCount !== 1) {
      throw new ValidationError(
        'SponsorshipTransfer: must specify exactly one of tfSponsorshipEnd, tfSponsorshipCreate, or tfSponsorshipReassign',
      );
    }

    // ObjectID / Sponsee semantics by mode:
    //   Create / Reassign: ObjectID optional (omit when sponsoring an account),
    //                      Sponsee must be omitted.
    //   End:               ObjectID optional, Sponsee present when ending
    //                      sponsorship on behalf of a sponsee.
    if ((create || reassign) && this.Sponsee !== undefined) {
      throw new ValidationError(
        'SponsorshipTransfer: Sponsee must be omitted when creating or reassigning sponsorship',
      );
    }

    if (this.ObjectID !== undefined && !isString(this.ObjectID)) {
      throw new ValidationError('SponsorshipTransfer: ObjectID must be a string');
    }
    if (this.Sponsee !== undefined && !isAccount(this.Sponsee)) {
      throw new ValidationError('SponsorshipTransfer: invalid Sponsee');
    }
  }
}
