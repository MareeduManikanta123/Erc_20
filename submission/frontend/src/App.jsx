import { useEffect, useMemo, useState } from "react";
import { formatUnits } from "ethers";
import { connectWallet, registerWalletListeners } from "./utils/wallet";
import {
  canClaim,
  getBalance,
  getCooldownStatus,
  getRemainingAllowance,
  onTokensClaimedForUser,
  requestTokens
} from "./utils/contracts";
import { toUserFriendlyError } from "./utils/errors";
import { exposeEvalInterface } from "./utils/eval";

function formatSeconds(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export default function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [eligible, setEligible] = useState(false);
  const [remainingAllowance, setRemainingAllowance] = useState("0");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const connected = Boolean(address);

  const refreshWalletState = async (account) => {
    const [bal, claimable, remaining, cooldown] = await Promise.all([
      getBalance(account),
      canClaim(account),
      getRemainingAllowance(account),
      getCooldownStatus(account)
    ]);

    setBalance(bal);
    setEligible(claimable);
    setRemainingAllowance(remaining);
    setCooldownSeconds(cooldown.secondsRemaining);
  };

  const handleConnect = async () => {
    setMessage({ type: "", text: "" });
    try {
      const account = await connectWallet();
      setAddress(account);
      await refreshWalletState(account);
    } catch (error) {
      setMessage({ type: "error", text: toUserFriendlyError(error) });
    }
  };

  const handleDisconnect = () => {
    setAddress("");
    setBalance("0");
    setEligible(false);
    setRemainingAllowance("0");
    setCooldownSeconds(0);
    setMessage({ type: "", text: "" });
  };

  const handleClaim = async () => {
    if (!connected) {
      setMessage({ type: "error", text: "Connect wallet first." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const txHash = await requestTokens();
      await refreshWalletState(address);
      setMessage({ type: "success", text: `Claim successful. Tx: ${txHash}` });
    } catch (error) {
      setMessage({ type: "error", text: toUserFriendlyError(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    exposeEvalInterface();
  }, []);

  useEffect(() => {
    const cleanup = registerWalletListeners(
      async (accounts) => {
        const next = accounts?.[0] || "";
        setAddress(next);
        if (next) {
          await refreshWalletState(next);
        } else {
          handleDisconnect();
        }
      },
      () => {
        window.location.reload();
      }
    );

    return cleanup;
  }, []);

  useEffect(() => {
    if (!connected) {
      return;
    }

    let unwatch;
    onTokensClaimedForUser(address, async () => {
      await refreshWalletState(address);
    }).then((cleanup) => {
      unwatch = cleanup;
    });

    return () => {
      if (unwatch) {
        unwatch();
      }
    };
  }, [connected, address]);

  useEffect(() => {
    if (!connected) {
      return;
    }

    const timer = setInterval(async () => {
      try {
        const cooldown = await getCooldownStatus(address);
        setCooldownSeconds(cooldown.secondsRemaining);
      } catch {}
    }, 1000);

    return () => clearInterval(timer);
  }, [connected, address]);

  const claimDisabled = useMemo(() => {
    return !connected || !eligible || loading || cooldownSeconds > 0;
  }, [connected, eligible, loading, cooldownSeconds]);

  return (
    <div className="app">
      <h1>Token Faucet DApp</h1>

      <div className="card">
        <div className="row">
          <strong>Wallet Status</strong>
          <span>{connected ? "Connected" : "Disconnected"}</span>
        </div>
        {connected && (
          <div className="row">
            <strong>Address</strong>
            <span className="mono">{address}</span>
          </div>
        )}
        <div className="row">
          {!connected ? (
            <button onClick={handleConnect}>Connect Wallet</button>
          ) : (
            <button className="secondary" onClick={handleDisconnect}>Disconnect</button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="row">
          <strong>Token Balance (base units)</strong>
          <span className="mono">{balance}</span>
        </div>
        <div className="row">
          <strong>Token Balance (human)</strong>
          <span>{formatUnits(balance, 18)}</span>
        </div>
        <div className="row">
          <strong>Can Claim</strong>
          <span>{eligible ? "Yes" : "No"}</span>
        </div>
        <div className="row">
          <strong>Remaining Allowance (base units)</strong>
          <span className="mono">{remainingAllowance}</span>
        </div>
        <div className="row">
          <strong>Cooldown</strong>
          <span>{cooldownSeconds > 0 ? formatSeconds(cooldownSeconds) : "Ready to claim"}</span>
        </div>
        <div className="row">
          <button disabled={claimDisabled} onClick={handleClaim}>
            {loading ? "Processing..." : "Request Tokens"}
          </button>
        </div>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
    </div>
  );
}
