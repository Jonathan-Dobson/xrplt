# xrplt

Transaction builder for XRPL

`xrplt` is designed to provide a premium developer experience for constructing, validating, and manipulating XRPL transaction data. It replaces the xrpl legacy union-of-interfaces pattern with a robust class hierarchy, enabling inherited properties, logical grouping, and strict runtime validation.

[![NPM Version](https://img.shields.io/npm/v/xrplt.svg)](https://www.npmjs.com/package/xrplt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Documentation

For a comprehensive guide to all 70+ transaction types and advanced usage patterns, see the [API Documentation](API_DOCUMENTATION.md).

## Features

- **🚀 Zero Dependencies:** No reliance on `xrpl.js`, `ripple-binary-codec`, or any other runtime libraries.
- **🏗️ Class-Based API:** 71+ transaction types implemented as concrete classes.
- **🛡️ Strict Type Safety:** Built from the ground up for TypeScript, supporting `exactOptionalPropertyTypes`.
- **🧪 Built-in Validation:** Every transaction class includes a `validate()` method for ledger-compliant checks.
- **💎 Immutable Updates:** Use the `.with()` pattern to create modified copies of transactions without side effects.
- **🔌 Registry Pattern:** Easily instantiate transactions from JSON using the central registry or factory methods.
- **🤝 XRPL.js Compatible:** `toJSON()` output matches the exact shape required by `xrpl.js` and the XRPL ledger.
- **🎯 Reliability Gold Standard:** 100% property discovery through explicit initialization, ensuring safe serialization in any environment (Node, Browser, Cloudflare Workers).

## Installation

```bash
npm install xrplt
```

## Quick Start

### Creating a Transaction

```typescript
import { Transaction, PaymentTx } from 'xrplt';

// Option 1: Using the convenience factory
const tx = Transaction.payment({
  Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
  Amount: '1000000', // 1 XRP in drops
});

// Option 2: Using the concrete class
const payment = new PaymentTx({
  Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
  Amount: '1000000',
});

// Validation
payment.validate(); // Throws ValidationError if invalid

// Serialization
const json = payment.toJSON();
console.log(json);
```

### Immutable Updates with `.with()`

```typescript
const tx1 = Transaction.payment({
  Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
  Amount: '1000000',
});

// Create a new transaction with a Fee and Sequence
const tx2 = tx1.with({
  Fee: '12',
  Sequence: 42,
});

console.log(tx2.Fee); // '12'
console.log(tx1.Fee); // undefined (tx1 remains unchanged)
```

## Supported Transaction Types (71)

`xrplt` provides 100% coverage for standard and experimental XRPL transaction types, including:

- **Core:** `Payment`, `AccountSet`, `TrustSet`, `OfferCreate`, `OfferCancel`, `Check*`, `Escrow*`, `SignerListSet`, etc.
- **NFTs:** `NFTokenMint`, `NFTokenBurn`, `NFTokenCreateOffer`, `NFTokenAcceptOffer`, etc.
- **AMM:** `AMMCreate`, `AMMDeposit`, `AMMWithdraw`, `AMMVote`, `AMMBid`, etc.
- **MPT:** `MPTokenIssuanceCreate`, `MPTokenAuthorize`, etc.
- **Sidechains:** `XChainCreateBridge`, `XChainCommit`, `XChainClaim`, etc.
- **Niche:** `Vault*`, `Loan*`, `Oracle*`, `Credential*`, `DID*`, `Batch`, etc.

## Why use xrplt?

Modern XRPL development often requires high-fidelity transaction construction without the overhead of a full ledger library. `xrplt` is ideal for:

1. **Lightweight Clients:** Perfect for mobile apps or edge functions where bundle size matters.
2. **Transaction Builders:** Provides a clean UI-to-JSON mapping with instant validation.
3. **Backend Services:** Robust, typed transaction generation for high-throughput environments.
4. **Tooling:** A solid foundation for explorers, wallets, and signing tools.

## License

MIT
