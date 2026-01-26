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

### 2. Configure Your Template

Open the extension popup and select a template. The extension includes a default template that you can customize.

### 3. Apply to Upwork Jobs

1. Go to an Upwork job application page:
   - URL format: `https://www.upwork.com/nx/proposals/job/~{ID}/apply/`

2. You'll see a **green floating button** that says **"AI Generate & Fill"**

3. Click the button to automatically generate and fill your cover letter

4. Review and submit!

## How It Works

```
┌─────────────────────┐
│  1. Go to Upwork    │
│  application page   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Click green     │
│  "AI Generate"      │
│  floating button    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Cover letter    │
│  auto-fills!        │
│  Review & submit    │
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

### Extension button doesn't appear
- Make sure you're on a URL like `/nx/proposals/job/*/apply/`
- Refresh the page after loading the extension

### "Could not find cover letter field"
- Upwork may have changed their layout
- The extension tries multiple selectors to find the textarea
- Try refreshing the page

### Cover letter not filling correctly
- Check that your template has the correct placeholders
- Make sure you selected a template in the extension popup
- Try refreshing the Upwork page

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
