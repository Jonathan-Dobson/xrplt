/**
 * XChainAddClaimAttestation transaction — provide a witness signature for a cross-chain claim.
 */
import type { BaseTransactionFields } from '../types/base.js';
import { XChainTransaction } from '../groups/xchain.js';
import { ValidationError } from '../errors.js';
import { isRecord, isNumber, isString } from '../validation/helpers.js';

export interface XChainAddClaimAttestationTxFields extends BaseTransactionFields {
  readonly TransactionType: 'XChainAddClaimAttestation';
  /** Definition of the bridge. */
  readonly XChainBridge: Record<string, unknown>;
  /** The claim ID. */
  readonly XChainClaimID: number;
  /** The amount being claimed. */
  readonly Amount: string;
  /** The destination account. */
  readonly Destination?: string | undefined;
  /** The source account on the other chain. */
  readonly OtherChainSource: string;
  /** Public key of the attesting server. */
  readonly PublicKey: string;
  /** The attestation signature. */
  readonly Signature: string;
  /** Sequence number of the attestation. */
  readonly XChainAttestationSequence: number;
}

export class XChainAddClaimAttestationTx extends XChainTransaction {
  override readonly TransactionType = 'XChainAddClaimAttestation' as const;

  readonly XChainBridge: Record<string, unknown> = undefined as any;
  readonly XChainClaimID: number = undefined as any;
  readonly Amount: string = undefined as any;
  readonly Destination?: string | undefined = undefined;
  readonly OtherChainSource: string = undefined as any;
  readonly PublicKey: string = undefined as any;
  readonly Signature: string = undefined as any;
  readonly XChainAttestationSequence: number = undefined as any;

  constructor(props: XChainAddClaimAttestationTxFields) {
    super({ ...props, TransactionType: 'XChainAddClaimAttestation' } );
    this.XChainBridge = props.XChainBridge as Record<string, unknown>;
    this.XChainClaimID = props.XChainClaimID as number;
    this.Amount = props.Amount as string;
    this.Destination = props.Destination as string;
    this.OtherChainSource = props.OtherChainSource as string;
    this.PublicKey = props.PublicKey as string;
    this.Signature = props.Signature as string;
    this.XChainAttestationSequence = props.XChainAttestationSequence as number;
  }

  override validate(): void {
    super.validate();
    if (!isRecord(this.XChainBridge)) throw new ValidationError('XChainAddClaimAttestation: missing or invalid XChainBridge');
    if (!isNumber(this.XChainClaimID)) throw new ValidationError('XChainAddClaimAttestation: missing or invalid XChainClaimID');
    if (!isString(this.PublicKey)) throw new ValidationError('XChainAddClaimAttestation: missing or invalid PublicKey');
  }
}
