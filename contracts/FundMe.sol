// SPDX-License-Identifier: MIT

// Solidity code style (within file):
// 1. Pragma
pragma solidity ^0.8.0;

// 2. Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// 3. Interfaces, Libraries, Contracts
error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Arty
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Solidity code style (within contract):

    // Type Declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 5 * 1e18; // 1e18 = 1 * 10**18
    address private immutable i_owner; // prefix "i_" denotes immutable var (no gas, in memory(?))
    address[] private s_funders; // prefix "s_" denotes storage type var (read/writes to storage cost gas)
    mapping(address => uint256) private s_addressToAmountFunded;
    AggregatorV3Interface private s_priceFeed;

    // Events (we have none learned them yet :)

    // function Modifiers
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address priceFeed) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    // this fires for calls with empty payload; reacts to receiving ethers
    receive() external payable {
        fund();
    }

    // this fires for calls with unknown function in payload; also reacts to receiving ethers
    fallback() external payable {
        fund();
    }

    /// @notice Funds our contract based on the ETH/USD price
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You didn't send enough"
        );

        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    /// @notice withdraws funds to depoloyer and recets funders
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        payable(msg.sender).transfer(address(this).balance);
    }

    /// @notice same as above, but with some gas optimizations
    function cheaperWithdraw() public onlyOwner {
        // read entire storage var into memory once, instead of reading storage in every for loop iteration
        address[] memory funders = s_funders;

        // mappings can't be in memory, sorry!

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        payable(msg.sender).transfer(address(this).balance);
    }

    // belowe are private vars getters to make it clear for external devs
    // (they don't need to know internal agreements like "s_" prefixes)
    function getAddressToAmountFunded(address fundingAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
