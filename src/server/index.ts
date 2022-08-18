import { ThirdwebSDK } from "../sdk";
import { Network } from "../types";
import { getPayer } from "./local-config";
import { KeypairSigner } from "@metaplex-foundation/js";
import { Connection } from "@solana/web3.js";

export async function NodeThirdwebSDK(network: Network) {
  const payer = await getPayer();
  const signer: KeypairSigner = {
    publicKey: payer.publicKey,
    secretKey: payer.secretKey,
  };
  const sdk = new ThirdwebSDK(new Connection(network));
  sdk.wallet.connect(signer);
  return sdk;
}
