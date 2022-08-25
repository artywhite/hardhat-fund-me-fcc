import { FundMe } from "../../typechain-types"

const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

if (developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("FundMe Staging Tests", async function() {
        let deployer: string
        let fundMe: FundMe
        const sendValue = ethers.utils.parseEther("0.07")

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer
            fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async function() {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw()

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            console.log(
                endingFundMeBalance.toString() +
                    " should equal 0, running assert equal..."
            )
            assert.equal(endingFundMeBalance.toString(), "0")
        })
    })
}
