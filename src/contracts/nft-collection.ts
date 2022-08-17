import { IStorage } from "../classes/storage/IStorage";
import { UserWallet } from "../classes/user-wallet";
import { NFTMetadataInput } from "../types/nft";
import {
  Metaplex,
  Nft,
  NftWithToken,
  verifyNftCollectionBuilder,
} from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";

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
    const uri = await this.storage.uploadMetadata(metadata);
    const { nft: mintedNFT } = await this.metaplex
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
    const builder = verifyNftCollectionBuilder(this.metaplex, {
      mintAddress: mintedNFT.mint.address,
      payer: this.metaplex.identity(),
      collectionAuthority: this.wallet.signer,
      collectionMintAddress: this.collectionMintAddress,
    });
    await builder.sendAndConfirm(this.metaplex);
    return mintedNFT;
  }
}
