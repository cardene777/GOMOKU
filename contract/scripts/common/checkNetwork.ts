import { HardhatRuntimeEnvironment } from "hardhat/types";

export enum NetworkName {
    ArbitrumGoerli = "arbitrumgoerli",
    ArbitrumOne = "arbitrumone",
    OptimismGoerli = "optimismgoerli",
    Optimism = "optimism",
    Goerli = "goerli",
    Ethereum = "ethereum",
    Bsc = "bsc",
    BscTestnet = "bsctestnet",
}

export function checkNetwork(hre: HardhatRuntimeEnvironment, validNetworkNames: string[]) {
    if (!validNetworkNames.includes(hre.network.name)) {
      throw new Error("Wrong network: " + hre.network.name);
    }
}
