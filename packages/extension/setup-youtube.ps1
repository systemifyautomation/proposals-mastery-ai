# YouTube OAuth Setup Script
Write-Host "=== YouTube API Setup for Proposals Mastery AI ===" -ForegroundColor Green
Write-Host ""

# Step 1: Get Extension ID
Write-Host "STEP 1: Get Your Extension ID" -ForegroundColor Yellow
Write-Host "1. Open Chrome and go to: chrome://extensions/" -ForegroundColor White
Write-Host "2. Enable 'Developer mode' (top right)" -ForegroundColor White
Write-Host "3. Find 'Proposals Mastery AI' extension" -ForegroundColor White
Write-Host "4. Copy the Extension ID (32 character string under the name)" -ForegroundColor White
Write-Host ""
$extensionId = Read-Host "Enter your Extension ID"

if ($extensionId.Length -ne 32) {
    Write-Host "ERROR: Extension ID should be 32 characters" -ForegroundColor Red
    pause
    exit
}

# Step 2: Get Google Client ID
Write-Host ""
Write-Host "STEP 2: Create Google OAuth Credentials" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Create a new project or select existing" -ForegroundColor White
Write-Host "3. Enable 'YouTube Data API v3' in APIs & Services" -ForegroundColor White
Write-Host "4. Go to 'Credentials' > 'Create Credentials' > 'OAuth client ID'" -ForegroundColor White
Write-Host "5. Application type: Chrome Extension" -ForegroundColor White
Write-Host "6. Application ID: $extensionId" -ForegroundColor White
Write-Host "7. Copy the Client ID (ends with .apps.googleusercontent.com)" -ForegroundColor White
Write-Host ""
$clientId = Read-Host "Enter your Google Client ID"

if (-not $clientId.EndsWith(".apps.googleusercontent.com")) {
    Write-Host "WARNING: Client ID should end with .apps.googleusercontent.com" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Step 3: Update manifest.json
Write-Host ""
Write-Host "STEP 3: Updating manifest.json..." -ForegroundColor Yellow

$manifestPath = "manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Host "ERROR: manifest.json not found in current directory" -ForegroundColor Red
    Write-Host "Please run this script from the extension directory" -ForegroundColor Yellow
    pause
    exit
}

$manifestContent = Get-Content $manifestPath -Raw
$manifestContent = $manifestContent -replace '"client_id": ".*?"', "`"client_id`": `"$clientId`""
Set-Content $manifestPath $manifestContent

Write-Host "✓ Updated manifest.json with Client ID" -ForegroundColor Green

# Step 4: Build extension
Write-Host ""
Write-Host "STEP 4: Building extension..." -ForegroundColor Yellow
npm run build

# Step 5: Instructions
Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Reload the extension in chrome://extensions/" -ForegroundColor White
Write-Host "2. Click the extension icon" -ForegroundColor White
Write-Host "3. Try uploading a video to YouTube" -ForegroundColor White
Write-Host "4. You'll be prompted to sign in and authorize YouTube access" -ForegroundColor White
Write-Host ""
Write-Host "Note: Videos are uploaded as unlisted by default" -ForegroundColor Cyan
Write-Host ""
pause
