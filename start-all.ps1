# Credify Bank - Start Script
# This will open each microservice and the frontend in its own Terminal Window
$RepoRoot = $PSScriptRoot
Write-Host "Starting Credify Services..." -ForegroundColor Cyan
Write-Host "Repo root: $RepoRoot" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTE: Run .\setup-and-start.ps1 on first run to install deps + set up databases." -ForegroundColor Yellow
Write-Host ""

Write-Host "1/5 Starting API Gateway (Port 3000)..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\api-gateway; npm run dev`""

Write-Host "2/5 Starting User Service (Port 3001)..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\user-service; npm run dev`""

Write-Host "3/5 Starting KYC Service (Port 3002)..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\kyc-service; npm run dev`""

Write-Host "4/5 Starting Frontend (Vite)..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Client; npm run dev`""

Write-Host "5/5 Starting Face Verification Service (Port 8000)..." -ForegroundColor Green
Start-Process powershell -WorkingDirectory $RepoRoot -ArgumentList "-NoExit -Command `"cd Server\face-service; .\.venv\Scripts\activate.ps1; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`""

Write-Host "Success! All services have been started in separate terminal windows." -ForegroundColor Cyan
Write-Host "You can close this window now." -ForegroundColor Gray
