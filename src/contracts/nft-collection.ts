import { IStorage } from "../classes/storage/IStorage";
import { UserWallet } from "../classes/user-wallet";
import { METAPLEX_PROGRAM_ID } from "../constants/addresses";
import { NFTMetadataInput } from "../types/nft";
import {
  Metaplex,
  Nft,
  NftWithToken,
  verifyNftCollectionBuilder,
} from "@metaplex-foundation/js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { ConfirmedSignatureInfo, Connection, PublicKey } from "@solana/web3.js";

export class NFTCollection {
  private connection: Connection;
  private wallet: UserWallet;
  private metaplex: Metaplex;
  private storage: IStorage;
  collectionMintAddress: PublicKey;

  constructor(
    collectionMintAddress: string,
    connection: Connection,
    wallet: UserWallet,
    storage: IStorage
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.storage = storage;
    this.metaplex = Metaplex.make(this.connection);
    this.collectionMintAddress = new PublicKey(collectionMintAddress);
  }

  async getCollectionInfo(): Promise<Nft> {
    const coll = await this.metaplex
      .nfts()
      .findByMint({ mintAddress: this.collectionMintAddress })
      .run();
    return coll as Nft; // TODO abstract types away
  }

  async mint(metadata: NFTMetadataInput): Promise<NftWithToken> {
    const metaplex = this.wallet.connectToMetaplex(this.metaplex);
    const uri = await this.storage.uploadMetadata(metadata);
    const { nft: mintedNFT } = await metaplex
      .nfts()
      .create({
        name: metadata.name || "",
        uri,
        sellerFeeBasisPoints: 0,
        collection: this.collectionMintAddress,
      })
      .run();
    console.log("Minted NFT Address", mintedNFT.mint.address.toBase58());

    // link the NFT with the collection
    // TODO do it in a single transaction
    const builder = verifyNftCollectionBuilder(metaplex, {
      mintAddress: mintedNFT.mint.address,
      payer: this.wallet.signer,
      collectionAuthority: this.wallet.signer,
      collectionMintAddress: this.collectionMintAddress,
    });
    await builder.sendAndConfirm(metaplex);
    return mintedNFT;
  }

  async getAll(): Promise<string[]> {
    const allSignatures: ConfirmedSignatureInfo[] = [];
    // This returns the first 1000, so we need to loop through until we run out of signatures to get.
    let signatures = await this.connection.getSignaturesForAddress(
      this.collectionMintAddress
    );
    allSignatures.push(...signatures);
    do {
      const options = {
        before: signatures[signatures.length - 1].signature,
      };
      signatures = await this.connection.getSignaturesForAddress(
        this.collectionMintAddress,
        options
      );
      allSignatures.push(...signatures);
    } while (signatures.length > 0);

    const metadataAddresses: PublicKey[] = [];
    const mintAddresses = new Set<string>();
    const promises = allSignatures.map((s) =>
      this.connection.getTransaction(s.signature)
    );
    const transactions = await Promise.all(promises);
    for (const tx of transactions) {
      if (tx) {
        const programIds = tx.transaction.message
          .programIds()
          .map((p) => p.toString());
        const accountKeys = tx.transaction.message.accountKeys.map((p) =>
          p.toString()
        );
        // Only look in transactions that call the Metaplex token metadata program
        if (programIds.includes(METAPLEX_PROGRAM_ID)) {
          // Go through all instructions in a given transaction
          for (const ix of tx.transaction.message.instructions) {
            // Filter for setAndVerify or verify instructions in the Metaplex token metadata program
            if (
              (ix.data === "K" || ix.data === "S" || ix.data === "X") &&
              accountKeys[ix.programIdIndex] === METAPLEX_PROGRAM_ID
            ) {
              const metadataAddressIndex = ix.accounts[0];
              const metadata_address =
                tx.transaction.message.accountKeys[metadataAddressIndex];
              metadataAddresses.push(metadata_address);
            }
          }
        }
      }
    }

    const metadataAccounts = await Promise.all(
      metadataAddresses.map((a) => this.connection.getAccountInfo(a))
    );
    for (const account of metadataAccounts) {
      if (account) {
        const [metadata] = Metadata.deserialize(account.data);
        mintAddresses.add(metadata.mint.toBase58());
      }
    }
    const mints: string[] = Array.from(mintAddresses);
    return mints;
  }
}
