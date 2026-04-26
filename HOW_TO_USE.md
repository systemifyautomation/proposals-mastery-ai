# How to Use Proposals Mastery AI Chrome Extension

## Quick Start

### 1. Install the Extension

```bash
# Install dependencies and build
npm install
npm run build
```

Then load in Chrome/Edge:
1. Open `chrome://extensions/`
2. Turn on **"Developer mode"** (top-right toggle)
3. Click **"Load unpacked"**
4. Select `packages/extension/dist/` folder

### 2. Configure YouTube API (Optional)

For the video recording feature:

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Copy your Client ID
5. Edit `packages/extension/manifest.json` and replace `YOUR_GOOGLE_CLIENT_ID`

### 3. Select a Template

Open the extension popup and select a template from the dropdown.

### 4. Apply to Upwork Jobs

1. Navigate to an Upwork job application page:
   - URL format: `https://www.upwork.com/nx/proposals/job/~{ID}/apply/`

2. Click the **extension icon** in your toolbar

3. Click **"Generate & Auto-Fill"** to fill the cover letter automatically

4. Review and submit!

### 5. Record and Upload (Optional)

While on the application page:

1. Click the extension icon
2. Click **"Start Recording"** to begin screen recording
3. Click **"Stop Recording"** when done
4. Click **"Upload to YouTube"** to upload as an unlisted video
5. The video will be uploaded to your YouTube account

## How It Works

```
┌─────────────────────┐
│  1. Open Extension  │
│  on Upwork page     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Select template │
│  & click "Fill"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Cover letter    │
│  auto-fills!        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. Optional:       │
│  Record & Upload    │
│  to YouTube         │
└─────────────────────┘
```

## Available Placeholders

Your templates can use these placeholders:

| Placeholder | Description | Source |
|-------------|-------------|--------|
| `{{JOB_TITLE}}` | Job title | Extracted from Upwork |
| `{{JOB_DESCRIPTION}}` | Job description | Extracted from Upwork |
| `{{SKILLS}}` | Required skills | Extracted from Upwork |
| `{{NAME}}` | Your name | Your profile data |
| `{{TITLE}}` | Professional title | Your profile data |
| `{{YEARS_EXPERIENCE}}` | Years of experience | Your profile data |
| `{{BIO}}` | Your bio | Your profile data |
| `{{PROJECTS}}` | Projects list | Your profile data |
| `{{ACHIEVEMENTS}}` | Achievements list | Your profile data |
| `{{PORTFOLIO}}` | Portfolio URL | Your profile data |

## Customizing Templates

You can modify templates by editing the extension's storage or by building a custom template management system.

## Troubleshooting

### Extension doesn't fill the cover letter
- Make sure you're on a URL like `/nx/proposals/job/*/apply/`
- Make sure you selected a template in the popup
- Refresh the page and try again

### Recording doesn't start
- Make sure you grant screen recording permissions when prompted
- Try refreshing the page

### YouTube upload fails
- Verify your Google OAuth credentials are configured correctly
- Make sure you authorized the extension to access your YouTube account
- Check that the YouTube Data API v3 is enabled in your Google Cloud project

## Development

To make changes to the extension:

```bash
cd packages/extension
# Make your changes to src/ files
npm run build
# Reload the extension in chrome://extensions/
```

---

**Note:** A web app for easier template and profile management is planned for a future branch.
