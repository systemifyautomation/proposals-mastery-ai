# Native Host Installation Guide

## What is the Native Host?

The native host is a small Python script that runs on your computer to save extension settings to a persistent JSON file. This ensures your settings survive even if you uninstall the extension.

## Settings Location

Your settings are saved to:
- **Windows**: `%APPDATA%\ProposalsMasteryAI\settings.json`
- **macOS**: `~/Library/Application Support/ProposalsMasteryAI/settings.json`
- **Linux**: `~/.config/ProposalsMasteryAI/settings.json`

## Installation

### Prerequisites

- Python 3.6 or higher installed on your system
- The Chrome extension installed

### Step 1: Install Python (if not already installed)

#### Windows
1. Download Python from [python.org](https://www.python.org/downloads/)
2. Run installer and check "Add Python to PATH"
3. Verify: Open CMD and type `python --version`

#### macOS
```bash
brew install python3
```

#### Linux
```bash
sudo apt-get install python3
```

### Step 2: Set Up the Native Host

#### Windows

1. Open PowerShell as Administrator
2. Navigate to the extension's native-host folder:
   ```powershell
   cd "C:\Users\PCZZ3\Documents\GitHub\proposals-mastery-ai\packages\extension\native-host"
   ```

3. Make the Python script executable and get the extension ID:
   ```powershell
   # Open Chrome and go to chrome://extensions/
   # Enable Developer Mode
   # Find "Proposals Mastery AI" and copy the ID
   ```

4. Create the registry entry:
   ```powershell
   # Create install script
   $scriptPath = (Get-Location).Path + "\settings_host.py"
   $manifestPath = (Get-Location).Path + "\com.proposalsmastery.settings.json"
   
   # Update manifest with your extension ID (replace YOUR_EXTENSION_ID)
   (Get-Content $manifestPath) -replace 'EXTENSION_ID_HERE', 'YOUR_EXTENSION_ID' | Set-Content $manifestPath
   
   # Update manifest with full Python script path
   (Get-Content $manifestPath) -replace '"path": "settings_host.py"', "`"path`": `"$scriptPath`"" | Set-Content $manifestPath
   
   # Register the native host
   New-Item -Path "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.proposalsmastery.settings" -Force
   New-ItemProperty -Path "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.proposalsmastery.settings" -Name "(Default)" -Value $manifestPath -Force
   ```

#### macOS

1. Open Terminal
2. Navigate to the native-host folder:
   ```bash
   cd ~/Documents/GitHub/proposals-mastery-ai/packages/extension/native-host
   ```

3. Make the script executable:
   ```bash
   chmod +x settings_host.py
   ```

4. Get your extension ID from `chrome://extensions/`

5. Update the manifest and install:
   ```bash
   # Replace YOUR_EXTENSION_ID with actual ID
   sed -i '' 's/EXTENSION_ID_HERE/YOUR_EXTENSION_ID/g' com.proposalsmastery.settings.json
   
   # Update path
   SCRIPT_PATH="$(pwd)/settings_host.py"
   sed -i '' "s|\"path\": \"settings_host.py\"|\"path\": \"$SCRIPT_PATH\"|g" com.proposalsmastery.settings.json
   
   # Install manifest
   mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   cp com.proposalsmastery.settings.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
   ```

#### Linux

1. Open Terminal
2. Navigate to the native-host folder:
   ```bash
   cd ~/Documents/GitHub/proposals-mastery-ai/packages/extension/native-host
   ```

3. Make the script executable:
   ```bash
   chmod +x settings_host.py
   ```

4. Get your extension ID from `chrome://extensions/`

5. Update the manifest and install:
   ```bash
   # Replace YOUR_EXTENSION_ID with actual ID
   sed -i 's/EXTENSION_ID_HERE/YOUR_EXTENSION_ID/g' com.proposalsmastery.settings.json
   
   # Update path
   SCRIPT_PATH="$(pwd)/settings_host.py"
   sed -i "s|\"path\": \"settings_host.py\"|\"path\": \"$SCRIPT_PATH\"|g" com.proposalsmastery.settings.json
   
   # Install manifest
   mkdir -p ~/.config/google-chrome/NativeMessagingHosts/
   cp com.proposalsmastery.settings.json ~/.config/google-chrome/NativeMessagingHosts/
   ```

### Step 3: Verify Installation

1. Reload the extension in Chrome
2. Open the extension popup
3. You should see a message confirming native host connection
4. Your settings will now persist across reinstalls!

## Troubleshooting

### Native Host Not Connecting

1. Verify Python is installed: `python --version` or `python3 --version`
2. Check the manifest file has the correct extension ID
3. Check the manifest file has the full path to the Python script
4. Restart Chrome completely

### Check Settings File Location

Run this command to see where your settings are saved:
- **Windows**: `echo %APPDATA%\ProposalsMasteryAI\settings.json`
- **macOS/Linux**: `echo ~/.config/ProposalsMasteryAI/settings.json` (or `~/Library/Application Support/ProposalsMasteryAI/settings.json` on macOS)

### Clear All Settings

To delete all saved settings:
1. Use the "Clear All Data" button in the extension settings
2. Or manually delete the settings.json file from the location above

## Uninstallation

To remove the native host:

### Windows
```powershell
Remove-Item -Path "HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.proposalsmastery.settings" -Force
```

### macOS
```bash
rm ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.proposalsmastery.settings.json
```

### Linux
```bash
rm ~/.config/google-chrome/NativeMessagingHosts/com.proposalsmastery.settings.json
```

## Security

- The native host only reads/writes to a single JSON file
- It cannot access any other files on your system
- It only responds to messages from your extension
- All data is stored locally on your computer
