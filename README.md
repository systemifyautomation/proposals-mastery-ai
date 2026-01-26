# Proposals Mastery AI - Chrome Extension

A Chrome browser extension for automatically generating and filling cover letters on Upwork application pages.

## Features

### 🔧 Browser Extension
- **Auto-Fill Cover Letters**: Automatically fills the cover letter field on Upwork application pages
- **Template System**: Use customizable templates with placeholders
- **Job Detail Extraction**: Automatically extracts job information from the application page
- **One-Click Generation**: Generate and fill cover letters with a single click

## Project Structure

```
proposals-mastery-ai/
├── packages/
│   └── extension/        # Chrome browser extension
│       ├── src/          # Extension source files
│       │   ├── background.js
│       │   ├── content.js
│       │   ├── content.css
│       │   └── popup.js
│       ├── dist/         # Built extension (generated)
│       ├── manifest.json
│       ├── popup.html
│       └── build.js
└── package.json          # Monorepo configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Chrome or Edge browser

### Installation

### Installation

1. Clone the repository:
```bash
git clone https://github.com/systemifyautomation/proposals-mastery-ai.git
cd proposals-mastery-ai
```

2. Install dependencies and build:
```bash
npm install
npm run build
```

3. Load the extension in Chrome/Edge:
   - Open `chrome://extensions/`
   - Turn on "Developer mode" (top-right toggle)
   - Click "Load unpacked"
   - Select the `packages/extension/dist/` folder

## How to Use

### 1. Prepare Your Templates

The extension comes with a default template system. You can customize templates by modifying the storage or creating your own management system.

### 2. Using the Extension

1. **Go to an Upwork job application page**:
   - URL format: `https://www.upwork.com/nx/proposals/job/~{ID}/apply/`

2. **Click the green floating "AI Generate & Fill" button** that appears on the page

3. The extension will:
   - Extract job details from the page
   - Generate a customized cover letter using your template
   - **Automatically fill the cover letter field**

4. Review and submit your proposal!

## Available Placeholders

Templates support the following placeholders:

| Placeholder | Description |
|-------------|-------------|
| `{{JOB_TITLE}}` | Job title extracted from Upwork |
| `{{JOB_DESCRIPTION}}` | Job description |
| `{{SKILLS}}` | Required skills |
| `{{NAME}}` | Your name |
| `{{TITLE}}` | Your professional title |
| `{{YEARS_EXPERIENCE}}` | Years of experience |
| `{{BIO}}` | Your bio |
| `{{PROJECTS}}` | List of projects |
| `{{ACHIEVEMENTS}}` | List of achievements |
| `{{PORTFOLIO}}` | Portfolio URL |

## Development

### Building the Extension

```bash
cd packages/extension
npm run build
```

The built extension will be in `packages/extension/dist/`

### Project Structure

```
extension/
├── src/
│   ├── background.js    # Service worker
│   ├── content.js       # Runs on Upwork application pages
│   ├── content.css      # Styles for content script
│   └── popup.js         # Extension popup interface
├── dist/                # Built extension (generated)
├── manifest.json        # Extension manifest
├── popup.html          # Popup UI
└── build.js            # Build script
```

## Future Enhancements

- Web app for template and profile management (planned for separate branch)
- Cloud sync for templates
- AI-powered template suggestions
- Analytics and success tracking

## License

MIT

### Running the Web Application

```bash
# From the root directory
npm run dev

# Or from packages/web
cd packages/web
npm run dev
```

The web app will be available at `http://localhost:3000`

### Building the Browser Extension

```bash
# From the root directory
npm run build:extension

# Or from packages/extension
cd packages/extension
npm run build
```

### Installing the Extension

1. Build the extension (see above)
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `packages/extension/dist` directory

## Usage

### Web Application

1. **Create Templates**: Navigate to the Templates page and create proposal templates with placeholders like `{{JOB_TITLE}}`, `{{YOUR_NAME}}`, etc.
2. **Set Up Profile**: Go to the Profile page and add your freelancer and/or agency information
3. **Use Templates**: Your templates will be available in the browser extension

### Browser Extension

1. Navigate to any Upwork job posting
2. Click the floating "Generate Cover Letter" button or open the extension popup
3. Select a template from your library
4. Click "Generate Cover Letter" to create a customized proposal
5. Copy the generated letter and paste it into your Upwork proposal

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS (Upwork theme: black, white, green)
- **Icons**: Lucide React
- **Extension**: Chrome Manifest V3

## Color Scheme (Upwork Theme)

- **Green**: `#14a800` (primary actions, highlights)
- **Green Dark**: `#108a00` (hover states)
- **Black**: `#001e00` (headers, primary text)
- **Dark Gray**: `#1f1f1f` (body text)
- **Medium Gray**: `#6e6e6e` (secondary text)
- **Light Gray**: `#d4d4d4` (borders, dividers)

## Development

### Web Application
- Uses Next.js App Router
- Client-side state management with React hooks
- Responsive design with Tailwind CSS

### Browser Extension
- Manifest V3 compliant
- Content script for Upwork job page analysis
- Popup interface for template selection and letter generation
- Chrome Storage API for data persistence

## Future Enhancements

- [ ] Backend API for data persistence
- [ ] User authentication
- [ ] AI-powered template suggestions
- [ ] Integration with OpenAI for enhanced cover letter generation
- [ ] Analytics and proposal tracking
- [ ] Multi-browser support (Firefox, Safari)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.