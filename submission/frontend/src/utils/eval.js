import {
  connectWallet as walletConnect,
  registerWalletListeners
} from "./wallet";
import {
  requestTokens,
  getBalance,
  canClaim,
  getRemainingAllowance,
  getContractAddresses
} from "./contracts";
import { toUserFriendlyError } from "./errors";

export function exposeEvalInterface() {
  window.__EVAL__ = {
    connectWallet: async () => {
      try {
        const address = await walletConnect();
        if (!address) {
          throw new Error("Wallet connected but address is empty.");
        }
        return String(address);
      } catch (error) {
        throw new Error(`connectWallet failed: ${toUserFriendlyError(error)}`);
      }
    },

    requestTokens: async () => {
      try {
        const hash = await requestTokens();
        if (!hash) {
          throw new Error("Transaction hash was empty.");
        }
        return String(hash);
      } catch (error) {
        throw new Error(`requestTokens failed: ${toUserFriendlyError(error)}`);
      }
    },

    getBalance: async (address) => {
      try {
        const balance = await getBalance(address);
        return String(balance);
      } catch (error) {
        throw new Error(`getBalance failed: ${toUserFriendlyError(error)}`);
      }
    },

    canClaim: async (address) => {
      try {
        return Boolean(await canClaim(address));
      } catch (error) {
        throw new Error(`canClaim failed: ${toUserFriendlyError(error)}`);
      }
    },

    getRemainingAllowance: async (address) => {
      try {
        const remaining = await getRemainingAllowance(address);
        return String(remaining);
      } catch (error) {
        throw new Error(`getRemainingAllowance failed: ${toUserFriendlyError(error)}`);
      }
    },

    getContractAddresses: async () => {
      try {
        return getContractAddresses();
      } catch (error) {
        throw new Error(`getContractAddresses failed: ${toUserFriendlyError(error)}`);
      }
    }
  };

  return () => registerWalletListeners(() => {}, () => {});
}
