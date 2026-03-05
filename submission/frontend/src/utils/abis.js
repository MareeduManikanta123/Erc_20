export const tokenAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function maxSupply() view returns (uint256)"
];

export const faucetAbi = [
  "function requestTokens()",
  "function canClaim(address user) view returns (bool)",
  "function remainingAllowance(address user) view returns (uint256)",
  "function isPaused() view returns (bool)",
  "function lastClaimAt(address user) view returns (uint256)",
  "function totalClaimed(address user) view returns (uint256)",
  "function COOLDOWN_TIME() view returns (uint256)",
  "function FAUCET_AMOUNT() view returns (uint256)",
  "event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp)"
];
