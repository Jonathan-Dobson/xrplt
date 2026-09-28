/**
 * xrplt — Standalone XRPL Transaction Builder
 *
 * A zero-dependency package for creating, validating, and manipulating
 * XRP Ledger transactions with a clean class-based API.
 *
 * @packageDocumentation
 */

// Initialize the registry (must be first — wires up Transaction.create())
import './registry.js';

// ─── Core ────────────────────────────────────────────────────────────
export { Transaction } from './transaction.js';
export { TransactionRegistry } from './registry.js';
export { ValidationError, TransactionError } from './errors.js';

// ─── Types ───────────────────────────────────────────────────────────
export type {
  Amount, IssuedCurrencyAmount, MPTAmount, ClawbackAmount,
  IssuedCurrency, Currency,
  Memo, Signer, PathStep, Path, XChainBridge,
  AuthorizeCredential, SignerEntry, OracleDataSeries,
  AuthAccount, XChainClaimAttestation, XChainAccountCreateAttestation,
  BaseTransactionFields, PreparedTransactionFields, SignedTransactionFields,
  TransactionType,
  GlobalFlagsInterface, PaymentFlagsInterface, AccountSetFlagsInterface,
  TrustSetFlagsInterface, OfferCreateFlagsInterface,
  NFTokenMintFlagsInterface, NFTokenCreateOfferFlagsInterface,
  PaymentChannelClaimFlagsInterface,
  AMMDepositFlagsInterface, AMMWithdrawFlagsInterface,
  MPTokenAuthorizeFlagsInterface,
  MPTokenIssuanceCreateFlagsInterface, MPTokenIssuanceSetFlagsInterface,
  MPTokenImmutableFlagsInterface,
  VaultCreateFlagsInterface,
  ClawbackFlagsInterface,
  XChainModifyBridgeFlagsInterface, BatchFlagsInterface,
} from './types/index.js';

export {
  GlobalFlags, PaymentFlags, AccountSetAsfFlags, AccountSetTfFlags,
  TrustSetFlags, OfferCreateFlags,
  NFTokenMintFlags, NFTokenCreateOfferFlags,
  PaymentChannelClaimFlags,
  AMMDepositFlags, AMMWithdrawFlags,
  MPTokenAuthorizeFlags,
  MPTokenIssuanceCreateFlags, MPTokenIssuanceSetFlags,
  MPTokenImmutableFlags,
  VaultCreateFlags,
  ClawbackFlags,
  XChainModifyBridgeFlags, BatchFlags,
} from './types/index.js';

// ─── Group abstract classes ──────────────────────────────────────────
export { AccountTransaction } from './groups/account.js';
export { PaymentTransaction } from './groups/payment.js';
export { TokenTransaction } from './groups/token.js';
export { OfferTransaction } from './groups/offer.js';
export { AMMTransaction } from './groups/amm.js';
export { XChainTransaction } from './groups/xchain.js';
export { VaultTransaction } from './groups/vault.js';
export { LoanTransaction } from './groups/loan.js';
export { CredentialTransaction } from './groups/credential.js';
export { OracleTransaction } from './groups/oracle.js';
export { PermissionedDomainTransaction } from './groups/permissioned-domain.js';

// ─── Concrete transaction classes ────────────────────────────────────

// Account management
export { Payment } from './transactions/payment.js';
export type { PaymentTxFields } from './transactions/payment.js';
export { AccountSet } from './transactions/account-set.js';
export type { AccountSetTxFields } from './transactions/account-set.js';
export { AccountDelete } from './transactions/account-delete.js';
export type { AccountDeleteTxFields } from './transactions/account-delete.js';
export { SetRegularKey } from './transactions/set-regular-key.js';
export type { SetRegularKeyTxFields } from './transactions/set-regular-key.js';
export { SignerListSet } from './transactions/signer-list-set.js';
export type { SignerListSetTxFields } from './transactions/signer-list-set.js';
export { TicketCreate } from './transactions/ticket-create.js';
export type { TicketCreateTxFields } from './transactions/ticket-create.js';
export { DepositPreauth } from './transactions/deposit-preauth.js';
export type { DepositPreauthTxFields } from './transactions/deposit-preauth.js';
export { Clawback } from './transactions/clawback.js';
export type { ClawbackTxFields } from './transactions/clawback.js';
export { DelegateSet } from './transactions/delegate-set.js';
export type { DelegateSetTxFields } from './transactions/delegate-set.js';

// Payments & value transfer
export { TrustSet } from './transactions/trust-set.js';
export type { TrustSetTxFields } from './transactions/trust-set.js';
export { EscrowCreate } from './transactions/escrow-create.js';
export type { EscrowCreateTxFields } from './transactions/escrow-create.js';
export { EscrowFinish } from './transactions/escrow-finish.js';
export type { EscrowFinishTxFields } from './transactions/escrow-finish.js';
export { EscrowCancel } from './transactions/escrow-cancel.js';
export type { EscrowCancelTxFields } from './transactions/escrow-cancel.js';
export { CheckCreate } from './transactions/check-create.js';
export type { CheckCreateTxFields } from './transactions/check-create.js';
export { CheckCash } from './transactions/check-cash.js';
export type { CheckCashTxFields } from './transactions/check-cash.js';
export { CheckCancel } from './transactions/check-cancel.js';
export type { CheckCancelTxFields } from './transactions/check-cancel.js';
export { PaymentChannelCreate } from './transactions/payment-channel-create.js';
export type { PaymentChannelCreateTxFields } from './transactions/payment-channel-create.js';
export { PaymentChannelFund } from './transactions/payment-channel-fund.js';
export type { PaymentChannelFundTxFields } from './transactions/payment-channel-fund.js';
export { PaymentChannelClaim } from './transactions/payment-channel-claim.js';
export type { PaymentChannelClaimTxFields } from './transactions/payment-channel-claim.js';

// DEX
export { OfferCreate } from './transactions/offer-create.js';
export type { OfferCreateTxFields } from './transactions/offer-create.js';
export { OfferCancel } from './transactions/offer-cancel.js';
export type { OfferCancelTxFields } from './transactions/offer-cancel.js';

// NFTokens
export { NFTokenMint } from './transactions/nftoken-mint.js';
export type { NFTokenMintTxFields } from './transactions/nftoken-mint.js';
export { NFTokenBurn } from './transactions/nftoken-burn.js';
export type { NFTokenBurnTxFields } from './transactions/nftoken-burn.js';
export { NFTokenCreateOffer } from './transactions/nftoken-create-offer.js';
export type { NFTokenCreateOfferTxFields } from './transactions/nftoken-create-offer.js';
export { NFTokenCancelOffer } from './transactions/nftoken-cancel-offer.js';
export type { NFTokenCancelOfferTxFields } from './transactions/nftoken-cancel-offer.js';
export { NFTokenAcceptOffer } from './transactions/nftoken-accept-offer.js';
export type { NFTokenAcceptOfferTxFields } from './transactions/nftoken-accept-offer.js';
export { NFTokenModify } from './transactions/nftoken-modify.js';
export type { NFTokenModifyTxFields } from './transactions/nftoken-modify.js';

// Multi-Purpose Tokens
export { MPTokenIssuanceCreate } from './transactions/mptoken-issuance-create.js';
export type { MPTokenIssuanceCreateTxFields } from './transactions/mptoken-issuance-create.js';
export { MPTokenIssuanceDestroy } from './transactions/mptoken-issuance-destroy.js';
export type { MPTokenIssuanceDestroyTxFields } from './transactions/mptoken-issuance-destroy.js';
export { MPTokenIssuanceSet } from './transactions/mptoken-issuance-set.js';
export type { MPTokenIssuanceSetTxFields } from './transactions/mptoken-issuance-set.js';
export { MPTokenAuthorize } from './transactions/mptoken-authorize.js';
export type { MPTokenAuthorizeTxFields } from './transactions/mptoken-authorize.js';

// AMM
export { AMMCreate } from './transactions/amm-create.js';
export type { AMMCreateTxFields } from './transactions/amm-create.js';
export { AMMDeposit } from './transactions/amm-deposit.js';
export type { AMMDepositTxFields } from './transactions/amm-deposit.js';
export { AMMWithdraw } from './transactions/amm-withdraw.js';
export type { AMMWithdrawTxFields } from './transactions/amm-withdraw.js';
export { AMMVote } from './transactions/amm-vote.js';
export type { AMMVoteTxFields } from './transactions/amm-vote.js';
export { AMMBid } from './transactions/amm-bid.js';
export type { AMMBidTxFields } from './transactions/amm-bid.js';
export { AMMClawback } from './transactions/amm-clawback.js';
export type { AMMClawbackTxFields } from './transactions/amm-clawback.js';
export { AMMDelete } from './transactions/amm-delete.js';
export type { AMMDeleteTxFields } from './transactions/amm-delete.js';

// XChain
export { XChainCreateBridge } from './transactions/xchain-create-bridge.js';
export type { XChainCreateBridgeTxFields } from './transactions/xchain-create-bridge.js';
export { XChainModifyBridge } from './transactions/xchain-modify-bridge.js';
export type { XChainModifyBridgeTxFields } from './transactions/xchain-modify-bridge.js';
export { XChainCommit } from './transactions/xchain-commit.js';
export type { XChainCommitTxFields } from './transactions/xchain-commit.js';
export { XChainClaim } from './transactions/xchain-claim.js';
export type { XChainClaimTxFields } from './transactions/xchain-claim.js';
export { XChainAccountCreateCommit } from './transactions/xchain-account-create-commit.js';
export type { XChainAccountCreateCommitTxFields } from './transactions/xchain-account-create-commit.js';
export { XChainCreateClaimID } from './transactions/xchain-create-claim-id.js';
export type { XChainCreateClaimIDTxFields } from './transactions/xchain-create-claim-id.js';
export { XChainAddClaimAttestation } from './transactions/xchain-add-claim-attestation.js';
export type { XChainAddClaimAttestationTxFields } from './transactions/xchain-add-claim-attestation.js';
export { XChainAddAccountCreateAttestation } from './transactions/xchain-add-account-create-attestation.js';
export type { XChainAddAccountCreateAttestationTxFields } from './transactions/xchain-add-account-create-attestation.js';

// Vaults
export { VaultCreate } from './transactions/vault-create.js';
export type { VaultCreateTxFields } from './transactions/vault-create.js';
export { VaultDeposit } from './transactions/vault-deposit.js';
export type { VaultDepositTxFields } from './transactions/vault-deposit.js';
export { VaultWithdraw } from './transactions/vault-withdraw.js';
export type { VaultWithdrawTxFields } from './transactions/vault-withdraw.js';
export { VaultSet } from './transactions/vault-set.js';
export type { VaultSetTxFields } from './transactions/vault-set.js';
export { VaultDelete } from './transactions/vault-delete.js';
export type { VaultDeleteTxFields } from './transactions/vault-delete.js';
export { VaultClawback } from './transactions/vault-clawback.js';
export type { VaultClawbackTxFields } from './transactions/vault-clawback.js';

// Loans
export { LoanSet } from './transactions/loan-set.js';
export type { LoanSetTxFields } from './transactions/loan-set.js';
export { LoanDelete } from './transactions/loan-delete.js';
export type { LoanDeleteTxFields } from './transactions/loan-delete.js';
export { LoanManage } from './transactions/loan-manage.js';
export type { LoanManageTxFields } from './transactions/loan-manage.js';
export { LoanPay } from './transactions/loan-pay.js';
export type { LoanPayTxFields } from './transactions/loan-pay.js';
export { LoanBrokerSet } from './transactions/loan-broker-set.js';
export type { LoanBrokerSetTxFields } from './transactions/loan-broker-set.js';
export { LoanBrokerDelete } from './transactions/loan-broker-delete.js';
export type { LoanBrokerDeleteTxFields } from './transactions/loan-broker-delete.js';
export { LoanBrokerCoverClawback } from './transactions/loan-broker-cover-clawback.js';
export type { LoanBrokerCoverClawbackTxFields } from './transactions/loan-broker-cover-clawback.js';
export { LoanBrokerCoverDeposit } from './transactions/loan-broker-cover-deposit.js';
export type { LoanBrokerCoverDepositTxFields } from './transactions/loan-broker-cover-deposit.js';
export { LoanBrokerCoverWithdraw } from './transactions/loan-broker-cover-withdraw.js';
export type { LoanBrokerCoverWithdrawTxFields } from './transactions/loan-broker-cover-withdraw.js';

// Credentials
export { CredentialCreate } from './transactions/credential-create.js';
export type { CredentialCreateTxFields } from './transactions/credential-create.js';
export { CredentialAccept } from './transactions/credential-accept.js';
export type { CredentialAcceptTxFields } from './transactions/credential-accept.js';
export { CredentialDelete } from './transactions/credential-delete.js';
export type { CredentialDeleteTxFields } from './transactions/credential-delete.js';

// Oracles
export { OracleSet } from './transactions/oracle-set.js';
export type { OracleSetTxFields } from './transactions/oracle-set.js';
export { OracleDelete } from './transactions/oracle-delete.js';
export type { OracleDeleteTxFields } from './transactions/oracle-delete.js';

// Permissioned Domain
export { PermissionedDomainSet } from './transactions/permissioned-domain-set.js';
export type { PermissionedDomainSetTxFields } from './transactions/permissioned-domain-set.js';
export { PermissionedDomainDelete } from './transactions/permissioned-domain-delete.js';
export type { PermissionedDomainDeleteTxFields } from './transactions/permissioned-domain-delete.js';

// Batch
export { Batch } from './transactions/batch.js';
export type { BatchTxFields } from './transactions/batch.js';

// DID
export { DIDSet } from './transactions/did-set.js';
export type { DIDSetTxFields } from './transactions/did-set.js';
export { DIDDelete } from './transactions/did-delete.js';
export type { DIDDeleteTxFields } from './transactions/did-delete.js';

// ─── Validation utilities ────────────────────────────────────────────
export {
  isAmount, isIssuedCurrencyAmount, isMPTAmount,
  isAccount, isMemo, isSigner, isHex,
  isDomainID, isFlagEnabled,
} from './validation/index.js';


// ─── Deprecated *Tx aliases (kept for v0.4.x; remove in v0.5.0) ─────────
export { AMMBid as AMMBidTx } from './transactions/amm-bid.js'; // @deprecated use `AMMBid`
export { AMMClawback as AMMClawbackTx } from './transactions/amm-clawback.js'; // @deprecated use `AMMClawback`
export { AMMCreate as AMMCreateTx } from './transactions/amm-create.js'; // @deprecated use `AMMCreate`
export { AMMDelete as AMMDeleteTx } from './transactions/amm-delete.js'; // @deprecated use `AMMDelete`
export { AMMDeposit as AMMDepositTx } from './transactions/amm-deposit.js'; // @deprecated use `AMMDeposit`
export { AMMVote as AMMVoteTx } from './transactions/amm-vote.js'; // @deprecated use `AMMVote`
export { AMMWithdraw as AMMWithdrawTx } from './transactions/amm-withdraw.js'; // @deprecated use `AMMWithdraw`
export { AccountDelete as AccountDeleteTx } from './transactions/account-delete.js'; // @deprecated use `AccountDelete`
export { AccountSet as AccountSetTx } from './transactions/account-set.js'; // @deprecated use `AccountSet`
export { Batch as BatchTx } from './transactions/batch.js'; // @deprecated use `Batch`
export { CheckCancel as CheckCancelTx } from './transactions/check-cancel.js'; // @deprecated use `CheckCancel`
export { CheckCash as CheckCashTx } from './transactions/check-cash.js'; // @deprecated use `CheckCash`
export { CheckCreate as CheckCreateTx } from './transactions/check-create.js'; // @deprecated use `CheckCreate`
export { Clawback as ClawbackTx } from './transactions/clawback.js'; // @deprecated use `Clawback`
export { CredentialAccept as CredentialAcceptTx } from './transactions/credential-accept.js'; // @deprecated use `CredentialAccept`
export { CredentialCreate as CredentialCreateTx } from './transactions/credential-create.js'; // @deprecated use `CredentialCreate`
export { CredentialDelete as CredentialDeleteTx } from './transactions/credential-delete.js'; // @deprecated use `CredentialDelete`
export { DIDDelete as DIDDeleteTx } from './transactions/did-delete.js'; // @deprecated use `DIDDelete`
export { DIDSet as DIDSetTx } from './transactions/did-set.js'; // @deprecated use `DIDSet`
export { DelegateSet as DelegateSetTx } from './transactions/delegate-set.js'; // @deprecated use `DelegateSet`
export { DepositPreauth as DepositPreauthTx } from './transactions/deposit-preauth.js'; // @deprecated use `DepositPreauth`
export { EscrowCancel as EscrowCancelTx } from './transactions/escrow-cancel.js'; // @deprecated use `EscrowCancel`
export { EscrowCreate as EscrowCreateTx } from './transactions/escrow-create.js'; // @deprecated use `EscrowCreate`
export { EscrowFinish as EscrowFinishTx } from './transactions/escrow-finish.js'; // @deprecated use `EscrowFinish`
export { LoanBrokerCoverClawback as LoanBrokerCoverClawbackTx } from './transactions/loan-broker-cover-clawback.js'; // @deprecated use `LoanBrokerCoverClawback`
export { LoanBrokerCoverDeposit as LoanBrokerCoverDepositTx } from './transactions/loan-broker-cover-deposit.js'; // @deprecated use `LoanBrokerCoverDeposit`
export { LoanBrokerCoverWithdraw as LoanBrokerCoverWithdrawTx } from './transactions/loan-broker-cover-withdraw.js'; // @deprecated use `LoanBrokerCoverWithdraw`
export { LoanBrokerDelete as LoanBrokerDeleteTx } from './transactions/loan-broker-delete.js'; // @deprecated use `LoanBrokerDelete`
export { LoanBrokerSet as LoanBrokerSetTx } from './transactions/loan-broker-set.js'; // @deprecated use `LoanBrokerSet`
export { LoanDelete as LoanDeleteTx } from './transactions/loan-delete.js'; // @deprecated use `LoanDelete`
export { LoanManage as LoanManageTx } from './transactions/loan-manage.js'; // @deprecated use `LoanManage`
export { LoanPay as LoanPayTx } from './transactions/loan-pay.js'; // @deprecated use `LoanPay`
export { LoanSet as LoanSetTx } from './transactions/loan-set.js'; // @deprecated use `LoanSet`
export { MPTokenAuthorize as MPTokenAuthorizeTx } from './transactions/mptoken-authorize.js'; // @deprecated use `MPTokenAuthorize`
export { MPTokenIssuanceCreate as MPTokenIssuanceCreateTx } from './transactions/mptoken-issuance-create.js'; // @deprecated use `MPTokenIssuanceCreate`
export { MPTokenIssuanceDestroy as MPTokenIssuanceDestroyTx } from './transactions/mptoken-issuance-destroy.js'; // @deprecated use `MPTokenIssuanceDestroy`
export { MPTokenIssuanceSet as MPTokenIssuanceSetTx } from './transactions/mptoken-issuance-set.js'; // @deprecated use `MPTokenIssuanceSet`
export { NFTokenAcceptOffer as NFTokenAcceptOfferTx } from './transactions/nftoken-accept-offer.js'; // @deprecated use `NFTokenAcceptOffer`
export { NFTokenBurn as NFTokenBurnTx } from './transactions/nftoken-burn.js'; // @deprecated use `NFTokenBurn`
export { NFTokenCancelOffer as NFTokenCancelOfferTx } from './transactions/nftoken-cancel-offer.js'; // @deprecated use `NFTokenCancelOffer`
export { NFTokenCreateOffer as NFTokenCreateOfferTx } from './transactions/nftoken-create-offer.js'; // @deprecated use `NFTokenCreateOffer`
export { NFTokenMint as NFTokenMintTx } from './transactions/nftoken-mint.js'; // @deprecated use `NFTokenMint`
export { NFTokenModify as NFTokenModifyTx } from './transactions/nftoken-modify.js'; // @deprecated use `NFTokenModify`
export { OfferCancel as OfferCancelTx } from './transactions/offer-cancel.js'; // @deprecated use `OfferCancel`
export { OfferCreate as OfferCreateTx } from './transactions/offer-create.js'; // @deprecated use `OfferCreate`
export { OracleDelete as OracleDeleteTx } from './transactions/oracle-delete.js'; // @deprecated use `OracleDelete`
export { OracleSet as OracleSetTx } from './transactions/oracle-set.js'; // @deprecated use `OracleSet`
export { PaymentChannelClaim as PaymentChannelClaimTx } from './transactions/payment-channel-claim.js'; // @deprecated use `PaymentChannelClaim`
export { PaymentChannelCreate as PaymentChannelCreateTx } from './transactions/payment-channel-create.js'; // @deprecated use `PaymentChannelCreate`
export { PaymentChannelFund as PaymentChannelFundTx } from './transactions/payment-channel-fund.js'; // @deprecated use `PaymentChannelFund`
export { Payment as PaymentTx } from './transactions/payment.js'; // @deprecated use `Payment`
export { PermissionedDomainDelete as PermissionedDomainDeleteTx } from './transactions/permissioned-domain-delete.js'; // @deprecated use `PermissionedDomainDelete`
export { PermissionedDomainSet as PermissionedDomainSetTx } from './transactions/permissioned-domain-set.js'; // @deprecated use `PermissionedDomainSet`
export { SetRegularKey as SetRegularKeyTx } from './transactions/set-regular-key.js'; // @deprecated use `SetRegularKey`
export { SignerListSet as SignerListSetTx } from './transactions/signer-list-set.js'; // @deprecated use `SignerListSet`
export { TicketCreate as TicketCreateTx } from './transactions/ticket-create.js'; // @deprecated use `TicketCreate`
export { TrustSet as TrustSetTx } from './transactions/trust-set.js'; // @deprecated use `TrustSet`
export { VaultClawback as VaultClawbackTx } from './transactions/vault-clawback.js'; // @deprecated use `VaultClawback`
export { VaultCreate as VaultCreateTx } from './transactions/vault-create.js'; // @deprecated use `VaultCreate`
export { VaultDelete as VaultDeleteTx } from './transactions/vault-delete.js'; // @deprecated use `VaultDelete`
export { VaultDeposit as VaultDepositTx } from './transactions/vault-deposit.js'; // @deprecated use `VaultDeposit`
export { VaultSet as VaultSetTx } from './transactions/vault-set.js'; // @deprecated use `VaultSet`
export { VaultWithdraw as VaultWithdrawTx } from './transactions/vault-withdraw.js'; // @deprecated use `VaultWithdraw`
export { XChainAccountCreateCommit as XChainAccountCreateCommitTx } from './transactions/xchain-account-create-commit.js'; // @deprecated use `XChainAccountCreateCommit`
export { XChainAddAccountCreateAttestation as XChainAddAccountCreateAttestationTx } from './transactions/xchain-add-account-create-attestation.js'; // @deprecated use `XChainAddAccountCreateAttestation`
export { XChainAddClaimAttestation as XChainAddClaimAttestationTx } from './transactions/xchain-add-claim-attestation.js'; // @deprecated use `XChainAddClaimAttestation`
export { XChainClaim as XChainClaimTx } from './transactions/xchain-claim.js'; // @deprecated use `XChainClaim`
export { XChainCommit as XChainCommitTx } from './transactions/xchain-commit.js'; // @deprecated use `XChainCommit`
export { XChainCreateBridge as XChainCreateBridgeTx } from './transactions/xchain-create-bridge.js'; // @deprecated use `XChainCreateBridge`
export { XChainCreateClaimID as XChainCreateClaimIDTx } from './transactions/xchain-create-claim-id.js'; // @deprecated use `XChainCreateClaimID`
export { XChainModifyBridge as XChainModifyBridgeTx } from './transactions/xchain-modify-bridge.js'; // @deprecated use `XChainModifyBridge`
