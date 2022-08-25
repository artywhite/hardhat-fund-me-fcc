import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "dotenv/config"
import "hardhat-deploy"
import "hardhat-gas-reporter"
import "solidity-coverage"
import { HardhatUserConfig } from "hardhat/config"

const GOERLI_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

if (!GOERLI_URL) {
    throw new Error("process.env.GOERLI_RPC_URL is not set!")
}
if (!PRIVATE_KEY) {
    throw new Error("process.env.PRIVATE_KEY is not set!")
}
if (!ETHERSCAN_API_KEY) {
    throw new Error("process.env.ETHERSCAN_API_KEY is not set!")
}
if (!COINMARKETCAP_API_KEY) {
    throw new Error("process.env.COINMARKETCAP_API_KEY is not set!")
}

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            accounts: [PRIVATE_KEY],
            url: GOERLI_URL,
            chainId: 5
        },
        hardhat: {
            chainId: 31337
        }
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    solidity: {
        compilers: [{ version: "0.8.9" }, { version: "0.6.6" }]
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0
        }
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY
    }
}

export default config
