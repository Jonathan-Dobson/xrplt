# xrplt API Documentation

`xrplt` is a 100% type-safe, zero-dependency transaction builder for the XRP Ledger. It is designed to work seamlessly with `xrpl.js` while providing a robust class-based hierarchy for all 70+ XRPL transaction types.

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Factory Patterns](#factory-patterns)
3. [Transaction Categories](#transaction-categories)
    - [Core (Payments & Account)](#core-transactions)
    - [DEX & AMM (Liquidity)](#dex--amm-transactions)
    - [Token Ecosystem (NFT & MPT)](#token-ecosystem)
    - [Interoperability (XChain Bridges)](#interoperability)
    - [Advanced Smart Contracts](#advanced-smart-contracts)
4. [Advanced Usage](#advanced-usage)
    - [Multi-Signature](#multi-signature)
    - [Master Key Management](#master-key-management)
    - [Ticket-Based Submissions](#ticket-based-submissions)

---

## Core Concepts

### The `Transaction` Base Class
Every transaction in the library extends the `Transaction` base class. This provides common fields (`Account`, `Fee`, `Sequence`, `Flags`, etc.) and shared utility methods. All classes are fully decorated with JSDoc for IDE discovery.

### Serialization & Reliability
The `toJSON()` method produces a plain object that is 100% compliant with the `xrpl.js` schema. Every class uses explicit property initialization to ensure reliability across all JavaScript environments.
```typescript
const payment = new Payment({
  Account: 'r...',
  Amount: '1000000',
  Destination: 'r...',
});

const txJSON = payment.toJSON();
// Ready for client.autofill(txJSON)
```

### Immutability (`with`)
Transactions are immutable. To modify a transaction, use the `.with()` method, which returns a new instance of the same type.
```typescript
const updated = payment.with({ Fee: '12', Sequence: 42 });
```

---

## Factory Patterns

### Generic Factory
Create any transaction type by name using the static `Transaction.create()` method.
```typescript
const tx = Transaction.create('NFTokenMint', {
  Account: 'r...',
  NFTokenTaxon: 0,
});
```

### Convenience Factories
Common types have dedicated static methods for improved type hinting and developer experience.
```typescript
const pay = Transaction.payment({ ... });
const mint = Transaction.nfTokenMint({ ... });
const offer = Transaction.offerCreate({ ... });
```

---

## Transaction Categories

### Core Transactions
| Class | Description |
| :--- | :--- |
| `Payment` | Send XRP or Issued Currencies. |
| `AccountSet` | Modify account settings and flags. |
| `SetRegularKey` | Assign a secondary signing key. |
| `TrustSet` | Create or modify a trust line. |
| `SignerListSet` | Setup Multi-Signature authority. |

### DEX & AMM Transactions
| Class | Description |
| :--- | :--- |
| `OfferCreate` | Place a limit order on the DEX. |
| `OfferCancel` | Cancel an existing order via sequence. |
| `AMMCreate` | Create a new Automated Market Maker instance. |
| `AMMDeposit` | Add liquidity to an AMM pool. |
| `AMMWithdraw` | Remove liquidity from an AMM pool. |

### Token Ecosystem (NFT & MPT)
| Class | Description |
| :--- | :--- |
| `NFTokenMint` | Create a new NFT. |
| `NFTokenCreateOffer` | Create a buy or sell offer for an NFT. |
| `NFTokenAcceptOffer` | Complete an NFT trade. |
| `MPTokenIssuanceCreate` | Create a new Multi-Purpose Token issuance. |
| `MPTokenAuthorize` | Authorize an account to hold an MPT. |

### Interoperability (XChain Bridges)
| Class | Description |
| :--- | :--- |
| `XChainCreateBridge` | Initialize a cross-chain bridge. |
| `XChainCommit` | Lock funds on the source chain for transfer. |
| `XChainClaim` | Claim funds on the destination chain. |
| `XChainAddClaimAttestation` | Provide witness signatures for transfers. |

### Advanced Smart Contracts
| Class | Description |
| :--- | :--- |
| `EscrowCreate` | Lock funds with time or crypto-conditions. |
| `CheckCreate` | Create a deferred payment check. |
| `PaymentChannelCreate` | Open a high-throughput payment channel. |
| `VaultCreate` | Create a secure vault for managed assets. |
| `LoanSet` | Configure on-chain loan parameters. |
| `DIDSet` | Manage Decentralized Identifiers. |
| `OracleSet` | Submit external data (price feeds) to the ledger. |

---

## Advanced Usage

### Multi-Signature
```typescript
const pay = new Payment({ Account: alice, ... });
const json = pay.toJSON();

// Autofill for 2 signers
const prepared = await client.autofill(json, 2);

// Collect signatures from individual wallets
const sig1 = bobWallet.sign(prepared, true);
const sig2 = charlieWallet.sign(prepared, true);

// Combine and submit
const combined = multisign([sig1.tx_blob, sig2.tx_blob]);
await client.submitAndWait(combined);
```

### Ticket-Based Submissions
Tickets allow out-of-order submission.
```typescript
const pay = new Payment({
  Account: alice,
  Sequence: 0, // Required when using tickets
  TicketSequence: 1723849,
  Amount: '1000000',
  Destination: bob
});
```

---

## Error Handling
The library throws two primary error types:
- `ValidationError`: Thrown during `.validate()` if required fields are missing or malformed.
- `TransactionError`: Thrown by the factory if an unknown `TransactionType` is requested.
