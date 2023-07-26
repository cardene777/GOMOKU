declare namespace NodeJS {
  interface ProcessEnv {
    readonly PRIVATE_KEY: string;
    readonly INFURA_KEY: string;
    readonly ETHERSCAN_API_KEY: string;
  }
}
