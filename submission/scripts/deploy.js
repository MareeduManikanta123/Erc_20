const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`Token deployed: ${tokenAddress}`);

  const TokenFaucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await TokenFaucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log(`Faucet deployed: ${faucetAddress}`);

  const tx = await token.setMinter(faucetAddress);
  await tx.wait();
  console.log("Minter role granted to faucet");

  const deployment = {
    network: hre.network.name,
    deployer: deployer.address,
    token: tokenAddress,
    faucet: faucetAddress,
    deployedAt: new Date().toISOString()
  };

  const outputPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployment, null, 2));
  console.log(`Deployment saved to ${outputPath}`);

  if (process.env.VERIFY_ON_DEPLOY === "true") {
    console.log("Waiting for Etherscan indexing...");
    await new Promise((resolve) => setTimeout(resolve, 30_000));

    await hre.run("verify:verify", {
      address: tokenAddress,
      constructorArguments: []
    });

    await hre.run("verify:verify", {
      address: faucetAddress,
      constructorArguments: [tokenAddress]
    });

    console.log("Contracts verified on Etherscan");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
