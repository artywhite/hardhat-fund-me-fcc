interface NetworkConfig {
    [network: string]: {
        ethUsdPriceFeed: string
        blockConfirmations: number
    }
}

export const networkConfig: NetworkConfig = {
    goerli: {
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        blockConfirmations: 6
    }
}

export const developmentChains = ["hardhat", "localhost"]
