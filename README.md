# Proposals Mastery AI

A platform for creating winning Upwork proposals with AI-powered templates and a browser extension.

## Features

### 🌐 Web Application
- **Proposal Templates**: Create and manage reusable proposal templates with dynamic placeholders
- **Profile Management**: Set up your freelancer or agency information (or both)
- **Upwork-Themed UI**: Clean, professional interface using Upwork's black, white, and green color scheme

### 🔧 Browser Extension
- **Job Analysis**: Automatically extract job details from Upwork job postings
- **Cover Letter Generation**: Generate customized cover letters using your templates
- **One-Click Application**: Streamline your Upwork proposal process

## Project Structure

```
proposals-mastery-ai/
├── packages/
│   ├── web/              # Next.js web application
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   └── public/       # Static assets
│   ├── extension/        # Chrome browser extension
│   │   ├── src/          # Extension source files
│   │   └── dist/         # Built extension (generated)
│   └── shared/           # Shared utilities (future)
└── package.json          # Monorepo configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/systemifyautomation/proposals-mastery-ai.git
cd proposals-mastery-ai
```

2. Install dependencies:
```bash
npm install
cd packages/web && npm install
cd ../extension && npm install
```

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