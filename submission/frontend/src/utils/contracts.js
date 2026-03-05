import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import { tokenAbi, faucetAbi } from "./abis";

const runtimeConfig = window.__APP_CONFIG__ || {};
const tokenAddress = runtimeConfig.VITE_TOKEN_ADDRESS || import.meta.env.VITE_TOKEN_ADDRESS;
const faucetAddress = runtimeConfig.VITE_FAUCET_ADDRESS || import.meta.env.VITE_FAUCET_ADDRESS;
const rpcUrl = runtimeConfig.VITE_RPC_URL || import.meta.env.VITE_RPC_URL;

function ensureAddresses() {
  if (!tokenAddress || !faucetAddress) {
    throw new Error("Contract addresses are not configured. Set VITE_TOKEN_ADDRESS and VITE_FAUCET_ADDRESS.");
  }
}

export function getContractAddresses() {
  ensureAddresses();
  return { token: tokenAddress, faucet: faucetAddress };
}

export function getReadProvider() {
  if (!rpcUrl) {
    throw new Error("VITE_RPC_URL is not configured.");
  }
  return new JsonRpcProvider(rpcUrl);
}

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("No EIP-1193 wallet found.");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  return provider.getSigner();
}

export function getTokenContract(providerOrSigner) {
  ensureAddresses();
  return new Contract(tokenAddress, tokenAbi, providerOrSigner);
}

export function getFaucetContract(providerOrSigner) {
  ensureAddresses();
  return new Contract(faucetAddress, faucetAbi, providerOrSigner);
}

export async function getBalance(address) {
  if (!address) {
    throw new Error("Address is required.");
  }
  const provider = getReadProvider();
  const token = getTokenContract(provider);
  const balance = await token.balanceOf(address);
  return balance.toString();
}

export async function canClaim(address) {
  if (!address) {
    throw new Error("Address is required.");
  }
  const provider = getReadProvider();
  const faucet = getFaucetContract(provider);
  return await faucet.canClaim(address);
}

export async function getRemainingAllowance(address) {
  if (!address) {
    throw new Error("Address is required.");
  }
  const provider = getReadProvider();
  const faucet = getFaucetContract(provider);
  const allowance = await faucet.remainingAllowance(address);
  return allowance.toString();
}

export async function getCooldownStatus(address) {
  const provider = getReadProvider();
  const faucet = getFaucetContract(provider);

  const [lastClaimAt, cooldownTime] = await Promise.all([
    faucet.lastClaimAt(address),
    faucet.COOLDOWN_TIME()
  ]);

  const last = Number(lastClaimAt);
  const cooldown = Number(cooldownTime);
  const now = Math.floor(Date.now() / 1000);

  if (last === 0) {
    return { ready: true, secondsRemaining: 0 };
  }

  const availableAt = last + cooldown;
  const secondsRemaining = availableAt - now;

  if (secondsRemaining <= 0) {
    return { ready: true, secondsRemaining: 0 };
  }

  return { ready: false, secondsRemaining };
}

export async function requestTokens() {
  const signer = await getSigner();
  const faucet = getFaucetContract(signer);
  const tx = await faucet.requestTokens();
  const receipt = await tx.wait();

  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction failed during confirmation.");
  }

  return tx.hash;
}

export async function onTokensClaimedForUser(userAddress, callback) {
  const provider = await getBrowserProvider();
  const faucet = getFaucetContract(provider);

  const listener = (eventUser, amount, timestamp) => {
    if (eventUser.toLowerCase() === userAddress.toLowerCase()) {
      callback({ user: eventUser, amount: amount.toString(), timestamp: timestamp.toString() });
    }
  };

  faucet.on("TokensClaimed", listener);

  return () => {
    faucet.off("TokensClaimed", listener);
  };
}
