import { BrowserProvider } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No EIP-1193 wallet found. Install MetaMask or compatible wallet.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("Wallet connected but no accounts were returned.");
  }

  return accounts[0];
}

export function registerWalletListeners(onAccountsChanged, onChainChanged) {
  if (!window.ethereum) {
    return () => {};
  }

  const handleAccountsChanged = (accounts) => {
    onAccountsChanged(accounts);
  };

  const handleChainChanged = (chainId) => {
    onChainChanged(chainId);
  };

  window.ethereum.on("accountsChanged", handleAccountsChanged);
  window.ethereum.on("chainChanged", handleChainChanged);

  return () => {
    if (!window.ethereum?.removeListener) {
      return;
    }
    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    window.ethereum.removeListener("chainChanged", handleChainChanged);
  };
}
