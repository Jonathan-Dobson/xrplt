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
  CounterpartySignature,
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
  LoanSetFlagsInterface,
  LoanPayFlagsInterface,
  LoanManageFlagsInterface,
  ClawbackFlagsInterface,
  XChainModifyBridgeFlagsInterface, BatchFlagsInterface,
  SponsorshipSetFlagsInterface, SponsorshipTransferFlagsInterface,
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
  VaultWithdrawalPolicy, VaultKind,
  LoanSetFlags,
  LoanPayFlags,
  LoanManageFlags,
  ClawbackFlags,
  XChainModifyBridgeFlags, BatchFlags,
  SponsorshipSetFlags, SponsorshipTransferFlags,
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
export type { BatchTxFields, BatchSigner, RawTransaction } from './transactions/batch.js';

// DID
export { DIDSet } from './transactions/did-set.js';
export type { DIDSetTxFields } from './transactions/did-set.js';
export { DIDDelete } from './transactions/did-delete.js';
export type { DIDDeleteTxFields } from './transactions/did-delete.js';

// Sponsorship (Sponsor amendment — not_enabled)
export { SponsorshipSet } from './transactions/sponsorship-set.js';
export type { SponsorshipSetTxFields } from './transactions/sponsorship-set.js';
export { SponsorshipTransfer } from './transactions/sponsorship-transfer.js';
export type { SponsorshipTransferTxFields } from './transactions/sponsorship-transfer.js';

// Ledger-state fix
export { LedgerStateFix } from './transactions/ledger-state-fix.js';
export type { LedgerStateFixTxFields } from './transactions/ledger-state-fix.js';

// ConfidentialMPT family (ConfidentialTransfer amendment — not_enabled)
export { ConfidentialMPTClawback } from './transactions/confidential-mpt-clawback.js';
export type { ConfidentialMPTClawbackTxFields } from './transactions/confidential-mpt-clawback.js';
export { ConfidentialMPTConvert } from './transactions/confidential-mpt-convert.js';
export type { ConfidentialMPTConvertTxFields } from './transactions/confidential-mpt-convert.js';
export { ConfidentialMPTConvertBack } from './transactions/confidential-mpt-convert-back.js';
export type { ConfidentialMPTConvertBackTxFields } from './transactions/confidential-mpt-convert-back.js';
export { ConfidentialMPTMergeInbox } from './transactions/confidential-mpt-merge-inbox.js';
export type { ConfidentialMPTMergeInboxTxFields } from './transactions/confidential-mpt-merge-inbox.js';
export { ConfidentialMPTSend } from './transactions/confidential-mpt-send.js';
export type { ConfidentialMPTSendTxFields } from './transactions/confidential-mpt-send.js';

// ─── Validation utilities ────────────────────────────────────────────
export {
  isAmount, isIssuedCurrencyAmount, isMPTAmount,
  isAccount, isMemo, isSigner, isHex,
  isDomainID, isFlagEnabled,
} from './validation/index.js';


