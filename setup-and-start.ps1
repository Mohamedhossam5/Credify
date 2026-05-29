# Credify - Full Setup & Restart Script
# Run this script to install dependencies, set up the database, and start all services.
# Usage: .\setup-and-start.ps1

$RepoRoot = $PSScriptRoot
Write-Host "=== Credify Full Setup & Restart ===" -ForegroundColor Cyan
Write-Host "Repo root: $RepoRoot" -ForegroundColor Gray

# ─── Step 1: Kill any existing Node processes on our ports ───
Write-Host "`n[1/6] Stopping existing services on ports 3000, 3001, 3002..." -ForegroundColor Yellow
$ports = @(3000, 3001, 3002)
foreach ($port in $ports) {
    $pid = (netstat -ano | Select-String ":$port\s" | Where-Object { $_ -match 'LISTENING' } | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -First 1)
    if ($pid -and $pid -ne "0") {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  Stopped process on port $port (PID $pid)" -ForegroundColor Gray
        } catch {}
    }
}
Start-Sleep -Seconds 2

# ─── Step 2: Install node_modules in each service ────────────
Write-Host "`n[2/6] Installing dependencies for API Gateway..." -ForegroundColor Yellow
Set-Location "$RepoRoot\Server\api-gateway"
npm install --prefer-offline 2>&1 | Select-Object -Last 5
Write-Host "  Done." -ForegroundColor Green

Write-Host "`n[3/6] Installing dependencies for User Service..." -ForegroundColor Yellow
Set-Location "$RepoRoot\Server\user-service"
npm install --prefer-offline 2>&1 | Select-Object -Last 5
Write-Host "  Done." -ForegroundColor Green

Write-Host "`n[4/6] Installing dependencies for KYC Service..." -ForegroundColor Yellow
Set-Location "$RepoRoot\Server\kyc-service"
npm install --prefer-offline 2>&1 | Select-Object -Last 5
Write-Host "  Done." -ForegroundColor Green

# ─── Step 3: Verify .env files exist ─────────────────────────
Write-Host "`n[5/6] Verifying .env files..." -ForegroundColor Yellow
$envFiles = @(
    "$RepoRoot\Server\api-gateway\.env",
    "$RepoRoot\Server\user-service\.env",
    "$RepoRoot\Server\kyc-service\.env"
)
foreach ($f in $envFiles) {
    if (Test-Path $f) {
        Write-Host "  [OK] $f" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $f" -ForegroundColor Red
    }
}

# ─── Step 4: Start all services in new windows ───────────────
Write-Host "`n[6/6] Starting all services..." -ForegroundColor Yellow
Set-Location $RepoRoot

Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\api-gateway; npm run dev`""
Write-Host "  Started API Gateway (port 3000)" -ForegroundColor Green
Start-Sleep -Seconds 1

Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\user-service; npm run dev`""
Write-Host "  Started User Service (port 3001)" -ForegroundColor Green
Start-Sleep -Seconds 1

Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\kyc-service; npm run dev`""
Write-Host "  Started KYC Service (port 3002)" -ForegroundColor Green
Start-Sleep -Seconds 1

Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Client; npm run dev`""
Write-Host "  Started Frontend (Vite)" -ForegroundColor Green
Start-Sleep -Seconds 1

Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\face-service; .\.venv\Scripts\activate.ps1; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`""
Write-Host "  Started Face Service (port 8000)" -ForegroundColor Green

Write-Host "`n=== All services started! ===" -ForegroundColor Cyan
Write-Host "The user-service and kyc-service will automatically:" -ForegroundColor Gray
Write-Host "  1. Create their databases (credify_users, credify_kyc) if they don't exist" -ForegroundColor Gray
Write-Host "  2. Run all migrations (create all tables)" -ForegroundColor Gray
Write-Host "  3. Start the HTTP server" -ForegroundColor Gray
Write-Host "`nYou can close this window." -ForegroundColor Gray
