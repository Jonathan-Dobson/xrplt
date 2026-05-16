/**
 * MPTokenIssuanceCreate transaction — create a new Multi-Purpose Token (MPT) issuance.
 *
 * @see https://xrpl.org/mptokenissuancecreate.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { TokenTransaction } from '../groups/token.js';

import { ValidationError } from '../errors.js';
import { isString, isNumber } from '../validation/helpers.js';

export interface MPTokenIssuanceCreateTxFields extends BaseTransactionFields {
  readonly TransactionType: 'MPTokenIssuanceCreate';
  /** The maximum amount of tokens that can be issued. */
  readonly MaximumAmount?: string | undefined;
  /** The asset scale for the token (0-15). */
  readonly AssetScale?: number | undefined;
  /** The transfer fee for the token (0-50,000 basis points). */
  readonly TransferFee?: number | undefined;
  /** Arbitrary metadata for the issuance. */
  readonly MPTokenMetadata?: string | undefined;
}

export class MPTokenIssuanceCreateTx extends TokenTransaction {
  override readonly TransactionType = 'MPTokenIssuanceCreate' as const;

  readonly MaximumAmount?: string | undefined = undefined;
  readonly AssetScale?: number | undefined = undefined;
  readonly TransferFee?: number | undefined = undefined;
  readonly MPTokenMetadata?: string | undefined = undefined;

  constructor(props: MPTokenIssuanceCreateTxFields) {
    super({ ...props, TransactionType: 'MPTokenIssuanceCreate' } );
        this.MaximumAmount = props.MaximumAmount as any;
    this.AssetScale = props.AssetScale as any;
    this.TransferFee = props.TransferFee as any;
    this.MPTokenMetadata = props.MPTokenMetadata as any;
  }

  override affectsTokenBalance(): boolean { return false; }

  override validate(): void {
    super.validate();
    if (this.MaximumAmount !== undefined && !isString(this.MaximumAmount))
      throw new ValidationError('MPTokenIssuanceCreate: MaximumAmount must be a string');
    if (this.AssetScale !== undefined && !isNumber(this.AssetScale))
      throw new ValidationError('MPTokenIssuanceCreate: AssetScale must be a number');
    if (this.TransferFee !== undefined && !isNumber(this.TransferFee))
      throw new ValidationError('MPTokenIssuanceCreate: TransferFee must be a number');
    if (this.MPTokenMetadata !== undefined && !isString(this.MPTokenMetadata))
      throw new ValidationError('MPTokenIssuanceCreate: MPTokenMetadata must be a string');
  }
}
