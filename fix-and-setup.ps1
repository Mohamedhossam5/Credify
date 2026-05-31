
# ============================================================
# Credify - Fix & Setup Script
# Run this once to install deps, create .env files, and migrate
# ============================================================

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# ────────────────────────────────────────────────────────────
# CONFIGURE YOUR POSTGRES PASSWORD HERE
# ────────────────────────────────────────────────────────────
$PG_PASSWORD = "postgres"        # <-- change this to your actual password
$JWT_SECRET  = "credify_super_secret_jwt_key_2024"

Write-Host "`n[1/5] Installing API Gateway dependencies..." -ForegroundColor Cyan
Set-Location "$ROOT\Server\api-gateway"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install failed for api-gateway" -ForegroundColor Red; exit 1 }

# Create .env for api-gateway
@"
PORT=3000
"@ | Set-Content ".env" -Encoding UTF8
Write-Host "  Created api-gateway\.env" -ForegroundColor Green

Write-Host "`n[2/5] Installing User Service dependencies..." -ForegroundColor Cyan
Set-Location "$ROOT\Server\user-service"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install failed for user-service" -ForegroundColor Red; exit 1 }

# Create .env for user-service
@"
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=credify_users
DB_USER=postgres
DB_PASSWORD=$PG_PASSWORD
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
"@ | Set-Content ".env" -Encoding UTF8
Write-Host "  Created user-service\.env" -ForegroundColor Green

Write-Host "`n[3/5] Installing KYC Service dependencies..." -ForegroundColor Cyan
Set-Location "$ROOT\Server\kyc-service"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install failed for kyc-service" -ForegroundColor Red; exit 1 }

# Create .env for kyc-service
@"
PORT=3002
DB_HOST=localhost
DB_PORT=5432
DB_NAME=credify_kyc
DB_USER=postgres
DB_PASSWORD=$PG_PASSWORD
JWT_SECRET=$JWT_SECRET
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
"@ | Set-Content ".env" -Encoding UTF8
Write-Host "  Created kyc-service\.env" -ForegroundColor Green

Write-Host "`n[4/5] Installing Frontend (Client) dependencies..." -ForegroundColor Cyan
Set-Location "$ROOT\Client"
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install failed for Client" -ForegroundColor Red; exit 1 }

Write-Host "`n[5/5] Running database migrations..." -ForegroundColor Cyan
Write-Host "  NOTE: Make sure PostgreSQL is running and these databases exist:" -ForegroundColor Yellow
Write-Host "        - credify_users" -ForegroundColor Yellow
Write-Host "        - credify_kyc" -ForegroundColor Yellow
Write-Host ""

$answer = Read-Host "  Have you created both databases in pgAdmin 4? (y/n)"
if ($answer -eq "y" -or $answer -eq "Y") {
    Write-Host "  Running user-service migrations..." -ForegroundColor Cyan
    Set-Location "$ROOT\Server\user-service"
    npm run db:migrate
    
    Write-Host "  Running kyc-service migrations..." -ForegroundColor Cyan
    Set-Location "$ROOT\Server\kyc-service"
    npm run db:migrate
    
    Write-Host "`n✅ All done! Run .\start-all.ps1 to start the app." -ForegroundColor Green
} else {
    Write-Host "`n  Skipping migrations. Create the databases in pgAdmin 4 then run:" -ForegroundColor Yellow
    Write-Host "    cd Server\user-service; npm run db:migrate" -ForegroundColor White
    Write-Host "    cd Server\kyc-service;  npm run db:migrate" -ForegroundColor White
    Write-Host "`n  Then run .\start-all.ps1 to start everything." -ForegroundColor Green
}

Set-Location $ROOT
