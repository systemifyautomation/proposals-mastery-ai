# Proposals Mastery AI - Chrome Extension

Chrome browser extension for automatically generating and filling cover letters on Upwork application pages.

## Features

- ✅ **Auto-Fill Cover Letters**: Fill cover letters from the extension popup
- ✅ **Template System**: Built-in customizable templates
- ✅ **Job Detail Extraction**: Extracts job info from application pages
- ✅ **Screen Recording**: Record your screen while working
- ✅ **YouTube Upload**: Upload recordings as unlisted videos to your YouTube account
- ✅ **One-Click Operation**: Generate and fill from the popup

## Installation

1. **Setup YouTube API** (optional, for recording feature):
2. Build the extension:
   ```bash
   npm install
   npm run build
   ```

3. Build the extension:
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
2. **Fill Cover Letter**: Click "Generate & Auto-Fill" in the extension popup
4. **Record (Optional)**: Use the recording feature to capture your screen
5. **Upload to YouTube**: Upload recordings as unlisted videos
6. **Click the Button**: Click the green "AI Generate & Fill" floating button
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

## User clicks extension icon and selects a template
3. User clicks "Generate & Auto-Fill" button in popup
4. Extension extracts job details from the page
5. Loads selected template and replaces placeholders
6. Automatically fills the cover letter textarea
7. Optional: User can record screen and upload to YouTube as unlisted videoage
4. Loads your selected template from Chrome storage
5. Replaces placeholders with job details and your profile data
6. Automatically fills the cover letter textarea
Cover letter doesn't fill:**
- Make sure you're on `/nx/proposals/job/*/apply/` URL
- Select a template in the popup first
- Check browser console for errors

**Recording fails:**
- Grant screen recording permissions when prompted
- Refresh the page and try again

**YouTube upload fails:**
- Verify OAuth credentials in manifest.json
- Make sure YouTube Data API v3 is enabled
- Check that you authorized the extension
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
