// import { getPayer } from "../utils/local-config";
import {
  Signer,
  KeypairSigner,
  Metaplex,
  isKeypairSigner,
  keypairIdentity,
  isIdentitySigner,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { Connection, Keypair } from "@solana/web3.js";
import invariant from "tiny-invariant";

export class UserWallet {
  public signer: Signer | undefined;
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async connect(wallet: Signer) {
    this.signer = wallet;
    // TODO event dispatcher
  }

  public connectToMetaplex(metaplex: Metaplex) {
    invariant(this.signer, "Wallet is not connected");
    const plugin = isKeypairSigner(this.signer)
      ? keypairIdentity(Keypair.fromSecretKey(this.signer.secretKey))
      : isIdentitySigner(this.signer)
      ? walletAdapterIdentity(this.signer)
      : undefined;
    invariant(plugin, "Wallet is not compatible with Metaplex");
    return metaplex.use(plugin);
  }
}
