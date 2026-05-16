/**
 * PermissionedDomainDelete transaction — delete a permissioned domain.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';

export interface PermissionedDomainDeleteTxFields extends BaseTransactionFields {
  readonly TransactionType: 'PermissionedDomainDelete';
}

export class PermissionedDomainDeleteTx extends Transaction {
  override readonly TransactionType = 'PermissionedDomainDelete' as const;

  constructor(props: PermissionedDomainDeleteTxFields) {
    super({ ...props, TransactionType: 'PermissionedDomainDelete' } );
  }

  override validate(): void {
    super.validate();
  }
}
