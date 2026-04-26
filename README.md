# Proposals Mastery AI - Chrome Extension

A powerful Chrome extension for automating Upwork proposals and recording your application process with flexible storage options.

## ✨ Features

### 🤖 Smart Cover Letter Generation
- **Auto-Fill on Upwork**: Automatically fill cover letters on Upwork application pages
- **Customizable Templates**: Create, edit, and manage multiple cover letter templates
- **Smart Placeholders**: Use dynamic placeholders like {{JOB_TITLE}}, {{NAME}}, {{BIO}}
- **Job Detail Extraction**: Automatically extracts job information from the page

### 📹 Screen Recording
- **One-Click Recording**: Record your screen with a single click
- **Flexible Storage Options**:
  - **Local Download**: Save recordings to your computer
  - **YouTube Upload**: Upload as unlisted videos to your YouTube account
  - **Both**: Download locally AND upload to YouTube
- **Privacy-First**: You control where your recordings go

### ⚙️ Powerful Settings
- **Onboarding Wizard**: Easy first-time setup experience
- **Template Manager**: Add, edit, and delete templates with a beautiful UI
- **Storage Preferences**: Choose how you want to save your recordings
- **YouTube Integration**: Optional YouTube upload with your own OAuth credentials

## 🚀 Quick Start

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/proposals-mastery-ai.git
   cd proposals-mastery-ai/packages/extension
   ```

2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### First-Time Setup

When you first open the extension, you'll see the onboarding screen:

1. **Choose Storage Location**:
   - Local Download (saves to your computer)
   - YouTube Upload (uploads as unlisted videos)
   - Both (downloads + uploads)

2. **Configure Templates**:
   - Use default templates or create your own
   - Add/edit/delete templates anytime

3. **YouTube Setup** (optional):
   - Only needed if you selected YouTube storage
   - Follow the in-app guide to set up Google OAuth
   - See `YOUTUBE_SETUP.md` for detailed instructions

## 📖 How to Use

### Generating Cover Letters

1. Navigate to an Upwork job application page
2. Click the extension icon in your browser
3. Select a template from the dropdown
4. Click "✨ Generate & Auto-Fill"
5. Your cover letter is automatically filled!

### Recording Your Screen

1. Click the extension icon
2. Click "🔴 Start Recording"
3. Select the screen/window to record
4. Complete your application
5. Click "⏹ Stop Recording"
6. Based on your settings:
   - **Local**: Video downloads automatically as `.webm`
   - **YouTube**: Click "📤 Upload to YouTube"
   - **Both**: Downloads automatically + upload button available

### Managing Settings

Click the **⚙️ Settings** icon in the extension popup to:

- Change recording storage preferences
- Add new cover letter templates
- Edit existing templates
- Delete unwanted templates
- Update YouTube credentials
- Customize all settings

## 🎯 Template Placeholders

Use these placeholders in your templates for dynamic content:

| Placeholder | Description |
|------------|-------------|
| `{{JOB_TITLE}}` | The job title from Upwork |
| `{{JOB_DESCRIPTION}}` | Full job description |
| `{{SKILLS}}` | Required skills (comma-separated) |
| `{{NAME}}` | Your name |
| `{{TITLE}}` | Your professional title |
| `{{YEARS_EXPERIENCE}}` | Years of experience |
| `{{PORTFOLIO}}` | Your portfolio URL |
| `{{BIO}}` | Your bio/description |
| `{{PROJECTS}}` | Your project list |
| `{{ACHIEVEMENTS}}` | Your achievements |

### Example Template

```
Hello!

I'm excited about {{JOB_TITLE}}. With {{YEARS_EXPERIENCE}} years of experience as a {{TITLE}}, I've successfully delivered projects for clients worldwide.

{{BIO}}

My relevant skills include: {{SKILLS}}

Portfolio: {{PORTFOLIO}}

I'd love to discuss how I can help with your project!

Best regards,
{{NAME}}
```

## 🔧 Project Structure

```
proposals-mastery-ai/
├── packages/
│   └── extension/        # Chrome extension
│       ├── src/
│       │   ├── background.js   # Service worker
│       │   ├── content.js      # Upwork page integration
│       │   ├── popup.js        # Extension popup logic
│       │   └── settings.js     # Settings page logic
│       ├── dist/              # Built extension
│       ├── manifest.json      # Extension manifest
│       ├── popup.html         # Popup UI
│       ├── settings.html      # Settings page UI
│       └── build.js           # Build script
└── README.md
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

### 1. Setup YouTube API (Optional - for video recording feature)

To use the YouTube upload feature, you need to:

1. G3. Using the Extension

1. **Go to an Upwork job application page**:
   - URL format: `https://www.upwork.com/nx/proposals/job/~{ID}/apply/`

2. **Click the extension icon** in your browser toolbar

3. **Select a template** from the dropdown

4. **Click "Generate & Auto-Fill"** to automatically fill the cover letter

5. **Optional: Record and Upload**:
   - Click "Start Recording" to record your screen
   - Click "Stop Recording" when done
   - Click "Upload to YouTube" to upload as unlisted video

6. **Go to an Upwork job application page**:
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