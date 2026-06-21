# ============================================
# Claude Code + Devstral (Bedrock Mantle) Setup
# ============================================
# Run this script:  .\start.ps1
# It starts LiteLLM, the proxy, and Claude Code

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Claude Code + Devstral Proxy Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Kill any existing processes on ports 4000 and 5000 ---
Write-Host "[1/4] Cleaning up old processes..." -ForegroundColor Yellow

$port4000 = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
if ($port4000) {
    $port4000 | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "  Killed old process on port 4000" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
if ($port5000) {
    $port5000 | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "  Killed old process on port 5000" -ForegroundColor Gray
    Start-Sleep -Seconds 2
}

Write-Host "  Done." -ForegroundColor Green

# --- Step 2: Start LiteLLM ---
Write-Host "[2/4] Starting LiteLLM on port 4000..." -ForegroundColor Yellow

$env:PYTHONIOENCODING = "utf-8"
$litellm = Start-Process -FilePath "litellm" `
    -ArgumentList "--config", "config.yaml", "--port", "4000" `
    -PassThru -WindowStyle Minimized
Write-Host "  LiteLLM started (PID: $($litellm.Id))" -ForegroundColor Green

# Wait for LiteLLM to be ready
Write-Host "  Waiting for LiteLLM to be ready..." -ForegroundColor Gray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {}
}

if ($ready) {
    Write-Host "  LiteLLM is ready!" -ForegroundColor Green
} else {
    Write-Host "  LiteLLM may still be starting... continuing anyway" -ForegroundColor DarkYellow
}

# --- Step 3: Start Proxy ---
Write-Host "[3/4] Starting Anthropic proxy on port 5000..." -ForegroundColor Yellow

$proxy = Start-Process -FilePath "python" `
    -ArgumentList "-m", "uvicorn", "proxy:app", "--host", "0.0.0.0", "--port", "5000" `
    -PassThru -WindowStyle Minimized
Write-Host "  Proxy started (PID: $($proxy.Id))" -ForegroundColor Green

Start-Sleep -Seconds 3

# Quick health check
try {
    $proxyCheck = Invoke-RestMethod -Uri "http://localhost:5000/" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  Proxy is ready!" -ForegroundColor Green
} catch {
    Write-Host "  Proxy may still be starting..." -ForegroundColor DarkYellow
}

# --- Step 4: Launch Claude Code ---
Write-Host "[4/4] Launching Claude Code..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  ANTHROPIC_BASE_URL = http://localhost:5000" -ForegroundColor Magenta
Write-Host "  All Claude models -> Devstral (Bedrock Mantle)" -ForegroundColor Magenta
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Claude Code is starting below" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C to exit everything" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$env:ANTHROPIC_BASE_URL = "http://localhost:5000"
$env:ANTHROPIC_API_KEY = "sk-proxy"

try {
    npx claude
} finally {
    # Cleanup when Claude Code exits
    Write-Host ""
    Write-Host "Shutting down..." -ForegroundColor Yellow

    if (!$litellm.HasExited) {
        Stop-Process -Id $litellm.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  LiteLLM stopped." -ForegroundColor Gray
    }
    if (!$proxy.HasExited) {
        Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  Proxy stopped." -ForegroundColor Gray
    }

    Write-Host "All done." -ForegroundColor Green
}
