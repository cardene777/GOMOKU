import { ethers } from "hardhat";
import { ArbitrumConfig } from "./configs";

export const config: ArbitrumConfig = {
    settings: {
        uxpTotalSupply: "0",
        governorParams: {
            // 1 block ~= 2 seconds
            votingDelay: 450, // 450 seconds/15 minutes
            votingPeriod: 1800 * 2 * 2, // seconds * hours * days (1h = 1800), for 2 days use 1800 * 24 * 2 86400
            proposalThreshold: ethers.utils.parseEther("1").toString(),
            quorumFraction: 50
        }
    },
    contracts: {
        RageGmxSeniorVault: "0xf9305009FbA7E381b3337b5fA157936d73c2CF36"
    },
    addresses: {
        Deployer: "0x96223b32A75a22de7c192A1b99366c7eD12c1649",
        TokenReceiver: "0x6d4B37f17Daad093D2Ed535050783e51fAAb5661",
        MultisigSafe: ethers.constants.AddressZero
    },
    tokens: {
        USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
    },
    layerZero: {
        current: {
            chainId: "110",
            endpoint: "0x3c2269811836af69497E5F486A85D7316753cf62"
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
