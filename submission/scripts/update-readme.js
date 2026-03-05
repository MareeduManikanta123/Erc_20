#!/usr/bin/env node
// Auto-update README.md with deployed contract addresses from deployment.json

const fs = require('fs');
const path = require('path');

const deploymentPath = path.join(__dirname, '..', 'deployment.json');
const readmePath = path.join(__dirname, '..', 'README.md');
const envPath = path.join(__dirname, '..', '.env');

console.log('\n=== README Auto-Updater ===\n');

// Check if deployment.json exists
if (!fs.existsSync(deploymentPath)) {
  console.error('❌ deployment.json not found!');
  console.error('Deploy contracts first: npm run deploy:sepolia');
  process.exit(1);
}

// Read deployment data
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
const { token, faucet, network } = deployment;

if (!token || !faucet) {
  console.error('❌ Invalid deployment.json - missing addresses');
  process.exit(1);
}

console.log('✓ Found deployment data:');
console.log(`  Network: ${network}`);
console.log(`  Token: ${token}`);
console.log(`  Faucet: ${faucet}`);

// Read README
let readme = fs.readFileSync(readmePath, 'utf8');

// Define network explorer base URL
const explorerBase = network === 'sepolia' 
  ? 'https://sepolia.etherscan.io/address'
  : 'https://etherscan.io/address';

// Replace placeholder addresses
const oldTokenLine = /- Token: `0x[Yy]our[A-Za-z]*Address`/;
const newTokenLine = `- Token: \`${token}\``;

const oldTokenEtherscan = /Etherscan: https:\/\/sepolia\.etherscan\.io\/address\/0x[Yy]our[A-Za-z]*Address/;
const newTokenEtherscan = `Etherscan: ${explorerBase}/${token}`;

const oldFaucetLine = /- Faucet: `0x[Yy]our[A-Za-z]*Address`/;
const newFaucetLine = `- Faucet: \`${faucet}\``;

const oldFaucetEtherscan = /Etherscan: https:\/\/sepolia\.etherscan\.io\/address\/0x[Yy]our[A-Za-z]*Address/;
const newFaucetEtherscan = `Etherscan: ${explorerBase}/${faucet}`;

// Apply replacements
readme = readme.replace(oldTokenLine, newTokenLine);
readme = readme.replace(oldTokenEtherscan, newTokenEtherscan);
readme = readme.replace(oldFaucetLine, newFaucetLine);
readme = readme.replace(oldFaucetEtherscan, newFaucetEtherscan);

// Update deployment section header
const deploymentSectionOld = /## Deployed Contracts \(Sepolia\)\nReplace with your final verified addresses after deployment\./;
const deploymentSectionNew = `## Deployed Contracts (${network.charAt(0).toUpperCase() + network.slice(1)})\nContracts deployed and verified on ${new Date().toLocaleDateString()}.`;
readme = readme.replace(deploymentSectionOld, deploymentSectionNew);

// Write updated README
fs.writeFileSync(readmePath, readme, 'utf8');
console.log('\n✓ Updated README.md with contract addresses');

// Update .env file with addresses for frontend
if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, 'utf8');
  
  const rpcUrl = network === 'sepolia' 
    ? process.env.SEPOLIA_RPC_URL || env.match(/SEPOLIA_RPC_URL=(.+)/)?.[1] || ''
    : '';
  
  // Update or add VITE addresses
  if (env.includes('VITE_TOKEN_ADDRESS=')) {
    env = env.replace(/VITE_TOKEN_ADDRESS=.*/, `VITE_TOKEN_ADDRESS=${token}`);
  } else {
    env += `\nVITE_TOKEN_ADDRESS=${token}`;
  }
  
  if (env.includes('VITE_FAUCET_ADDRESS=')) {
    env = env.replace(/VITE_FAUCET_ADDRESS=.*/, `VITE_FAUCET_ADDRESS=${faucet}`);
  } else {
    env += `\nVITE_FAUCET_ADDRESS=${faucet}`;
  }
  
  if (rpcUrl && env.includes('VITE_RPC_URL=')) {
    env = env.replace(/VITE_RPC_URL=.*/, `VITE_RPC_URL=${rpcUrl}`);
  }
  
  fs.writeFileSync(envPath, env, 'utf8');
  console.log('✓ Updated .env with contract addresses');
}

console.log('\n=== Next Steps ===');
console.log('1. Verify contracts on Etherscan:');
console.log(`   ${explorerBase}/${token}`);
console.log(`   ${explorerBase}/${faucet}`);
console.log('2. Create video demo (2-5 minutes)');
console.log('3. Update README with video link');
console.log('4. Run: ./scripts/preflight.ps1');
console.log('5. Push to GitHub\n');
