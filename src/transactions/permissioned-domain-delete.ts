/**
 * PermissionedDomainDelete transaction — delete a permissioned domain.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface PermissionedDomainDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'PermissionedDomainDelete';
}

export class PermissionedDomainDelete extends Transaction {
  override readonly TransactionType = 'PermissionedDomainDelete' as const;

  static override readonly TRANSACTION_TYPE = 'PermissionedDomainDelete' as const;
  static override readonly ASSIGNABLE_FIELDS: readonly string[] = [];

  constructor(props: PermissionedDomainDeleteTxFields) {
    super({ ...props, TransactionType: PermissionedDomainDelete.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
  }
}
