export function toUserFriendlyError(error) {
  if (!error) {
    return "Unknown error";
  }

  const message =
    error?.shortMessage ||
    error?.reason ||
    error?.data?.message ||
    error?.message ||
    "Unknown blockchain error";

  if (message.includes("user rejected") || message.includes("User denied")) {
    return "Wallet request was rejected by the user.";
  }

  if (message.includes("insufficient funds")) {
    return "Insufficient gas funds in wallet for transaction.";
  }

  if (message.includes("Cooldown period not elapsed")) {
    return "Cooldown period not elapsed. Please wait before claiming again.";
  }

  if (message.includes("Lifetime claim limit reached")) {
    return "Lifetime claim limit reached for this address.";
  }

  if (message.includes("Faucet is paused")) {
    return "Faucet is currently paused by admin.";
  }

  if (message.includes("Faucet has insufficient token balance")) {
    return "Faucet cannot mint more tokens due to max supply limit.";
  }

  return message;
}
