# Simple YouTube Setup Guide

## Quick Setup (5 minutes)

### 1. Get Your Extension ID
1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Find "Proposals Mastery AI" extension
4. **Copy the Extension ID** (looks like: `abcdefghijklmnopqrstuvwxyz123456`)

### 2. Create Google OAuth Credentials
1. Open: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Click "APIs & Services" → "Library"
4. Search for "YouTube Data API v3" → Click → Enable
5. Click "APIs & Services" → "Credentials"
6. Click "Create Credentials" → "OAuth client ID"
7. If prompted to configure consent screen:
   - User Type: **External**
   - App name: **Proposals Mastery AI**
   - Your email for support and developer contact
   - Scopes: Add `https://www.googleapis.com/auth/youtube.upload`
   - Test users: Add your Google account email
   - Click Save
8. Back to Create OAuth client ID:
   - Application type: **Chrome Extension**
   - Name: **Proposals Mastery AI Extension**
   - Application ID: **[Paste your Extension ID from step 1]**
   - Click "Create"
9. **Copy the Client ID** (ends with `.apps.googleusercontent.com`)

### 3. Update manifest.json
1. Open: `packages/extension/manifest.json`
2. Find line with `"client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"`
3. Replace with: `"client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com"`
4. Save the file

### 4. Rebuild Extension
```bash
npm run build
```

### 5. Reload Extension
1. Go to `chrome://extensions/`
2. Find "Proposals Mastery AI"
3. Click the **reload icon** 🔄

### 6. Test!
1. Click extension icon
2. Record a short video (3-5 seconds)
3. Stop sharing in browser
4. Click "Upload to YouTube"
5. Sign in and authorize

## Troubleshooting

### "Extension ID mismatch"
- Make sure the Extension ID in Google Console matches the one in chrome://extensions/

### "Invalid Client ID"
- Check that you copied the full Client ID including `.apps.googleusercontent.com`

### "Access Denied"
- Make sure YouTube Data API v3 is enabled
- Check that you added the upload scope: `https://www.googleapis.com/auth/youtube.upload`
- Add yourself as a test user in OAuth consent screen

### Script won't run
- PowerShell execution policy might be restricted
- Use this manual guide instead
- Or run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

## Video Upload Settings

After setup, you can choose where to save videos:
1. Click ⚙️ (settings) in extension popup
2. Choose storage location:
   - **Local Only**: Auto-downloads to your computer
   - **YouTube Only**: Upload button appears
   - **Both**: Downloads + upload button

Videos are uploaded as **unlisted** by default (not public, but shareable via link).

## Need Help?

1. Open browser console (F12) when testing upload
2. Check for detailed error messages
3. Open `diagnostics.html` in browser for configuration check
4. See full guide: `YOUTUBE_SETUP.md`
