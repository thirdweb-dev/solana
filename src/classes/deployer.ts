import { NFTCollectionMetadataInput } from "../types/contracts";
import { IStorage } from "./storage/IStorage";
import { UserWallet } from "./user-wallet";
import { createNftBuilder, Metaplex } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";

export class Deployer {
  private connection: Connection;
  private wallet: UserWallet;
  private metaplex: Metaplex;
  private storage: IStorage;

  constructor(connection: Connection, wallet: UserWallet, storage: IStorage) {
    this.connection = connection;
    this.wallet = wallet;
    this.storage = storage;
    console.log("rpcEndpoint", this.connection);
    this.metaplex = Metaplex.make(this.connection);
  }

  async createNftCollection(
    collectionMetadata: NFTCollectionMetadataInput
  ): Promise<string> {
    const metaplex = this.wallet.connectToMetaplex(this.metaplex);
    const uri = await this.storage.uploadMetadata(collectionMetadata);
    const createCollectionInstruction = await createNftBuilder(metaplex, {
      name: collectionMetadata.name,
      sellerFeeBasisPoints: 0,
      uri,
      isCollection: true,
    });
    const collResult = await createCollectionInstruction.sendAndConfirm(
      metaplex
    );
    return collResult.mintAddress.toBase58();
  }
}
