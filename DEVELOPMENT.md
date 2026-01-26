# Development Guide

This guide will help you get started with developing the Proposals Mastery AI platform.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Chrome/Edge browser (for testing the extension)

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/systemifyautomation/proposals-mastery-ai.git
cd proposals-mastery-ai

# Install root dependencies
npm install

# Install web app dependencies
cd packages/web
npm install

# Install extension dependencies
cd ../extension
npm install
```

## Development Workflow

### Web Application

The web application is built with Next.js 14 and uses the App Router.

```bash
# Start development server
cd packages/web
npm run dev
```

The app will be available at `http://localhost:3000`

**Available Pages:**
- `/` - Homepage with platform overview
- `/templates` - Manage proposal templates
- `/profile` - Set up freelancer/agency profile

**Key Features:**
- Server-side rendering with Next.js
- TypeScript for type safety
- Tailwind CSS for styling (Upwork theme)
- Client-side state management with React hooks

### Browser Extension

The extension uses Chrome Manifest V3.

```bash
# Build the extension
cd packages/extension
npm run build
```

**Loading in Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/extension/dist/`

**Testing:**
1. Navigate to any Upwork job posting
2. Look for the floating "Generate Cover Letter" button
3. Click the extension icon in the toolbar
4. Test template selection and cover letter generation

## Code Structure

### Web Application (`packages/web/`)

```
app/
├── globals.css          # Global styles
├── layout.tsx           # Root layout
├── page.tsx             # Homepage
├── templates/
│   └── page.tsx         # Template management
└── profile/
    └── page.tsx         # Profile management
```

### Browser Extension (`packages/extension/`)

```
src/
├── background.js        # Service worker
├── content.js           # Content script (Upwork pages)
├── content.css          # Content script styles
└── popup.js             # Popup logic
popup.html               # Popup UI
manifest.json            # Extension manifest
build.js                 # Build script
```

## Styling Guide

### Upwork Color Palette

```css
--upwork-green: #14a800;
--upwork-green-dark: #108a00;
--upwork-green-light: #5bbd72;
--upwork-black: #001e00;
--upwork-dark-gray: #1f1f1f;
--upwork-medium-gray: #6e6e6e;
--upwork-light-gray: #d4d4d4;
```

### Tailwind Configuration

Colors are defined in `tailwind.config.ts`:
```typescript
colors: {
  upwork: {
    green: '#14a800',
    'green-dark': '#108a00',
    // ...
  }
}
```

Use in components:
```tsx
<div className="bg-upwork-green text-white">
  <button className="hover:bg-upwork-green-dark">
    Click me
  </button>
</div>
```

## Testing

### Linting

```bash
# Lint web application
cd packages/web
npm run lint
```

### Building

```bash
# Build web application
cd packages/web
npm run build

# Build extension
cd packages/extension
npm run build
```

### Manual Testing

**Web App:**
1. Create a new template
2. Edit an existing template
3. Delete a template
4. Toggle between freelancer/agency/both profiles
5. Save profile information

**Extension:**
1. Load extension in Chrome
2. Navigate to a real Upwork job posting
3. Click "Generate Cover Letter" button
4. Select a template
5. Verify cover letter generation
6. Test copy to clipboard

## Common Development Tasks

### Adding a New Template Placeholder

1. Update the documentation in `/templates` page
2. Add the placeholder to template examples
3. Update extension's `popup.js` to handle the new placeholder

### Modifying the Upwork Theme

1. Update `tailwind.config.ts` with new colors
2. Update CSS variables in `globals.css`
3. Rebuild the application

### Adding a New Page

1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. Update navigation in the header
4. Add to sitemap (if needed)

## Troubleshooting

### Extension Not Loading

- Ensure you've built the extension (`npm run build`)
- Check Chrome DevTools for errors
- Verify manifest.json is valid
- Make sure you're on a Upwork job page

### Styles Not Updating

- Clear Next.js cache: `rm -rf .next`
- Restart the dev server
- Check Tailwind configuration

### TypeScript Errors

- Run `npm run build` to see all type errors
- Check `tsconfig.json` settings
- Ensure all dependencies are installed

## Next Steps

- Add backend API for data persistence
- Implement user authentication
- Add AI integration for better cover letters
- Add unit and integration tests
- Set up CI/CD pipeline

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
