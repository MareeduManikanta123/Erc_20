# Submission Status

## Current Status
**Not final-ready yet** until these are completed:

1. Replace placeholder contract addresses in `README.md` with real deployed Sepolia addresses.
2. Verify both contracts on Etherscan and add links in `README.md`.
3. Replace placeholder video URL in `README.md` with public demo video link.
4. Ensure screenshots are real final app-flow captures (not placeholders).

## Final Commands
Run from `submission/`:

```powershell
# 1) Deploy
npm run deploy:sepolia

# 2) Verify (if not using VERIFY_ON_DEPLOY=true)
npm run verify:sepolia -- <TOKEN_ADDRESS>
npm run verify:sepolia -- <FAUCET_ADDRESS> <TOKEN_ADDRESS>

# 3) Final preflight gate
./scripts/preflight.ps1
```

## Required Manual Evidence
- Real screenshots for:
  - wallet connection
  - token balance + eligibility
  - successful claim tx
  - cooldown/limit/paused error state
  - transaction pending/confirmation
- Public video demo URL (2–5 min).

## Submission Decision Rule
- Submit **only when** `scripts/preflight.ps1` returns `READY TO SUBMIT: PASS` and README contains real addresses + real video link.
