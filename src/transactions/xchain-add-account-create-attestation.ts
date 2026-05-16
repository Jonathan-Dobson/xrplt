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
  readonly TransactionType: 'XChainAddAccountCreateAttestation';
  readonly XChainBridge: Record<string, unknown>;
  readonly XChainAccountCreateCount: number;
  readonly Destination: string;
  readonly Signature: string;
  readonly PublicKey: string;
  readonly Amount: string;
  readonly AttestationRewardAccount: string;
  readonly WasLockingChainSend: number;
}

export class XChainAddAccountCreateAttestationTx extends Transaction {
  override readonly TransactionType = 'XChainAddAccountCreateAttestation' as const;

  readonly XChainBridge: Record<string, unknown> = undefined as any;
  readonly XChainAccountCreateCount: number = undefined as any;
  readonly Destination: string = undefined as any;
  readonly Signature: string = undefined as any;
  readonly PublicKey: string = undefined as any;
  readonly Amount: string = undefined as any;
  readonly AttestationRewardAccount: string = undefined as any;
  readonly WasLockingChainSend: number = undefined as any;

  constructor(props: XChainAddAccountCreateAttestationTxFields) {
    super({ ...props, TransactionType: 'XChainAddAccountCreateAttestation' } );
    this.XChainBridge = props.XChainBridge as Record<string, unknown>;
    this.XChainAccountCreateCount = props.XChainAccountCreateCount as number;
    this.Destination = props.Destination as string;
    this.Signature = props.Signature as string;
    this.PublicKey = props.PublicKey as string;
    this.Amount = props.Amount as string;
    this.AttestationRewardAccount = props.AttestationRewardAccount as string;
    this.WasLockingChainSend = props.WasLockingChainSend as number;
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
