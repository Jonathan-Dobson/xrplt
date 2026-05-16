/**
 * Abstract Transaction base class — the primitive root of the hierarchy.
 *
 * Every XRPL transaction extends this class. It provides:
 * - Common fields (Account, TransactionType, Fee, Sequence, etc.)
 * - Inherited validation via the `validate()` chain
 * - Immutable `with()` for creating modified copies
 * - `toJSON()` for serialization to plain objects
 * - Static factory methods for spawning concrete types
 */
import type { TransactionType } from './types/transaction-types.js';
import type { BaseTransactionFields } from './types/base.js';
import type { Memo, Signer } from './types/common.js';
import type { GlobalFlagsInterface } from './types/flags.js';
import { validateBaseTransaction } from './validation/base.js';
import { TransactionError } from './errors.js';

// Synchronous registry reference — set during module initialization
// via `_setRegistry()` called from registry.ts
type RegistryRef = {
  get(type: TransactionType): (new (props: Record<string, unknown>) => Transaction) | undefined;
};

let _syncRegistry: RegistryRef | undefined;

/**
 * @internal Called by registry.ts during module initialization
 * to provide synchronous access to the registry.
 */
export function _setRegistry(registry: RegistryRef): void {
  _syncRegistry = registry;
}



/**
 * Abstract base class for all XRPL transactions.
 *
 * @example
 * ```ts
 * const payment = Transaction.payment({
 *   Account: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
 *   Amount: '1000000',
 *   Destination: 'rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe',
 * });
 *
 * payment.validate();
 * const json = payment.toJSON();
 * ```
 */
export abstract class Transaction {
  /** The unique address of the transaction sender. */
  readonly Account!: string;

  /** The type of transaction. */
  readonly TransactionType!: TransactionType;

  /** XRP in drops to destroy as a network fee. */
  readonly Fee?: string | undefined;

  /** The sequence number of the sending account. */
  readonly Sequence?: number | undefined;

  /** Hash of a previous transaction for ordering. */
  readonly AccountTxnID?: string | undefined;

  /** Bit-flags for this transaction. */
  readonly Flags?: number | GlobalFlagsInterface | undefined;

  /** Maximum ledger index for this transaction. */
  readonly LastLedgerSequence?: number | undefined;

  /** Additional arbitrary memo data. */
  readonly Memos?: Memo[] | undefined;

  /** Multi-signature entries. */
  readonly Signers?: Signer[] | undefined;

  /** Source tag for identifying the sender. */
  readonly SourceTag?: number | undefined;

  /** Public key of the signer. */
  readonly SigningPubKey?: string | undefined;

  /** Ticket sequence number (alternative to Sequence). */
  readonly TicketSequence?: number | undefined;

  /** Transaction signature. */
  readonly TxnSignature?: string | undefined;

  /** Network ID. */
  readonly NetworkID?: number | undefined;

  /** Delegate account. */
  readonly Delegate?: string | undefined;

  /**
   * Protected constructor — concrete subclasses call this via `super()`.
   * Only assigns properties that are actually defined in the input,
   * which satisfies `exactOptionalPropertyTypes`.
   */
  protected constructor(props: BaseTransactionFields) {
    this.Account = props.Account;
    this.TransactionType = props.TransactionType;
    this.Fee = props.Fee;
    this.Sequence = props.Sequence;
    this.AccountTxnID = props.AccountTxnID;
    this.Flags = props.Flags;
    this.LastLedgerSequence = props.LastLedgerSequence;
    this.Memos = props.Memos;
    this.Signers = props.Signers;
    this.SourceTag = props.SourceTag;
    this.SigningPubKey = props.SigningPubKey;
    this.TicketSequence = props.TicketSequence;
    this.TxnSignature = props.TxnSignature;
    this.NetworkID = props.NetworkID;
    this.Delegate = props.Delegate;
  }

  // ─── Validation ──────────────────────────────────────────────────

  /**
   * Validate the common base transaction fields.
   * Subclasses should call `super.validate()` then add their own checks.
   *
   * @throws ValidationError when fields are missing or malformed.
   */
  validate(): void {
    validateBaseTransaction(this.toJSON() as Record<string, unknown>);
  }

  // ─── Serialization ───────────────────────────────────────────────

  /**
   * Serialize this transaction to a plain JSON-compatible object.
   * The output matches the exact shape xrpl.js expects.
   *
   * Strips `undefined` values for clean serialization.
   */
  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {};
    
    // 1. Start with the properties found via Object.keys (enumerable own properties)
    const keys = new Set(Object.keys(this));
    
    // 2. Add properties found via Object.getOwnPropertyNames (all own properties)
    Object.getOwnPropertyNames(this).forEach(k => keys.add(k));

    for (const key of keys) {
      // Skip internal properties starting with _
      if (key.startsWith('_')) continue;
      
      const value = (this as Record<string, unknown>)[key];
      if (value !== undefined && typeof value !== 'function') {
        json[key] = value;
      }
    }
    
    // 3. Guarantee core fields from the base class
    if (this.Account) json.Account = this.Account;
    if (this.TransactionType) json.TransactionType = this.TransactionType;
    if (this.Fee) json.Fee = this.Fee;
    if (this.Sequence !== undefined) json.Sequence = this.Sequence;
    if (this.Flags !== undefined) json.Flags = this.Flags;

    return json;
  }

  // ─── Immutable updates ───────────────────────────────────────────

  /**
   * Create a new transaction instance with the given fields overridden.
   * The original instance is not modified.
   *
   * @param overrides - Fields to override on the new instance.
   * @returns A new transaction of the same concrete type.
   *
   * @example
   * ```ts
   * const withFee = payment.with({ Fee: '12', Sequence: 42 });
   * ```
   */
  with(overrides: Partial<BaseTransactionFields>): this {
    const merged = { ...this.toJSON(), ...overrides } as BaseTransactionFields;
    // Use the constructor of the concrete subclass
    const Ctor = this.constructor as new (props: BaseTransactionFields) => this;
    return new Ctor(merged);
  }

  // ─── Static factory methods ──────────────────────────────────────

  /**
   * Generic factory — create any transaction by type string.
   *
   * @param type - The TransactionType string (e.g. 'Payment', 'OfferCreate')
   * @param props - The transaction fields (TransactionType is injected automatically)
   * @returns A concrete Transaction subclass instance.
   * @throws TransactionError if the type is unknown.
   *
   * @example
   * ```ts
   * const tx = Transaction.create('Payment', {
   *   Account: 'r...',
   *   Amount: '1000000',
   *   Destination: 'r...',
   * });
   * ```
   */
  static create(
    type: TransactionType,
    props: Omit<Record<string, unknown>, 'TransactionType'>,
  ): Transaction {
    if (!_syncRegistry) {
      throw new TransactionError(
        'Transaction registry not initialized. Import from the package entry point.',
      );
    }
    const Ctor = _syncRegistry.get(type);
    if (!Ctor) {
      throw new TransactionError(`Unknown transaction type: ${type}`);
    }
    return new Ctor({ TransactionType: type, ...props } as Record<string, unknown>);
  }

  // ─── Convenience factories (most common types) ───────────────────
  // These provide type-safe shortcuts. Import types are kept inline
  // to avoid circular dependency issues.

  /**
   * Create a Payment transaction.
   */
  static payment(
    props: Omit<Record<string, unknown>, 'TransactionType'> & {
      Account: string;
      Amount: unknown;
      Destination: string;
    },
  ): Transaction {
    return Transaction.create('Payment', props);
  }

  /**
   * Create an AccountSet transaction.
   */
  static accountSet(
    props: Omit<Record<string, unknown>, 'TransactionType'> & {
      Account: string;
    },
  ): Transaction {
    return Transaction.create('AccountSet', props);
  }

  /**
   * Create a TrustSet transaction.
   */
  static trustSet(
    props: Omit<Record<string, unknown>, 'TransactionType'> & {
      Account: string;
      LimitAmount: unknown;
    },
  ): Transaction {
    return Transaction.create('TrustSet', props);
  }

  /**
   * Create an OfferCreate transaction.
   */
  static offerCreate(
    props: Omit<Record<string, unknown>, 'TransactionType'> & {
      Account: string;
      TakerGets: unknown;
      TakerPays: unknown;
    },
  ): Transaction {
    return Transaction.create('OfferCreate', props);
  }

  /**
   * Create an EscrowCreate transaction.
   */
  static escrowCreate(
    props: Omit<Record<string, unknown>, 'TransactionType'> & {
      Account: string;
      Amount: unknown;
      Destination: string;
    },
  ): Transaction {
    return Transaction.create('EscrowCreate', props);
  }

  /**
   * Create a CheckCreate transaction.
   */
  static checkCreate(
    props: Omit<Record<string, unknown>, 'TransactionType'> & {
      Account: string;
      Destination: string;
      SendMax: unknown;
    },
  ): Transaction {
    return Transaction.create('CheckCreate', props);
  }

  /**
   * Create an NFTokenMint transaction.
   */
  static nfTokenMint(
    props: Omit<Record<string, unknown>, 'TransactionType'> & {
      Account: string;
      NFTokenTaxon: number;
    },
  ): Transaction {
    return Transaction.create('NFTokenMint', props);
  }
}
