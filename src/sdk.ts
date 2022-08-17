import { IStorage } from "./classes/storage/IStorage";
import { IpfsStorage } from "./classes/storage/ipfs-storage";
import { UserWallet } from "./classes/user-wallet";
import { NFTCollection } from "./contracts/nft-collection";
import { Network } from "./types";
import { Connection } from "@solana/web3.js";

export class ThirdwebSDK {
  static fromLocalConfig(network: Network): ThirdwebSDK {
    const sdk = new ThirdwebSDK(new Connection(network));
    sdk.wallet.connectFromLocalConfig();
    return sdk;
  }

  private connection: Connection;
  private wallet: UserWallet;
  private storage: IStorage;

  constructor(connection: Connection, storage: IStorage = new IpfsStorage()) {
    this.connection = connection;
    this.wallet = new UserWallet(this.connection);
    this.storage = storage;
  }

  public async getNFTCollection(address: string): Promise<NFTCollection> {
    return new NFTCollection(
      address,
      this.connection,
      this.wallet,
      this.storage
    );
  }
}
