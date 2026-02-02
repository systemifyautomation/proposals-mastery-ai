# Proposals Mastery AI - Native Host Installation Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "=== Proposals Mastery AI Native Host Installer ===" -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit
}

# Check Python installation
Write-Host "Checking Python installation..." -ForegroundColor Cyan
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    pause
    exit
}

# Get extension ID
Write-Host ""
Write-Host "=== Extension ID Required ===" -ForegroundColor Yellow
Write-Host "1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
Write-Host "2. Enable 'Developer mode' (top right)" -ForegroundColor White
Write-Host "3. Find 'Proposals Mastery AI' extension" -ForegroundColor White
Write-Host "4. Copy the Extension ID (looks like: abcdefghijklmnopqrstuvwxyz123456)" -ForegroundColor White
Write-Host ""
$extensionId = Read-Host "Enter your Extension ID"

if ($extensionId.Length -ne 32) {
    Write-Host "ERROR: Invalid extension ID format (should be 32 characters)" -ForegroundColor Red
    pause
    exit
}

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonScriptPath = Join-Path $scriptDir "settings_host.py"
$manifestPath = Join-Path $scriptDir "com.proposalsmastery.settings.json"

# Verify files exist
if (-not (Test-Path $pythonScriptPath)) {
    Write-Host "ERROR: settings_host.py not found in $scriptDir" -ForegroundColor Red
    pause
    exit
}

if (-not (Test-Path $manifestPath)) {
    Write-Host "ERROR: com.proposalsmastery.settings.json not found in $scriptDir" -ForegroundColor Red
    pause
    exit
}

# Update manifest with extension ID
Write-Host ""
Write-Host "Configuring native host manifest..." -ForegroundColor Cyan
$manifestContent = Get-Content $manifestPath -Raw
$manifestContent = $manifestContent -replace 'EXTENSION_ID_HERE', $extensionId
$manifestContent = $manifestContent -replace '"path": "settings_host.py"', "`"path`": `"$pythonScriptPath`""
Set-Content $manifestPath $manifestContent

# Create registry entry
Write-Host "Registering native host in Windows Registry..." -ForegroundColor Cyan
$registryPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.proposalsmastery.settings"

try {
    # Remove existing entry if it exists
    if (Test-Path $registryPath) {
        Remove-Item $registryPath -Force
    }
    
    # Create new entry
    New-Item -Path $registryPath -Force | Out-Null
    New-ItemProperty -Path $registryPath -Name "(Default)" -Value $manifestPath -Force | Out-Null
    
    Write-Host "SUCCESS: Native host registered!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to register native host: $_" -ForegroundColor Red
    pause
    exit
}

# Display settings location
Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your settings will be saved to:" -ForegroundColor Cyan
Write-Host "$env:APPDATA\ProposalsMasteryAI\settings.json" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Chrome completely (close all windows)" -ForegroundColor White
Write-Host "2. Reload the extension in chrome://extensions/" -ForegroundColor White
Write-Host "3. Your settings will now persist across reinstalls!" -ForegroundColor White
Write-Host ""
pause
