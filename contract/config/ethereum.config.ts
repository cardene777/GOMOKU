import { ethers } from "hardhat";
import {EthereumConfig} from "./configs";
export const config: EthereumConfig = {
    settings: {
        uxpTotalSupply: "7000000000",
        governorParams: {
            votingDelay: 50,
            votingPeriod: 600,
            proposalThreshold: ethers.utils.parseEther("1").toString(),
            quorumFraction: 50
        }
    },
    addresses: {
        Deployer: "0x96223b32A75a22de7c192A1b99366c7eD12c1649",
        TokenReceiver: "0x96223b32A75a22de7c192A1b99366c7eD12c1649",
        MultisigSafe: "0x86A07dDED024121b282362f4e7A249b00F5dAB37"
    },
    tokens: {
        WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    },
    layerZero: {
        current: {
            chainId: "101",
            endpoint: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675"
        },
        ethereum: {
            chainId: "101",
            endpoint: "0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675"
        },
        optimism: {
            chainId: "111",
            endpoint: "0x3c2269811836af69497E5F486A85D7316753cf62"
        },
        arbitrum: {
            chainId: "110",
            endpoint: "0x3c2269811836af69497E5F486A85D7316753cf62"
        }
    }
}