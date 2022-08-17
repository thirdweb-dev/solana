import { getPayer } from "../utils/local-config";
import { KeypairSigner } from "@metaplex-foundation/js";
import { Connection, Signer } from "@solana/web3.js";

export class UserWallet {
  public signer: Signer | undefined;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async connectFromLocalConfig() {
    const payer = await getPayer();
    const signer: KeypairSigner = {
      publicKey: payer.publicKey,
      secretKey: payer.secretKey,
    };
    this.signer = signer;
  }

  public async connect(wallet: Signer) {
    this.signer = wallet;
  }
}
