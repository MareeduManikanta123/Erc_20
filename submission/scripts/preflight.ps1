$ErrorActionPreference = "Stop"

Write-Host "[1/6] Contract tests" -ForegroundColor Cyan
npm test | Out-Host

Write-Host "[2/6] Frontend build" -ForegroundColor Cyan
Push-Location frontend
npm run build | Out-Host
Pop-Location

Write-Host "[3/6] Placeholder checks" -ForegroundColor Cyan
$readme = Get-Content README.md -Raw
$hasPlaceholderAddress = $readme -match "0xYourTokenAddress|0xYourFaucetAddress"
$hasPlaceholderVideo = $readme -match "your-video-link.example"

if ($hasPlaceholderAddress) {
  Write-Host "README still has placeholder contract addresses." -ForegroundColor Yellow
}
if ($hasPlaceholderVideo) {
  Write-Host "README still has placeholder video link." -ForegroundColor Yellow
}

Write-Host "[4/6] Screenshot file checks" -ForegroundColor Cyan
$requiredShots = @(
  "screenshots/wallet-connection.png",
  "screenshots/token-balance-status.png",
  "screenshots/success-claim.png",
  "screenshots/error-cooldown.png",
  "screenshots/tx-confirmation.png"
)

$missing = @()
foreach ($file in $requiredShots) {
  if (-not (Test-Path $file)) {
    $missing += $file
  }
}

if ($missing.Count -gt 0) {
  Write-Host "Missing screenshots:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host "- $_" -ForegroundColor Yellow }
}

Write-Host "[5/6] Docker compose config validation" -ForegroundColor Cyan
docker compose config | Out-Host

Write-Host "[6/6] Verdict" -ForegroundColor Cyan
$ready = $true
if ($hasPlaceholderAddress -or $hasPlaceholderVideo -or $missing.Count -gt 0) {
  $ready = $false
}

if ($ready) {
  Write-Host "READY TO SUBMIT: PASS" -ForegroundColor Green
  exit 0
} else {
  Write-Host "READY TO SUBMIT: NOT YET" -ForegroundColor Red
  Write-Host "Fix placeholders/evidence items and rerun scripts/preflight.ps1" -ForegroundColor Red
  exit 2
}
