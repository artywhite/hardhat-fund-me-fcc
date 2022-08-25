import { network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChains, networkConfig } from "../helper-hardhat-config"
import verify from "../utils/verify"

const HARDHAT_CHAIN_ID = 31337

export default async function deployFunc(hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress: string

    if (chainId === HARDHAT_CHAIN_ID) {
        const mockAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = mockAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed
    }

    log("--------------------")
    log("Deploying FundMe and waiting for confirmations", {
        ethUsdPriceFeedAddress,
        deployer
    })

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1
    })

    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

deployFunc.tags = ["all", "fundMe"]
