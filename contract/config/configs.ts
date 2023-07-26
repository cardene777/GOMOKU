export interface LzPair {
    endpoint: string
    chainId: string
}

export interface LzConfig {
    current: LzPair
    ethereum: LzPair
    optimism: LzPair
    arbitrum: LzPair
    bsc: LzPair,

}

export interface GovernorParams {
    votingDelay: number,
    votingPeriod: number,
    proposalThreshold: string,
    quorumFraction: number
}

export interface EthereumConfig {
  settings: {
    uxpTotalSupply: string;
    governorParams: GovernorParams;
  };
  addresses: {
    Deployer: string;
    TokenReceiver: string;
    MultisigSafe: string;
  };
  tokens: {
    LSToken: string;
  };
  layerZero: LzConfig;
}

export interface BinanceConfig {
  settings: {
    uxpTotalSupply: string;
    governorParams: GovernorParams;
  };
  addresses: {
    Deployer: string;
    TokenReceiver: string;
    MultisigSafe: string;
  };
  tokens: {
    LSToken: string;
  };
  layerZero: LzConfig;
}

export interface OptimismConfig {
    settings: {
        ChainId: number,
        RpcEndpoint: string,
        GovernanceEnabled: boolean
        uxpTotalSupply: string
        governorParams: GovernorParams
    },
    addresses: {
        Deployer: string,
        TokenReceiver: string,
        MultisigSafe: string,
    }
    tokens: {
        LSToken: string
    },
    contracts: {
        PerpClearingHouse: string,
        PerpAccountBalance: string,
        PerpVault: string,
        PerpMarketRegistry: string,
        PerpVETHMarket: string,
        PerpDelegateApproval: string,
        UniSwapRouter: string,
    },
    layerZero: LzConfig
}

export interface ArbitrumConfig {
  settings: {
    uxpTotalSupply: string;
    governorParams: GovernorParams;
  };
  addresses: {
    Deployer: string;
    TokenReceiver: string;
    MultisigSafe: string;
  };
  tokens: {
    LSToken: string;
  };
  contracts: {
    RageGmxSeniorVault: string;
  };
  layerZero: LzConfig;
}
