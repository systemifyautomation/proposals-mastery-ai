# Proposals Mastery AI - Chrome Extension

Chrome browser extension for automatically generating and filling cover letters on Upwork application pages.

## Features

- ✅ **Auto-Fill Cover Letters**: Automatically fills the cover letter field on Upwork
- ✅ **Template System**: Built-in customizable templates
- ✅ **Job Detail Extraction**: Extracts job info from application pages
- ✅ **One-Click Operation**: Generate and fill with a single click

## Installation

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

## Usage

1. **Select a Template**: Click the extension icon and choose a template
2. **Go to Upwork**: Navigate to a job application page (`/nx/proposals/job/*/apply/`)
3. **Click the Button**: Click the green "AI Generate & Fill" floating button
4. **Submit**: Review the generated cover letter and submit!

## Templates

The extension includes 2 default templates:
- **Professional Template**: General purpose, formal tone
- **Technical Template**: For technical/development jobs

Templates support these placeholders:
- `{{JOB_TITLE}}` - Extracted from Upwork
- `{{JOB_DESCRIPTION}}` - Extracted from Upwork  
- `{{SKILLS}}` - Extracted from Upwork
- `{{NAME}}` - Your name
- `{{TITLE}}` - Your professional title
- `{{YEARS_EXPERIENCE}}` - Years of experience
- `{{BIO}}` - Your bio
- `{{PROJECTS}}` - Your projects
- `{{ACHIEVEMENTS}}` - Your achievements
- `{{PORTFOLIO}}` - Your portfolio URL

## Customization

You can customize templates by modifying the code in `src/popup.js` or by building your own template management system.

## Development

## Development

```bash
npm install
npm run build
```

The built extension will be in the `dist/` directory.

## Project Structure

```
extension/
├── src/
│   ├── background.js    # Service worker
│   ├── content.js       # Runs on Upwork pages, handles auto-fill
│   ├── content.css      # Floating button styles
│   └── popup.js         # Template selection popup
├── dist/                # Built extension (auto-generated)
├── manifest.json        # Extension configuration
├── popup.html          # Popup UI
└── build.js            # Build script
```

## How It Works

1. **Content Script** (`content.js`) runs on Upwork application pages
2. Adds a floating "AI Generate & Fill" button
3. When clicked, extracts job details from the page
4. Loads your selected template from Chrome storage
5. Replaces placeholders with job details and your profile data
6. Automatically fills the cover letter textarea

## Troubleshooting

**Button doesn't appear:**
- Make sure you're on `/nx/proposals/job/*/apply/` URL
- Refresh the page

**Cover letter field not filling:**
- Upwork may have changed their UI
- Check browser console for errors

**Template not loading:**
- Make sure you selected a template in the popup
- Check Chrome storage in DevTools

## Future Enhancements

- Web-based template editor (planned)
- Cloud sync
- AI-powered suggestions
- Success analytics
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
