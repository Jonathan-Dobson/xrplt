/**
 * Transaction Registry — maps TransactionType strings to constructors.
 *
 * This is the single dispatch table that powers `Transaction.create()`.
 * When adding a new transaction type, register it here.
 */
import type { TransactionType } from './types/transaction-types.js';
import { Transaction, _setRegistry } from './transaction.js';

// ─── Concrete transaction imports ────────────────────────────────────
import { Payment } from './transactions/payment.js';
import { AccountSet } from './transactions/account-set.js';
import { AccountDelete } from './transactions/account-delete.js';
import { SetRegularKey } from './transactions/set-regular-key.js';
import { SignerListSet } from './transactions/signer-list-set.js';
import { TrustSet } from './transactions/trust-set.js';
import { OfferCreate } from './transactions/offer-create.js';
import { OfferCancel } from './transactions/offer-cancel.js';
import { EscrowCreate } from './transactions/escrow-create.js';
import { EscrowFinish } from './transactions/escrow-finish.js';
import { EscrowCancel } from './transactions/escrow-cancel.js';
import { CheckCreate } from './transactions/check-create.js';
import { CheckCash } from './transactions/check-cash.js';
import { CheckCancel } from './transactions/check-cancel.js';
import { NFTokenMint } from './transactions/nftoken-mint.js';
import { NFTokenBurn } from './transactions/nftoken-burn.js';
import { NFTokenCreateOffer } from './transactions/nftoken-create-offer.js';
import { NFTokenCancelOffer } from './transactions/nftoken-cancel-offer.js';
import { NFTokenAcceptOffer } from './transactions/nftoken-accept-offer.js';
import { NFTokenModify } from './transactions/nftoken-modify.js';
import { MPTokenIssuanceCreate } from './transactions/mptoken-issuance-create.js';
import { MPTokenIssuanceDestroy } from './transactions/mptoken-issuance-destroy.js';
import { MPTokenIssuanceSet } from './transactions/mptoken-issuance-set.js';
import { MPTokenAuthorize } from './transactions/mptoken-authorize.js';
import { PaymentChannelCreate } from './transactions/payment-channel-create.js';
import { PaymentChannelFund } from './transactions/payment-channel-fund.js';
import { PaymentChannelClaim } from './transactions/payment-channel-claim.js';
import { TicketCreate } from './transactions/ticket-create.js';
import { DepositPreauth } from './transactions/deposit-preauth.js';
import { Clawback } from './transactions/clawback.js';
import { DelegateSet } from './transactions/delegate-set.js';
import { DIDSet } from './transactions/did-set.js';
import { DIDDelete } from './transactions/did-delete.js';

// AMM
import { AMMCreate } from './transactions/amm-create.js';
import { AMMDeposit } from './transactions/amm-deposit.js';
import { AMMWithdraw } from './transactions/amm-withdraw.js';
import { AMMVote } from './transactions/amm-vote.js';
import { AMMBid } from './transactions/amm-bid.js';
import { AMMClawback } from './transactions/amm-clawback.js';
import { AMMDelete } from './transactions/amm-delete.js';

// XChain
import { XChainCreateBridge } from './transactions/xchain-create-bridge.js';
import { XChainModifyBridge } from './transactions/xchain-modify-bridge.js';
import { XChainCommit } from './transactions/xchain-commit.js';
import { XChainClaim } from './transactions/xchain-claim.js';
import { XChainAccountCreateCommit } from './transactions/xchain-account-create-commit.js';
import { XChainCreateClaimID } from './transactions/xchain-create-claim-id.js';
import { XChainAddClaimAttestation } from './transactions/xchain-add-claim-attestation.js';
import { XChainAddAccountCreateAttestation } from './transactions/xchain-add-account-create-attestation.js';

// Vaults
import { VaultCreate } from './transactions/vault-create.js';
import { VaultDeposit } from './transactions/vault-deposit.js';
import { VaultWithdraw } from './transactions/vault-withdraw.js';
import { VaultSet } from './transactions/vault-set.js';
import { VaultDelete } from './transactions/vault-delete.js';
import { VaultClawback } from './transactions/vault-clawback.js';

// Loans
import { LoanSet } from './transactions/loan-set.js';
import { LoanDelete } from './transactions/loan-delete.js';
import { LoanManage } from './transactions/loan-manage.js';
import { LoanPay } from './transactions/loan-pay.js';
import { LoanBrokerSet } from './transactions/loan-broker-set.js';
import { LoanBrokerDelete } from './transactions/loan-broker-delete.js';
import { LoanBrokerCoverClawback } from './transactions/loan-broker-cover-clawback.js';
import { LoanBrokerCoverDeposit } from './transactions/loan-broker-cover-deposit.js';
import { LoanBrokerCoverWithdraw } from './transactions/loan-broker-cover-withdraw.js';

// Credentials
import { CredentialCreate } from './transactions/credential-create.js';
import { CredentialAccept } from './transactions/credential-accept.js';
import { CredentialDelete } from './transactions/credential-delete.js';

// Oracles
import { OracleSet } from './transactions/oracle-set.js';
import { OracleDelete } from './transactions/oracle-delete.js';

// Permissioned Domain
import { PermissionedDomainSet } from './transactions/permissioned-domain-set.js';
import { PermissionedDomainDelete } from './transactions/permissioned-domain-delete.js';

// Batch
import { Batch } from './transactions/batch.js';

// ─── Registry map ────────────────────────────────────────────────────

type TransactionConstructor = new (props: Record<string, unknown>) => Transaction;

const registryMap: Partial<Record<TransactionType, TransactionConstructor>> = {
  // Account management
  AccountSet: AccountSet as unknown as TransactionConstructor,
  AccountDelete: AccountDelete as unknown as TransactionConstructor,
  SetRegularKey: SetRegularKey as unknown as TransactionConstructor,
  SignerListSet: SignerListSet as unknown as TransactionConstructor,
  DelegateSet: DelegateSet as unknown as TransactionConstructor,
  DepositPreauth: DepositPreauth as unknown as TransactionConstructor,
  TicketCreate: TicketCreate as unknown as TransactionConstructor,
  Clawback: Clawback as unknown as TransactionConstructor,

  // Payments & value transfer
  Payment: Payment as unknown as TransactionConstructor,
  CheckCreate: CheckCreate as unknown as TransactionConstructor,
  CheckCash: CheckCash as unknown as TransactionConstructor,
  CheckCancel: CheckCancel as unknown as TransactionConstructor,
  EscrowCreate: EscrowCreate as unknown as TransactionConstructor,
  EscrowFinish: EscrowFinish as unknown as TransactionConstructor,
  EscrowCancel: EscrowCancel as unknown as TransactionConstructor,
  PaymentChannelCreate: PaymentChannelCreate as unknown as TransactionConstructor,
  PaymentChannelFund: PaymentChannelFund as unknown as TransactionConstructor,
  PaymentChannelClaim: PaymentChannelClaim as unknown as TransactionConstructor,

  // DEX offers
  OfferCreate: OfferCreate as unknown as TransactionConstructor,
  OfferCancel: OfferCancel as unknown as TransactionConstructor,

  // Trust lines
  TrustSet: TrustSet as unknown as TransactionConstructor,

  // NFTokens
  NFTokenMint: NFTokenMint as unknown as TransactionConstructor,
  NFTokenBurn: NFTokenBurn as unknown as TransactionConstructor,
  NFTokenCreateOffer: NFTokenCreateOffer as unknown as TransactionConstructor,
  NFTokenCancelOffer: NFTokenCancelOffer as unknown as TransactionConstructor,
  NFTokenAcceptOffer: NFTokenAcceptOffer as unknown as TransactionConstructor,
  NFTokenModify: NFTokenModify as unknown as TransactionConstructor,

  // Multi-Purpose Tokens
  MPTokenIssuanceCreate: MPTokenIssuanceCreate as unknown as TransactionConstructor,
  MPTokenIssuanceDestroy: MPTokenIssuanceDestroy as unknown as TransactionConstructor,
  MPTokenIssuanceSet: MPTokenIssuanceSet as unknown as TransactionConstructor,
  MPTokenAuthorize: MPTokenAuthorize as unknown as TransactionConstructor,

  // AMM
  AMMCreate: AMMCreate as unknown as TransactionConstructor,
  AMMDeposit: AMMDeposit as unknown as TransactionConstructor,
  AMMWithdraw: AMMWithdraw as unknown as TransactionConstructor,
  AMMVote: AMMVote as unknown as TransactionConstructor,
  AMMBid: AMMBid as unknown as TransactionConstructor,
  AMMClawback: AMMClawback as unknown as TransactionConstructor,
  AMMDelete: AMMDelete as unknown as TransactionConstructor,

  // XChain
  XChainCreateBridge: XChainCreateBridge as unknown as TransactionConstructor,
  XChainModifyBridge: XChainModifyBridge as unknown as TransactionConstructor,
  XChainCommit: XChainCommit as unknown as TransactionConstructor,
  XChainClaim: XChainClaim as unknown as TransactionConstructor,
  XChainAccountCreateCommit: XChainAccountCreateCommit as unknown as TransactionConstructor,
  XChainCreateClaimID: XChainCreateClaimID as unknown as TransactionConstructor,
  XChainAddClaimAttestation: XChainAddClaimAttestation as unknown as TransactionConstructor,
  XChainAddAccountCreateAttestation: XChainAddAccountCreateAttestation as unknown as TransactionConstructor,

  // Vaults
  VaultCreate: VaultCreate as unknown as TransactionConstructor,
  VaultDeposit: VaultDeposit as unknown as TransactionConstructor,
  VaultWithdraw: VaultWithdraw as unknown as TransactionConstructor,
  VaultSet: VaultSet as unknown as TransactionConstructor,
  VaultDelete: VaultDelete as unknown as TransactionConstructor,
  VaultClawback: VaultClawback as unknown as TransactionConstructor,

  // Loans
  LoanSet: LoanSet as unknown as TransactionConstructor,
  LoanDelete: LoanDelete as unknown as TransactionConstructor,
  LoanManage: LoanManage as unknown as TransactionConstructor,
  LoanPay: LoanPay as unknown as TransactionConstructor,
  LoanBrokerSet: LoanBrokerSet as unknown as TransactionConstructor,
  LoanBrokerDelete: LoanBrokerDelete as unknown as TransactionConstructor,
  LoanBrokerCoverClawback: LoanBrokerCoverClawback as unknown as TransactionConstructor,
  LoanBrokerCoverDeposit: LoanBrokerCoverDeposit as unknown as TransactionConstructor,
  LoanBrokerCoverWithdraw: LoanBrokerCoverWithdraw as unknown as TransactionConstructor,

  // Credentials
  CredentialCreate: CredentialCreate as unknown as TransactionConstructor,
  CredentialAccept: CredentialAccept as unknown as TransactionConstructor,
  CredentialDelete: CredentialDelete as unknown as TransactionConstructor,

  // Oracles
  OracleSet: OracleSet as unknown as TransactionConstructor,
  OracleDelete: OracleDelete as unknown as TransactionConstructor,

  // Permissioned Domain
  PermissionedDomainSet: PermissionedDomainSet as unknown as TransactionConstructor,
  PermissionedDomainDelete: PermissionedDomainDelete as unknown as TransactionConstructor,

  // Batch
  Batch: Batch as unknown as TransactionConstructor,

  // DID
  DIDSet: DIDSet as unknown as TransactionConstructor,
  DIDDelete: DIDDelete as unknown as TransactionConstructor,
};

// ─── Registry API ────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- static-only namespace holder, not instantiable; converting to `namespace` would lose TS ESM interop.
export class TransactionRegistry {
  static get(type: TransactionType): TransactionConstructor | undefined {
    return registryMap[type];
  }

  static register(type: TransactionType, ctor: TransactionConstructor): void {
    registryMap[type] = ctor;
  }

  static has(type: TransactionType): boolean {
    return type in registryMap;
  }

  static types(): TransactionType[] {
    return Object.keys(registryMap) as TransactionType[];
  }
}

// ─── Wire up synchronous registry access on Transaction base ─────────
_setRegistry(TransactionRegistry);
