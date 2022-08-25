import { network } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const HARDHAT_CHAIN_ID = 31337

const DECIMALS = "18"
const INITIAL_PRICE = "2000000000000000000000" // 2000

export default async function deployFunc(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments

    const chainId = network.config.chainId

    if (chainId === HARDHAT_CHAIN_ID) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })
        log("Mocks deployed")
    }
}

deployFunc.tags = ["all", "mocks"]
