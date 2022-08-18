import { Deployer } from "./classes/deployer";
import { IStorage } from "./classes/storage/IStorage";
import { IpfsStorage } from "./classes/storage/ipfs-storage";
import { UserWallet } from "./classes/user-wallet";
import { NFTCollection } from "./contracts/nft-collection";
import { Network } from "./types";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export class ThirdwebSDK {
  static fromNetwork(network: Network): ThirdwebSDK {
    const sdk = new ThirdwebSDK(new Connection(clusterApiUrl(network)));
    return sdk;
  }

  private connection: Connection;
  private storage: IStorage;

  public deployer: Deployer;
  public wallet: UserWallet;

  constructor(connection: Connection, storage: IStorage = new IpfsStorage()) {
    this.connection = connection;
    this.storage = storage;
    this.wallet = new UserWallet(this.connection);
    this.deployer = new Deployer(this.connection, this.wallet, this.storage);
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
