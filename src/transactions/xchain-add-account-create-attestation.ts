/**
 * XChainAddAccountCreateAttestation transaction — provide attestation for a cross-chain account creation.
 *
 * @see https://xrpl.org/xchainaddaccountcreateattestation.html
 */
import type { BaseTransactionFields } from '../types/base.js';
import { Transaction } from '../transaction.js';
import { ValidationError } from '../errors.js';
import { isRecord, isNumber } from '../validation/helpers.js';

export interface XChainAddAccountCreateAttestationTxFields extends BaseTransactionFields {
  readonly TransactionType?: 'XChainAddAccountCreateAttestation';
  readonly XChainBridge: Record<string, unknown>;
  readonly XChainAccountCreateCount: number;
  readonly Destination: string;
  readonly Signature: string;
  readonly PublicKey: string;
  readonly Amount: string;
  readonly AttestationRewardAccount: string;
  readonly WasLockingChainSend: number;
}

export class XChainAddAccountCreateAttestation extends Transaction {
  override readonly TransactionType = 'XChainAddAccountCreateAttestation' as const;

  declare readonly XChainBridge: Record<string, unknown>;
  declare readonly XChainAccountCreateCount: number;
  declare readonly Destination: string;
  declare readonly Signature: string;
  declare readonly PublicKey: string;
  declare readonly Amount: string;
  declare readonly AttestationRewardAccount: string;
  declare readonly WasLockingChainSend: number;
  static override readonly TRANSACTION_TYPE = 'XChainAddAccountCreateAttestation' as const;
  static override readonly ASSIGNABLE_FIELDS = [
    'Amount', 'AttestationRewardAccount', 'Destination', 'PublicKey', 'Signature', 'WasLockingChainSend', 'XChainAccountCreateCount', 'XChainBridge'
  ] as const;

  constructor(props: XChainAddAccountCreateAttestationTxFields) {
    super({ ...props, TransactionType: XChainAddAccountCreateAttestation.TRANSACTION_TYPE });
    this.applyManifest(props as unknown as Record<string, unknown>);
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) {
      throw new ValidationError('XChainAddAccountCreateAttestation: missing or invalid XChainBridge');
    }
    if (!isNumber(this.XChainAccountCreateCount)) {
      throw new ValidationError('XChainAddAccountCreateAttestation: missing or invalid XChainAccountCreateCount');
    }
  }
}
