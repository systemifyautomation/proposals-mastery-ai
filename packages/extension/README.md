# Proposals Mastery AI - Browser Extension

Chrome browser extension for analyzing Upwork job postings and generating cover letters using your templates.

## Features

- **Job Analysis**: Automatically extracts job details from Upwork job postings
- **Template Selection**: Choose from your saved templates
- **Cover Letter Generation**: Generate customized cover letters with one click
- **Upwork Theme**: Matches Upwork's visual design (black, white, green)

## Installation

### For Development

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Load in Chrome/Edge:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/` directory

### For Production

1. Download the latest release from the releases page
2. Follow the same steps as above to load the unpacked extension

## Usage

1. **Navigate to Upwork**: Go to any job posting on Upwork.com
2. **Analyze Job**: Click the floating "Generate Cover Letter" button on the page
3. **Open Extension**: Click the extension icon in your toolbar
4. **Select Template**: Choose a template from your library
5. **Generate**: Click "Generate Cover Letter" to create a customized proposal
6. **Copy**: Copy the generated letter and paste it into your Upwork proposal

## Project Structure

```
extension/
├── src/
│   ├── background.js    # Service worker
│   ├── content.js       # Content script (runs on Upwork pages)
│   ├── content.css      # Styles for content script
│   └── popup.js         # Popup interface logic
├── popup.html           # Popup UI
├── manifest.json        # Extension manifest (Manifest V3)
├── build.js            # Build script
└── dist/               # Built extension (generated)
```

## Features in Detail

### Content Script
- Runs on `https://www.upwork.com/jobs/*`
- Extracts job title, description, budget, skills, and duration
- Adds a floating button for quick access

### Popup Interface
- Displays extracted job information
- Lists available templates
- Generates cover letters by replacing placeholders
- Copy to clipboard functionality

### Template Placeholders
- `{{JOB_TITLE}}` - Replaced with the job title
- `{{JOB_DESCRIPTION}}` - Replaced with job description preview
- `{{SKILLS}}` - Replaced with comma-separated skills
- `{{BUDGET}}` - Replaced with job budget

## Development

### Build
```bash
npm run build
```

### Watch Mode (Future)
```bash
npm run watch
```

## Browser Compatibility

- ✅ Chrome/Chromium (Manifest V3)
- ✅ Microsoft Edge (Manifest V3)
- ⏳ Firefox (requires manifest.json modifications)
- ⏳ Safari (requires conversion)

## Future Enhancements

- [ ] Real-time template syncing with web app
- [ ] AI-powered cover letter suggestions
- [ ] Multi-language support
- [ ] Analytics and tracking
- [ ] Keyboard shortcuts

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: `storage`, `activeTab`
- **Host Permissions**: `https://www.upwork.com/*`

## License

This project is private and proprietary.
