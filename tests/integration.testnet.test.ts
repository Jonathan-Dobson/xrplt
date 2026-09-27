import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  Client,
  Wallet,
  NFTokenMintFlags,
  AccountSetAsfFlags,
  multisign,
  MPTokenIssuanceCreateFlags,
} from "xrpl";
import {
  Payment,
  AccountSet,
  SignerListSet,
  NFTokenMint,
  NFTokenCreateOffer,
  NFTokenAcceptOffer,
  OfferCreate,
  OfferCancel,
  MPTokenIssuanceCreate,
  MPTokenAuthorize,
} from "../src/index.js";

describe("xrplt Integration: Live Regression", () => {
  let client: Client;
  let alice: Wallet;
  let bob: Wallet;
  let charlie: Wallet;
  let dave: Wallet;

  beforeAll(async () => {
    client = new Client("wss://s.devnet.rippletest.net:51233");
    await client.connect();

    const res = await Promise.all([
      client.fundWallet(),
      client.fundWallet(),
      client.fundWallet(),
      client.fundWallet(),
    ]);
    alice = res[0].wallet;
    bob = res[1].wallet;
    charlie = res[2].wallet;
    dave = res[3].wallet;

    console.log("Alice: ", alice.address);
    console.log("Bob: ", bob.address);
    console.log("Charlie: ", charlie.address);
    console.log("Dave: ", dave.address);

    await new Promise(r => setTimeout(r, 2000));
  }, 180000);

  afterAll(async () => {
    await client.disconnect();
  });

  async function submit(wallet: Wallet, tx: any, signersCount?: number): Promise<any> {
    const json = tx.toJSON();
    const ledger = await client.getLedgerIndex();
    json.LastLedgerSequence = ledger + 100;

    const prepared = await client.autofill(json as any, signersCount);
    const res = await client.submitAndWait(prepared, { wallet });

    const meta = (res.result as any).meta;
    const result = meta?.TransactionResult || (res.result as any).TransactionResult || (res.result as any).engine_result;

    if (result !== "tesSUCCESS") {
      throw new Error(`Transaction failed: ${result}`);
    }
    return res;
  }

  describe("1. Multi-Purpose Token (MPT) Lifecycle", () => {
    let mptIssuanceID: string;

    it("creates an MPT issuance and authorizes a holder", async () => {
      const createTx = new MPTokenIssuanceCreate({
        Account: dave.address,
        Flags: MPTokenIssuanceCreateFlags.tfMPTCanClawback,
      });
      const createRes = await submit(dave, createTx);
      const meta = (createRes.result as any).meta;

      // The MPTokenIssuanceID is 192-bit (48 hex chars) and is in the metadata
      mptIssuanceID = meta.mpt_issuance_id || (createRes.result as any).mpt_issuance_id;

      if (!mptIssuanceID) {
        // Fallback: Find it in the CreatedNode NewFields
        const node = meta.AffectedNodes.find(
          (n: any) => n.CreatedNode?.LedgerEntryType === "MPTokenIssuance"
        );
        mptIssuanceID = node?.CreatedNode?.NewFields?.MPTokenIssuanceID;
      }

      expect(mptIssuanceID).toBeDefined();
      expect(mptIssuanceID.length).toBe(48);

      const authTx = new MPTokenAuthorize({
        Account: alice.address,
        MPTokenIssuanceID: mptIssuanceID,
      });
      await submit(alice, authTx);
    });
  });

  describe("2. NFT Operations", () => {
    let nftokenID: string;

    it("mints an NFT and completes a sale", async () => {
      const mintTx = new NFTokenMint({
        Account: dave.address,
        NFTokenTaxon: 123,
      });
      const mintRes = await submit(dave, mintTx);
      const meta = (mintRes.result as any).meta;

      nftokenID = meta.nftoken_id || (mintRes.result as any).nftoken_id;

      const offerTx = new NFTokenCreateOffer({
        Account: dave.address,
        NFTokenID: nftokenID,
        Amount: "1000000",
        Flags: { tfSellNFToken: true },
      });
      const offerRes = await submit(dave, offerTx);
      const offerMeta = (offerRes.result as any).meta;
      const offerID = offerMeta.AffectedNodes.find(
        (n: any) => n.CreatedNode?.LedgerEntryType === "NFTokenOffer"
      ).CreatedNode.LedgerIndex;

      const acceptTx = new NFTokenAcceptOffer({
        Account: alice.address,
        NFTokenSellOffer: offerID,
      });
      await submit(alice, acceptTx);
    });
  });

  describe("3. DEX & Multi-Signature", () => {
    it("manages offers and performs a multi-signature payment", async () => {
      const createTx = new OfferCreate({
        Account: dave.address,
        TakerGets: "1000000",
        TakerPays: { currency: "USD", issuer: alice.address, value: "10" },
      });
      const createRes = await submit(dave, createTx);
      const seq = (createRes.result as any).Sequence || (createRes.result as any).tx_json.Sequence;

      const cancelTx = new OfferCancel({
        Account: dave.address,
        OfferSequence: seq,
      });
      await submit(dave, cancelTx);

      const listTx = new SignerListSet({
        Account: alice.address,
        SignerQuorum: 2,
        SignerEntries: [
          { SignerEntry: { Account: bob.address, SignerWeight: 1 } },
          { SignerEntry: { Account: charlie.address, SignerWeight: 1 } },
        ],
      });
      await submit(alice, listTx);

      const disableTx = new AccountSet({
        Account: alice.address,
        SetFlag: AccountSetAsfFlags.asfDisableMaster,
      });
      await submit(alice, disableTx);

      const payTx = new Payment({
        Account: alice.address,
        Destination: dave.address,
        Amount: "1000",
      });

      const json = payTx.toJSON();
      const ledger = await client.getLedgerIndex();
      json.LastLedgerSequence = ledger + 100;

      const prepared = await client.autofill(json as any, 2);
      const sig1 = bob.sign(prepared, true);
      const sig2 = charlie.sign(prepared, true);
      const combined = multisign([sig1.tx_blob, sig2.tx_blob]);

      const multiRes = await client.submitAndWait(combined);
      expect((multiRes.result as any).meta?.TransactionResult).toBe("tesSUCCESS");
    }, 120000);
  });
});
