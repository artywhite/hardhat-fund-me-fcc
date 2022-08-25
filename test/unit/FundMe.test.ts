import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { deployments, ethers, getNamedAccounts, network } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { FundMe, MockV3Aggregator } from "../../typechain-types"

if (!developmentChains.includes(network.name)) {
    describe.skip
} else {
    describe("FundMe", function() {
        const sendValue = ethers.utils.parseEther("1")
        let fundMeContract: FundMe
        let mockV3AggregatorContract: MockV3Aggregator
        let deployer: string

        beforeEach(async () => {
            const accounts = await getNamedAccounts()
            deployer = accounts.deployer

            await deployments.fixture(["all"])
            fundMeContract = await ethers.getContract("FundMe")
            mockV3AggregatorContract = await ethers.getContract(
                "MockV3Aggregator"
            )
        })

        describe("constructor", function() {
            it("sets the aggregator addresses correctly", async () => {
                const priceFeedContractAddress = await fundMeContract.getPriceFeed()
                expect(priceFeedContractAddress).to.equal(
                    mockV3AggregatorContract.address
                )
            })
        })

        describe("fund", function() {
            it("fails if you don't send enough ETH", async () => {
                await expect(fundMeContract.fund()).to.be.revertedWith(
                    "You didn't send enough"
                )
            })

            it("Updates the amount funded data structure", async () => {
                await fundMeContract.fund({
                    value: sendValue
                })
                const amount = await fundMeContract.getAddressToAmountFunded(
                    deployer
                )

                // sendValue is BigNumber, therefore we convert to string
                expect(amount.toString()).to.be.equal(sendValue.toString())
            })

            it("Adds funder to array of funders", async () => {
                await fundMeContract.fund({ value: sendValue })
                const firstFunder = await fundMeContract.getFunder(0)
                expect(firstFunder).to.be.equal(deployer)
            })
        })

        describe("withdraw", function() {
            beforeEach(async () => {
                await fundMeContract.fund({
                    value: sendValue
                })
            })

            it("withdraws ETH from a single funder", async () => {
                // Arrange
                const startingFundMeBalance = await fundMeContract.provider.getBalance(
                    fundMeContract.address
                )
                const startingDeployerBalance = await fundMeContract.provider.getBalance(
                    deployer
                )

                // Act
                const transactionResponse = await fundMeContract.withdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt

                // since values are BigNumber type, we have to use their own function for multiplication
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMeContract.provider.getBalance(
                    fundMeContract.address
                )
                const endingDeployerBalance = await fundMeContract.provider.getBalance(
                    deployer
                )

                // Assert
                // Maybe clean up to understand the testing
                expect(endingFundMeBalance).to.equal(0)

                expect(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .sub(gasCost)
                        .toString()
                ).to.equal(endingDeployerBalance.toString())
            })

            // this test is overloaded. Ideally we'd split it into multiple tests
            // but for simplicity we left it as one
            it("is allows us to withdraw with multiple funders", async () => {
                // Arrange
                const accounts = await ethers.getSigners()

                // we start from 1, because 0 is deployer
                for (let i = 1; i < 6; i++) {
                    // we connect each account to specify what's account is going to be
                    // used for next FuneMe contract transactions
                    const fundMeConnectedContract = await fundMeContract.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await fundMeContract.provider.getBalance(
                    fundMeContract.address
                )
                const startingDeployerBalance = await fundMeContract.provider.getBalance(
                    deployer
                )

                // Act
                const transactionResponse = await fundMeContract.cheaperWithdraw()
                // Let's comapre gas costs :)
                // const transactionResponse = await fundMeContract.withdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
                console.log(`GasCost: ${withdrawGasCost}`)
                console.log(`GasUsed: ${gasUsed}`)
                console.log(`GasPrice: ${effectiveGasPrice}`)
                const endingFundMeBalance = await fundMeContract.provider.getBalance(
                    fundMeContract.address
                )
                const endingDeployerBalance = await fundMeContract.provider.getBalance(
                    deployer
                )

                // Assert
                expect(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .sub(withdrawGasCost)
                        .toString()
                ).to.equal(endingDeployerBalance.toString())

                // Make a getter for storage variables
                await expect(fundMeContract.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    const amount = await fundMeContract.getAddressToAmountFunded(
                        accounts[i].address
                    )
                    expect(amount).to.be.equal(0)
                }
            })

            it("Only allows the owner to withdraw", async function() {
                const accounts = await ethers.getSigners()
                const fundMeConnectedContract = await fundMeContract.connect(
                    accounts[1]
                )
                await expect(fundMeConnectedContract.withdraw()).to.be.reverted
            })
        })
    })
}
