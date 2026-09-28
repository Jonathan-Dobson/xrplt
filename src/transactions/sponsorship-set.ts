/**
 * SponsorshipSet transaction — create, update, or delete a Sponsorship on
 * the XRP Ledger.
 *
 * Requires the Sponsor amendment (status: not_enabled on the live network
 * as of v0.6.x; this implementation mirrors the dev-portal / xrpl.js
 * canonical spec so consumers can use the types today).
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/sponsorset
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isString, isAccount } from '../validation/helpers.js';
import { SponsorshipSetFlags } from '../types/flags.js';
// Re-export shape so consumers can also import from this module path.
export { SponsorshipSetFlags };
export type { SponsorshipSetFlagsInterface } from '../types/flags.js';

export interface SponsorshipSetTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'SponsorshipSet';
  /** The sponsor. If present, Account is the sponsee. */
  readonly CounterpartySponsor?: string | undefined;
  /** The sponsee. If present, Account is the sponsor. */
  readonly Sponsee?: string | undefined;
  /** Delta (in drops) to apply to the fee budget. Must not be zero. */
  readonly FeeAmountDelta?: string | undefined;
  /** Maximum fee per sponsored transaction (in drops). */
  readonly MaxFee?: string | undefined;
  /** Delta to apply to the reserve budget. Must not be zero. */
  readonly RemainingOwnerCountDelta?: number | undefined;
}

export class SponsorshipSet extends Transaction {
  override readonly TransactionType = 'SponsorshipSet' as const;

  declare readonly CounterpartySponsor?: string | undefined;
  declare readonly Sponsee?: string | undefined;
  declare readonly FeeAmountDelta?: string | undefined;
  declare readonly MaxFee?: string | undefined;
  declare readonly RemainingOwnerCountDelta?: number | undefined;

  static override readonly TRANSACTION_TYPE = 'SponsorshipSet' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'CounterpartySponsor', 'Sponsee', 'FeeAmountDelta',
    'MaxFee', 'RemainingOwnerCountDelta'
  ] as const;

  constructor(props: SponsorshipSetTxFields) {
    super({ ...props, TransactionType: SponsorshipSet.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    const hasSponsor = this.CounterpartySponsor !== undefined;
    const hasSponsee = this.Sponsee !== undefined;
    if (hasSponsor && hasSponsee) {
      throw new ValidationError(
        'SponsorshipSet: cannot specify both CounterpartySponsor and Sponsee',
      );
    }
    if (!hasSponsor && !hasSponsee) {
      throw new ValidationError(
        'SponsorshipSet: must specify either CounterpartySponsor or Sponsee',
      );
    }

    if (hasSponsor && !isAccount(this.CounterpartySponsor)) {
      throw new ValidationError('SponsorshipSet: invalid CounterpartySponsor');
    }
    if (hasSponsee && !isAccount(this.Sponsee)) {
      throw new ValidationError('SponsorshipSet: invalid Sponsee');
    }

    if (this.FeeAmountDelta !== undefined && !isString(this.FeeAmountDelta)) {
      throw new ValidationError('SponsorshipSet: FeeAmountDelta must be a string');
    }
    if (this.MaxFee !== undefined && !isString(this.MaxFee)) {
      throw new ValidationError('SponsorshipSet: MaxFee must be a string');
    }
    if (this.RemainingOwnerCountDelta !== undefined) {
      if (typeof this.RemainingOwnerCountDelta !== 'number') {
        throw new ValidationError(
          'SponsorshipSet: RemainingOwnerCountDelta must be a number',
        );
      }
      if (this.RemainingOwnerCountDelta === 0) {
        throw new ValidationError(
          'SponsorshipSet: RemainingOwnerCountDelta must not be zero',
        );
      }
    }

    const flags = this.Flags;
    if (typeof flags === 'number') {
      const deleteFlag = flags & SponsorshipSetFlags.tfDeleteObject;
      // If tfDeleteObject is set with any other non-global flag bits, reject.
      if (deleteFlag && flags !== SponsorshipSetFlags.tfDeleteObject) {
        // Allow global flags (lowest 16 bits) plus the delete flag.
        const nonGlobalMask = flags & ~0xffff;
        if (nonGlobalMask !== SponsorshipSetFlags.tfDeleteObject) {
          throw new ValidationError(
            'SponsorshipSet: tfDeleteObject cannot be combined with other flags',
          );
        }
      }
      if (
        (flags & SponsorshipSetFlags.tfSponsorshipSetRequireSignForFee) &&
        (flags & SponsorshipSetFlags.tfSponsorshipClearRequireSignForFee)
      ) {
        throw new ValidationError(
          'SponsorshipSet: cannot set and clear RequireSignForFee in same tx',
        );
      }
      if (
        (flags & SponsorshipSetFlags.tfSponsorshipSetRequireSignForReserve) &&
        (flags & SponsorshipSetFlags.tfSponsorshipClearRequireSignForReserve)
      ) {
        throw new ValidationError(
          'SponsorshipSet: cannot set and clear RequireSignForReserve in same tx',
        );
      }
    }
  }
}
