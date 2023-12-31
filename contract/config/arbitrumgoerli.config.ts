import { ethers } from "hardhat";
import { ArbitrumConfig } from "./configs";

export const config: ArbitrumConfig = {
  settings: {
    uxpTotalSupply: "0",
    governorParams: {
      votingDelay: 25, // 5 minutes
      votingPeriod: 100, // 20 minutes
      proposalThreshold: ethers.utils.parseEther("1").toString(),
      quorumFraction: 10,
    },
  },
  contracts: {
    RageGmxSeniorVault: "0x8E6E5759Da804E63aCbed35fBbF9d9f9b8eeD8f8",
  },
  addresses: {
    Deployer: "0x3382Bb7214c109f12Ffe8aA9C39BAf7eDB991427",
    TokenReceiver: "0x85e34812c32482394F123486c29eF3537A6d2401",
    MultisigSafe: ethers.constants.AddressZero,
  },
  tokens: {
    LSToken: "0x6775842AE82BF2F0f987b10526768Ad89d79536E",
  },
  layerZero: {
    current: {
      chainId: "10143",
      endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
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
