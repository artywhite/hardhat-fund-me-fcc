import { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const { deployer } = await getNamedAccounts()
    console.log(deployer)

    const balance = await ethers.provider.getBalance(deployer)
    console.log("Deployer current balance", balance.toString())
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
