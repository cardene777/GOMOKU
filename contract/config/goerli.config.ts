import { ethers } from "hardhat";
import {EthereumConfig} from "./configs";
export const config: EthereumConfig = {
  settings: {
    uxpTotalSupply: "7000000000",
    governorParams: {
      votingDelay: 50,
      votingPeriod: 300,
      proposalThreshold: ethers.utils.parseEther("1").toString(),
      quorumFraction: 10,
    },
  },
  addresses: {
    Deployer: "0x3382Bb7214c109f12Ffe8aA9C39BAf7eDB991427",
    TokenReceiver: "0x3382Bb7214c109f12Ffe8aA9C39BAf7eDB991427",
    MultisigSafe: "0x7c9C8eDd907A9eF621e4B2A2B75e6ff2c23551A1",
  },
  tokens: {
    LSToken: "0x5FfbaC75EFc9547FBc822166feD19B05Cd5890bb",
  },
  layerZero: {
    current: {
      chainId: "10121",
      endpoint: "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23",
    },
    ethereum: {
      chainId: "10121",
      endpoint: "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23",
    },
    optimism: {
      chainId: "10132",
      endpoint: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
    },
    arbitrum: {
      chainId: "10143",
      endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
    },
    bsc: {
      chainId: "102",
      endpoint: "0x3c2269811836af69497e5f486a85d7316753cf62",
    },
  },
};
