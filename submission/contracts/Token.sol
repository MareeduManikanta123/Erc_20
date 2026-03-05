// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;
    address public minter;

    constructor() ERC20("Faucet Token", "FCT") Ownable(msg.sender) {}

    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "Token: minter is zero address");
        minter = newMinter;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Token: caller is not minter");
        require(to != address(0), "Token: recipient is zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Token: max supply exceeded");
        _mint(to, amount);
    }

    function maxSupply() external pure returns (uint256) {
        return MAX_SUPPLY;
    }
}
