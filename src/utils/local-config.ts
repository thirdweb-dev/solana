import { Keypair } from "@solana/web3.js";

// TODO only export this in node
// import fs from "fs";
// import os from "os";
// import path from "path";
// import yaml from "yaml";

/**
 * @internal
 */
async function getConfig(): Promise<any> {
  // Path to Solana CLI config file
  // const CONFIG_FILE_PATH = path.resolve(
  //   os.homedir(),
  //   ".config",
  //   "solana",
  //   "cli",
  //   "config.yml"
  // );
  // const configYml = fs.readFileSync(CONFIG_FILE_PATH, {
  //   encoding: "utf8",
  // });
  // return yaml.parse(configYml);
  return {};
}

/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
export async function getRpcUrl(): Promise<string> {
  try {
    const config = await getConfig();
    if (!config.json_rpc_url) {
      throw new Error("Missing RPC URL");
    }
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
      "Failed to read RPC url from CLI config file, falling back to localhost"
    );
    return "http://127.0.0.1:8899";
  }
}

/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
export async function getPayer(): Promise<Keypair> {
  try {
    const config = await getConfig();
    if (!config.keypair_path) {
      throw new Error("Missing keypair path");
    }
    return await createKeypairFromFile(config.keypair_path);
  } catch (err) {
    console.warn(
      "Failed to create keypair from CLI config file, falling back to new random keypair"
    );
    return Keypair.generate();
  }
}

/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
export async function createKeypairFromFile(
  filePath: string
): Promise<Keypair> {
  const secretKeyString = fs.readFileSync(filePath, { encoding: "utf8" });
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}
