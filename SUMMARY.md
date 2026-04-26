# Proposals Mastery AI - Extension Only

This repository now contains **only the Chrome extension** for auto-filling Upwork cover letters.

## ✅ What's Included

- **Chrome Extension** in `packages/extension/`
  - Auto-fills cover letters on Upwork application pages
  - Built-in template system with 2 default templates
  - Placeholder system for dynamic content
  - One-click generation and auto-fill

## 📦 What Was Removed

- Web app (Next.js) - will be built in a separate branch
- Profile management UI
- Template editor UI
- All web app dependencies

## 🚀 Quick Start

```bash
# Build the extension
npm install
npm run build

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select packages/extension/dist/
```

## 📖 Documentation

- [README.md](README.md) - Overview and features
- [HOW_TO_USE.md](HOW_TO_USE.md) - Usage instructions
- [packages/extension/README.md](packages/extension/README.md) - Extension details

## 🎯 How It Works

1. User selects a template in the extension popup
2. User navigates to Upwork job application page
3. User clicks the green "AI Generate & Fill" button
4. Extension extracts job details and fills the cover letter field automatically

## 🔮 Future Plans

The web app for template and profile management will be developed in a separate branch to keep the extension standalone and lightweight.

## 📝 Default Templates

The extension includes 2 templates out of the box:
- Professional Template (general use)
- Technical Template (for dev jobs)

Users can customize these by editing the code or wait for the web app interface.
