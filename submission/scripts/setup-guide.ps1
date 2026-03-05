# Setup Guide for Deployment
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT SETUP GUIDE" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check .env
Write-Host ""
Write-Host "[1/4] Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "YOUR_|0xYour") {
        Write-Host "WARNING: .env has placeholder values - must edit first!" -ForegroundColor Red
        $needsSetup = $true
    } else {
        Write-Host "OK: .env appears configured" -ForegroundColor Green
        $needsSetup = $false
    }
} else {
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    $needsSetup = $true
}

# Prerequisites
Write-Host ""
Write-Host "[2/4] Prerequisites:" -ForegroundColor Yellow
Write-Host "  1. Sepolia ETH: https://sepoliafaucet.com/" -ForegroundColor White
Write-Host "  2. RPC URL: https://app.infura.io/" -ForegroundColor White
Write-Host "  3. Private Key: MetaMask > Export Private Key" -ForegroundColor White
Write-Host "  4. Etherscan API: https://etherscan.io/apis" -ForegroundColor White

# Next steps
Write-Host ""
if ($needsSetup) {
    Write-Host "[3/4] EDIT .env FILE NOW with real values!" -ForegroundColor Yellow
} else {
    Write-Host "[3/4] Ready to deploy!" -ForegroundColor Green
}

# Commands
Write-Host ""
Write-Host "[4/4] Deployment Commands:" -ForegroundColor Yellow
Write-Host "  Deploy contracts: npm run deploy:sepolia" -ForegroundColor Cyan
Write-Host "  Update README: node scripts/update-readme.js" -ForegroundColor Cyan
Write-Host "  Final check: ./scripts/preflight.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
