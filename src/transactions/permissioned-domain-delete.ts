/**
 * PermissionedDomainDelete transaction — delete a permissioned domain.
 *
 * @see https://xrpl.org/docs/references/protocol/transactions/types/permissioneddomaindelete
 *
 * Affected amendments:
 *   - `PermissionedDomains` (base PermissionedDomainDelete)
 *
 * Validation rules enforced locally:
 *   - `DomainID` required, 64-char hex (ledger entry ID).
 *
 * PermissionedDomainDelete has no flags defined by the spec.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isHex, isString } from '../validation/helpers.js';

export interface PermissionedDomainDeleteTxFields
  extends BaseTransactionFields {
  readonly TransactionType?: 'PermissionedDomainDelete';
  /** The ID of the permissioned domain to delete. 64-char hex. */
  readonly DomainID: string;
}

export class PermissionedDomainDelete extends Transaction {
  override readonly TransactionType = 'PermissionedDomainDelete' as const;

  readonly DomainID: string = undefined as any;

  static override readonly TRANSACTION_TYPE =
    'PermissionedDomainDelete' as const;
  static override readonly ASSIGNABLE_FIELDS = ['DomainID'] as const;

  constructor(props: PermissionedDomainDeleteTxFields) {
    super({
      ...props,
      TransactionType: PermissionedDomainDelete.TRANSACTION_TYPE,
    });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();

    if (
      !isString(this.DomainID) ||
      !isHex(this.DomainID) ||
      this.DomainID.length !== 64
    ) {
      throw new ValidationError(
        'PermissionedDomainDelete: DomainID must be a 64-character hex string',
      );
    }
  }
}