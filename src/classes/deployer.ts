import { NFTCollectionMetadataInput } from "../types/contracts";
import { IStorage } from "./storage/IStorage";
import { UserWallet } from "./user-wallet";
import {
  createNftBuilder,
  Metaplex,
  verifyNftCollectionBuilder,
} from "@metaplex-foundation/js";
import {
  createVerifyCollectionInstruction,
  verifyCollectionInstructionDiscriminator,
} from "@metaplex-foundation/mpl-token-metadata";
import { Connection } from "@solana/web3.js";
import invariant from "tiny-invariant";

export class Deployer {
  private connection: Connection;
  private wallet: UserWallet;
  private metaplex: Metaplex;
  private storage: IStorage;

  constructor(connection: Connection, wallet: UserWallet, storage: IStorage) {
    this.connection = connection;
    this.wallet = wallet;
    this.storage = storage;
    this.metaplex = Metaplex.make(this.connection);
  }

  async createNftCollection(
    collectionMetadata: NFTCollectionMetadataInput
  ): Promise<string> {
    invariant(this.wallet.signer, "Wallet is not connected");
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
    // TODO verify collection transaction
    // createVerifyCollectionInstruction({
    //   collectionAuthority: this.wallet.signer?.publicKey,
    //   collection: collResult.nft.mint.address,
    //   collectionMasterEditionAccount: collResult.masterEditionAddress,
    //   collectionMint: collResult.mintAddress,
    //   payer: this.wallet.signer?.publicKey,
    // });
    // verifyNftCollectionBuilder(metaplex, {
    //   collectionMintAddress: collResult.mint.address,
    // });
    return collResult.mintAddress.toBase58();
  }
}
