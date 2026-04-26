# YouTube API Setup Guide

To use the screen recording and YouTube upload feature, you need to set up Google OAuth credentials.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Proposals Mastery AI")
4. Click "Create"

## Step 2: Enable YouTube Data API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External
   - App name: Proposals Mastery AI
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `https://www.googleapis.com/auth/youtube.upload`
   - Test users: Add your email
4. Back to Create OAuth client ID:
   - Application type: Chrome Extension
   - Name: Proposals Mastery AI Extension
   - Copy the Extension ID from `chrome://extensions/` (after loading the extension)
   - Paste it in the Application ID field
5. Click "Create"
6. Copy the **Client ID**

## Step 4: Configure the Extension

1. Open `packages/extension/manifest.json`
2. Find the `oauth2` section:
   ```json
   "oauth2": {
     "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
     "scopes": [
       "https://www.googleapis.com/auth/youtube.upload"
     ]
   }
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
4. Save the file

## Step 5: Rebuild and Reload

```bash
npm run build
```

Then reload the extension in Chrome:
1. Go to `chrome://extensions/`
2. Find "Proposals Mastery AI"
3. Click the reload icon 🔄

## Step 6: Test the Feature

1. Go to an Upwork application page
2. Click the extension icon
3. Click "Start Recording"
4. Grant screen recording permissions
5. Click "Stop Recording"
6. Click "Upload to YouTube"
7. Grant YouTube access when prompted
8. The video will be uploaded as unlisted!

## Troubleshooting

### "Invalid Client ID" error
- Make sure you copied the full Client ID including `.apps.googleusercontent.com`
- Verify the Extension ID in the OAuth consent screen matches your actual extension ID

### "Access Denied" error
- Make sure you added the YouTube upload scope in the OAuth consent screen
- Add yourself as a test user

### Upload fails
- Check that YouTube Data API v3 is enabled
- Verify you granted all necessary permissions

## Notes

- Videos are uploaded as **unlisted** by default
- You can change the privacy setting in `background.js` if needed
- The OAuth consent screen needs to be published for production use
- For testing, you can add up to 100 test users
