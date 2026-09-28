/**
 * NFTokenMint transaction — create a new NFToken (NFT) on the ledger.
 *
 * @see https://xrpl.org/nftokenmint.html
 */
/**
 * NFTokenMint transaction — create a new NFToken (NFT) on the ledger.
 *
 * @see https://xrpl.org/nftokenmint.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import type { NFTokenMintFlagsInterface } from '../types/flags.js';
import type { Amount } from '../types/amounts.js';
import { TokenTransaction } from '../groups/token.js';

import { ValidationError } from '../errors.js';
import { isNumber, isString, isAccount } from '../validation/helpers.js';

export interface NFTokenMintTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'NFTokenMint';
  /** The taxon associated with this NFToken. */
  readonly NFTokenTaxon: number;
  /** The address of the entity that created the token (if not the sender). */
  readonly Issuer?: string | undefined;
  /** The fee (in basis points) charged on secondary sales (0-50,000). */
  readonly TransferFee?: number | undefined;
  /** Arbitrary data for the token (e.g. IPFS link). */
  readonly URI?: string | undefined;
  /**
   * If present, indicates that this is a sell offer for the minted token
   * at the given amount. Must be non-zero, except for XRP which can be
   * zero (giving it away gratis). Required if `Expiration` or `Destination`
   * is present.
   */
  readonly Amount?: Amount | undefined;
  /**
   * Time after which the offer is no longer active (seconds since Ripple
   * Epoch). Requires `Amount`.
   */
  readonly Expiration?: number | undefined;
  /**
   * If present, the offer may only be accepted by the specified account.
   * Requires `Amount`.
   */
  readonly Destination?: string | undefined;
  /** Bit-flags for this transaction. */
  readonly Flags?: number | NFTokenMintFlagsInterface | undefined;
}

export class NFTokenMint extends TokenTransaction {
  override readonly TransactionType = 'NFTokenMint' as const;

  /** The taxon associated with this NFToken. */
  declare readonly NFTokenTaxon: number;
  readonly Issuer?: string | undefined = undefined;
  readonly TransferFee?: number | undefined = undefined;
  readonly URI?: string | undefined = undefined;
  readonly Amount?: Amount | undefined = undefined;
  readonly Expiration?: number | undefined = undefined;
  readonly Destination?: string | undefined = undefined;
  declare readonly Flags?: number | NFTokenMintFlagsInterface | undefined;

  static override readonly TRANSACTION_TYPE = 'NFTokenMint' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Issuer', 'NFTokenTaxon', 'TransferFee', 'URI',
    'Amount', 'Expiration', 'Destination'
  ] as const;

  constructor(props: NFTokenMintTxFields) {
    super({ ...props, TransactionType: NFTokenMint.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override affectsTokenBalance(): boolean { return true; }

  override validate(): void {
    super.validate();
    if (!isNumber(this.NFTokenTaxon))
      throw new ValidationError('NFTokenMint: missing or invalid NFTokenTaxon');
    if (this.Issuer !== undefined && !isAccount(this.Issuer))
      throw new ValidationError('NFTokenMint: invalid Issuer');
    if (this.TransferFee !== undefined) {
      if (!isNumber(this.TransferFee))
        throw new ValidationError('NFTokenMint: TransferFee must be a number');
      if (this.TransferFee < 0 || this.TransferFee > 50000)
        throw new ValidationError('NFTokenMint: TransferFee must be 0-50000');
    }
    if (this.URI !== undefined && !isString(this.URI))
      throw new ValidationError('NFTokenMint: URI must be a string');

    // Amount / Expiration / Destination cross-field rules
    if (this.Expiration !== undefined && this.Amount === undefined) {
      throw new ValidationError(
        'NFTokenMint: Expiration requires Amount',
      );
    }
    if (this.Destination !== undefined && this.Amount === undefined) {
      throw new ValidationError(
        'NFTokenMint: Destination requires Amount',
      );
    }
    if (this.Expiration !== undefined) {
      if (!isNumber(this.Expiration))
        throw new ValidationError('NFTokenMint: Expiration must be a UInt32');
      if (this.Expiration < 0 || this.Expiration > 4294967295)
        throw new ValidationError('NFTokenMint: Expiration out of range');
    }
    if (this.Destination !== undefined && !isAccount(this.Destination)) {
      throw new ValidationError('NFTokenMint: invalid Destination');
    }
  }
}
