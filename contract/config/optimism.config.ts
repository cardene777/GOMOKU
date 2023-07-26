
import { ethers } from "ethers";
import {OptimismConfig} from "./configs";

export const config: OptimismConfig = {
  settings: {
    ChainId: 10,
    RpcEndpoint: "https://optimism-mainnet.infura.io/v3/",
    GovernanceEnabled: true,
    uxpTotalSupply: "0",
    governorParams: {
      votingDelay: 50,
      votingPeriod: 300,
      proposalThreshold: ethers.utils.parseEther("1").toString(),
      quorumFraction: 10,
    },
  },
  addresses: {
    Deployer: "0x96223b32A75a22de7c192A1b99366c7eD12c1649",
    TokenReceiver: "0x6d4B37f17Daad093D2Ed535050783e51fAAb5661",
    MultisigSafe: ethers.constants.AddressZero,
  },
  tokens: {
    LSToken: "0x4200000000000000000000000000000000000006",
  },
  contracts: {
    PerpClearingHouse: "0x82ac2CE43e33683c58BE4cDc40975E73aA50f459",
    PerpAccountBalance: "0xA7f3FC32043757039d5e13d790EE43edBcBa8b7c",
    PerpVault: "0xAD7b4C162707E0B2b5f6fdDbD3f8538A5fbA0d60",
    PerpMarketRegistry: "0xd5820eE0F55205f6cdE8BB0647072143b3060067",
    PerpVETHMarket: "0x8C835DFaA34e2AE61775e80EE29E2c724c6AE2BB",
    PerpDelegateApproval: "0xfd7bB5F6844a43c5469c972640Eddfa99597a547",
    UniSwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  },
  layerZero: {
    current: {
      chainId: "111",
      endpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    },
    ethereum: {
      chainId: "101",
      endpoint: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675",
    },
    optimism: {
      chainId: "111",
      endpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    },
    arbitrum: {
      chainId: "110",
      endpoint: "0x3c2269811836af69497E5F486A85D7316753cf62",
    },
    bsc: {
      chainId: "102",
      endpoint: "0x3c2269811836af69497e5f486a85d7316753cf62",
    },
  },
};
