// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IToken {
    function mint(address to, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function maxSupply() external view returns (uint256);
}

contract TokenFaucet is ReentrancyGuard {
    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18;
    uint256 public constant COOLDOWN_TIME = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 1_000 * 10 ** 18;

    IToken public immutable token;
    address public immutable admin;
    bool private paused;

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Faucet: token is zero address");
        token = IToken(tokenAddress);
        admin = msg.sender;
        paused = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Faucet: caller is not admin");
        _;
    }

    function requestTokens() external nonReentrant {
        require(!paused, "Faucet is paused");
        require(_isCooldownElapsed(msg.sender), "Cooldown period not elapsed");
        require(totalClaimed[msg.sender] < MAX_CLAIM_AMOUNT, "Lifetime claim limit reached");

        uint256 allowanceLeft = remainingAllowance(msg.sender);
        require(allowanceLeft >= FAUCET_AMOUNT, "Lifetime claim limit reached");
        require(token.totalSupply() + FAUCET_AMOUNT <= token.maxSupply(), "Faucet has insufficient token balance");

        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function canClaim(address user) public view returns (bool) {
        if (paused) {
            return false;
        }

        if (!_isCooldownElapsed(user)) {
            return false;
        }

        if (remainingAllowance(user) < FAUCET_AMOUNT) {
            return false;
        }

        if (token.totalSupply() + FAUCET_AMOUNT > token.maxSupply()) {
            return false;
        }

        return true;
    }

    function remainingAllowance(address user) public view returns (uint256) {
        uint256 claimed = totalClaimed[user];
        if (claimed >= MAX_CLAIM_AMOUNT) {
            return 0;
        }
        return MAX_CLAIM_AMOUNT - claimed;
    }

    function setPaused(bool _paused) external onlyAdmin {
        paused = _paused;
        emit FaucetPaused(_paused);
    }

    function isPaused() external view returns (bool) {
        return paused;
    }

    function _isCooldownElapsed(address user) internal view returns (bool) {
        uint256 lastClaim = lastClaimAt[user];
        return block.timestamp >= lastClaim + COOLDOWN_TIME;
    }
}
