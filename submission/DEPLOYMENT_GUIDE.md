# 🚀 Complete Deployment Guide

## Step 1: Get Prerequisites (15-20 minutes)

### 1.1 Get Sepolia Testnet ETH (FREE)
1. Visit: https://sepoliafaucet.com/
2. Connect your MetaMask wallet
3. Switch to Sepolia network in MetaMask
4. Request 0.5 Sepolia ETH
   - Alternative faucets if needed:
     - https://www.infura.io/faucet/sepolia
     - https://faucet.quicknode.com/ethereum/sepolia

### 1.2 Get Infura RPC URL (FREE)
1. Go to: https://app.infura.io/
2. Sign up / Log in
3. Click "Create New API Key"
4. Select "Web3 API"
5. Name it: "Token Faucet DApp"
6. Copy your API Key
7. Your RPC URL will be:
   ```
   https://sepolia.infura.io/v3/YOUR_API_KEY_HERE
   ```

### 1.3 Export Your Private Key from MetaMask
⚠️ **SECURITY WARNING**: Never share this key or commit it to GitHub!

1. Open MetaMask
2. Click the 3 dots menu (top right)
3. Select "Account details"
4. Click "Export Private Key"
5. Enter your MetaMask password
6. Copy the private key (starts with 0x)

### 1.4 Get Etherscan API Key (FREE)
1. Go to: https://etherscan.io/apis
2. Sign up / Log in
3. Click "+ Add" to create new API key
4. Name it: "Token Faucet Verification"
5. Copy your API key

---

## Step 2: Configure .env File (5 minutes)

1. Open `submission/.env` in a text editor
2. Replace ALL placeholder values with your real values:

```bash
# Example .env (use YOUR actual values)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123yourkey
PRIVATE_KEY=0x1234567890abcdefyourprivatekeyhere
ETHERSCAN_API_KEY=YOURAPIKEY123ABC
VERIFY_ON_DEPLOY=true

# Frontend (same RPC, addresses filled after deployment)
VITE_RPC_URL=https://sepolia.infura.io/v3/abc123yourkey
VITE_TOKEN_ADDRESS=
VITE_FAUCET_ADDRESS=
```

3. Save the file
4. Double-check: NO placeholder text like "YOUR_" should remain

---

## Step 3: Deploy Contracts (10 minutes)

From the `submission/` directory:

```powershell
# Make sure you're in the submission folder
cd submission

# Install dependencies (if not already done)
npm install

# Deploy to Sepolia
npm run deploy:sepolia
```

### Expected Output:
```
Deploying with account: 0xYourAddress
Token deployed: 0xTokenAddressHere
Faucet deployed: 0xFaucetAddressHere
Minter role granted to faucet
Deployment saved to deployment.json
Waiting for Etherscan indexing...
Successfully verified Token contract on Etherscan
Successfully verified TokenFaucet contract on Etherscan
```

### If Verification Fails:
Manually verify later:
```powershell
npx hardhat verify --network sepolia <TOKEN_ADDRESS>
npx hardhat verify --network sepolia <FAUCET_ADDRESS> <TOKEN_ADDRESS>
```

---

## Step 4: Update Documentation (5 minutes)

### Auto-update README with deployed addresses:
```powershell
node scripts/update-readme.js
```

This will:
- Update README.md with real contract addresses
- Add Etherscan verification links
- Update .env with frontend contract addresses

### Verify the updates:
1. Open `README.md`
2. Check "Deployed Contracts" section has real addresses
3. Open Etherscan links to confirm they work

---

## Step 5: Create Video Demo (15-30 minutes)

### Recording Tools (choose one):
- **Windows**: Xbox Game Bar (Win + G)
- **Chrome Extension**: Loom (https://www.loom.com/)
- **OBS Studio**: https://obsproject.com/ (free, pro quality)

### What to Show (2-5 minutes total):
1. **Introduction** (10s)
   - Show the application URL: http://localhost:3000

2. **Wallet Connection** (30s)
   - Click "Connect Wallet"
   - Approve MetaMask connection
   - Show wallet address appears

3. **Initial State** (20s)
   - Show token balance (0 initially)
   - Show "Can Claim: Yes"
   - Show remaining allowance

4. **Successful Claim** (60s)
   - Click "Request Tokens"
   - Approve MetaMask transaction
   - Show "Processing..." state
   - Wait for confirmation
   - Show balance updated
   - Show "Can Claim: No" (cooldown active)

5. **Error Handling** (30s)
   - Try to claim again immediately
   - Show cooldown error message
   - Show cooldown timer counting down

6. **Conclusion** (10s)
   - Show final balance
   - Show Etherscan transaction link

### Upload Options:
- **YouTube**: Upload as unlisted video
- **Loom**: Free up to 5 minutes
- **Google Drive**: Share publicly, get shareable link

### Add link to README:
Replace the placeholder in README.md:
```markdown
## Video Demonstration
https://youtu.be/YOUR_VIDEO_ID
```

---

## Step 6: Final Verification (5 minutes)

Run the preflight check:
```powershell
./scripts/preflight.ps1
```

### Expected Output:
```
[1/6] Contract tests ✓
[2/6] Frontend build ✓
[3/6] Placeholder checks ✓
[4/6] Screenshot file checks ✓
[5/6] Docker compose config validation ✓
[6/6] Verdict: READY TO SUBMIT: PASS
```

### If Failures Occur:
- **Placeholder checks fail**: You missed updating README
- **Docker config warnings**: Make sure .env has contract addresses
- Run `node scripts/update-readme.js` again if needed

---

## Step 7: Test Locally with Docker (5 minutes)

Make sure everything works:
```powershell
docker compose up
```

Wait ~60 seconds, then:
1. Open: http://localhost:3000
2. Check /health: http://localhost:3000/health
3. Open browser console (F12)
4. Test eval interface:
   ```javascript
   await window.__EVAL__.getContractAddresses()
   // Should return: { token: "0x...", faucet: "0x..." }
   ```

Stop Docker: `Ctrl+C`

---

## Step 8: Push to GitHub (2 minutes)

```powershell
# From project root
cd ..

# Stage all changes
git add .

# Commit
git commit -m "Add deployed contracts and video demo - ready for submission"

# Push
git push origin main
```

---

## Step 9: Submit! 🎉

1. Verify repository is public: https://github.com/MareeduManikanta123/Erc_20
2. Make sure all these are visible:
   - ✅ Deployed contract addresses in README
   - ✅ Etherscan verification links work
   - ✅ Video demo link is accessible
   - ✅ Screenshots are embedded
   - ✅ All code is pushed

3. Submit your repository URL through the submission portal

---

## Troubleshooting

### "Insufficient funds for gas"
- Get more Sepolia ETH from faucets

### "Cannot connect to RPC"
- Check SEPOLIA_RPC_URL is correct
- Verify Infura project is active

### "Verification failed"
- Wait 1-2 minutes, then manually verify:
  ```
  npx hardhat verify --network sepolia <ADDRESS>
  ```

### "Docker won't start"
- Make sure .env has VITE_TOKEN_ADDRESS and VITE_FAUCET_ADDRESS filled
- Run `node scripts/update-readme.js` to update .env

### "Video too large"
- Compress with HandBrake (free)
- Upload to YouTube/Loom instead of GitHub

---

## Estimated Total Time: 1-2 hours

- Prerequisites: 20 min
- Configuration: 5 min
- Deployment: 10 min
- Documentation: 5 min
- Video: 30 min
- Testing: 10 min
- Push & submit: 5 min

**Good luck! 🚀**
