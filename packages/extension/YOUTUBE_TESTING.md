# YouTube Upload Testing Guide

## Quick Setup (Required First Time)

### 1. Get Your Extension ID
1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Find "Proposals Mastery AI"
4. Copy the Extension ID (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 2. Setup Google OAuth (One Time)
Run the PowerShell script:
```powershell
cd packages/extension
.\setup-youtube.ps1
```

Or manually:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select a project
3. Enable "YouTube Data API v3"
4. Create OAuth credentials:
   - Type: Chrome Extension
   - Application ID: [Your Extension ID]
5. Copy Client ID
6. Update `manifest.json`:
   ```json
   "oauth2": {
     "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
     "scopes": ["https://www.googleapis.com/auth/youtube.upload"]
   }
   ```

### 3. Rebuild Extension
```bash
npm run build
```

### 4. Reload Extension
1. Go to `chrome://extensions/`
2. Click reload icon on "Proposals Mastery AI"

## Testing YouTube Upload

### Test Steps:
1. Click extension icon
2. Click "▶ Start Recording"
3. Select window/tab to record
4. Record for a few seconds
5. Click browser's "Stop sharing" button
6. Wait for video to process (automatic)
7. Click "📤 Upload to YouTube"
8. Sign in to Google (first time only)
9. Authorize YouTube access
10. Wait for upload to complete

### Expected Results:
- ✅ Status shows "Uploading to YouTube..."
- ✅ Success message with video ID
- ✅ Clickable YouTube link appears
- ✅ Video is unlisted on YouTube

### Check Browser Console:
Press F12 → Console tab to see detailed logs:
- `[Background] Starting YouTube upload...`
- `[Background] Video blob created, size: X bytes`
- `[Background] Upload successful! Video ID: XXXXX`

### Common Errors:

#### "Invalid Client ID"
- ❌ Client ID not set in manifest.json
- ✅ Run `setup-youtube.ps1` or manually update manifest

#### "The OAuth client was not found"
- ❌ Extension ID mismatch
- ✅ Update OAuth credentials with correct Extension ID

#### "Access Denied"
- ❌ YouTube API not enabled
- ✅ Enable YouTube Data API v3 in Google Cloud Console

#### "Invalid scope"
- ❌ Wrong scope in OAuth consent screen
- ✅ Add scope: `https://www.googleapis.com/auth/youtube.upload`

#### "Request had insufficient authentication"
- ❌ User not authorized
- ✅ Click "Upload to YouTube" again to re-authorize

### Debug Mode:
Check these consoles for detailed logs:
1. **Popup Console**: Right-click extension → Inspect popup
2. **Background Console**: Chrome extensions page → Service worker link
3. **Content Console**: F12 on the webpage

### Manual OAuth Token Test:
```javascript
// Run in extension popup console:
chrome.identity.getAuthToken({ interactive: true }, (token) => {
  console.log('Token:', token);
  console.log('Error:', chrome.runtime.lastError);
});
```

### Verify Upload on YouTube:
1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click "Content"
3. Look for videos titled "Upwork Proposal - [timestamp]"
4. Visibility should be "Unlisted"

## Storage Settings

Configure where recordings are saved:
1. Click ⚙️ (settings icon) in extension
2. Choose storage option:
   - **Local Only**: Auto-downloads to computer
   - **YouTube Only**: Manual upload button
   - **Both**: Downloads + upload button

## Troubleshooting Videos Not Uploading

### Check Extension Permissions:
```json
// manifest.json should have:
"permissions": ["identity", "storage"]
"host_permissions": ["https://www.googleapis.com/*"]
```

### Test Small Recording:
- Record for only 3-5 seconds
- Smaller files upload faster and help isolate issues

### Clear OAuth Cache:
```javascript
// In popup console:
chrome.identity.removeCachedAuthToken({ token: 'current_token' }, () => {
  console.log('Token cleared');
});
```

### Check YouTube Quota:
- YouTube API has daily upload quota (10,000 units/day)
- 1 video upload = ~1,600 units
- ~6 uploads per day for free tier

## Success Checklist:
- ✅ Extension ID in manifest matches chrome://extensions/
- ✅ Client ID in manifest from Google Cloud Console
- ✅ Extension ID in OAuth credentials matches
- ✅ YouTube Data API v3 enabled
- ✅ OAuth scope: `youtube.upload`
- ✅ Extension rebuilt after manifest changes
- ✅ Extension reloaded in Chrome
- ✅ Signed in to Google account with YouTube channel
