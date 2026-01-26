# Quick Start Guide

Get up and running with Proposals Mastery AI in just a few minutes!

## 🚀 Installation

### Prerequisites
- Node.js 18 or higher installed on your computer
- A modern web browser (Chrome or Edge for the extension)

### Step 1: Set Up the Web Application

```bash
# Install dependencies
npm install
cd packages/web
npm install

# Start the development server
npm run dev
```

The web app will open at `http://localhost:3000`

### Step 2: Install the Browser Extension

```bash
# Build the extension
cd packages/extension
npm install
npm run build
```

Then in Chrome/Edge:
1. Go to `chrome://extensions/`
2. Turn on "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the `packages/extension/dist/` folder

## 📝 Using the Platform

### Create Your First Template

1. Open the web app at `http://localhost:3000`
2. Click **"Manage Templates"** or navigate to `/templates`
3. Click **"New Template"**
4. Enter a template name (e.g., "Web Development Proposal")
5. Write your template using placeholders:
   - `{{JOB_TITLE}}` - Will be replaced with the job title
   - `{{JOB_DESCRIPTION}}` - Will be replaced with job description
   - `{{SKILLS}}` - Will be replaced with required skills
   - `{{YOUR_NAME}}` - Add your name to personalize
6. Click **"Create Template"**

**Example Template:**
```
Hello!

I noticed your job posting for {{JOB_TITLE}}. With 5+ years of experience in web development, I am confident I can deliver excellent results for your project.

Your requirements: {{JOB_DESCRIPTION}}

I have expertise in: {{SKILLS}}

I would love to discuss your project further. Looking forward to hearing from you!

Best regards,
{{YOUR_NAME}}
```

### Set Up Your Profile

1. Navigate to `/profile` or click **"Edit Profile"**
2. Choose your profile type:
   - **Freelancer** - Individual contractor
   - **Agency** - Company/team
   - **Both** - If you work as both
3. Fill in your information:
   - **Freelancer**: Name, title, years of experience, skills, portfolio, bio
   - **Agency**: Name, size, years in business, specializations, website, description
4. Click **"Save Profile"**

### Use the Extension on Upwork

1. Navigate to any Upwork job posting (e.g., `https://www.upwork.com/jobs/...`)
2. You'll see a floating green button **"Generate Cover Letter"**
3. Click the extension icon in your toolbar
4. The extension will show:
   - Job title extracted from the page
   - Job description preview
   - Your saved templates
5. Select a template from the dropdown
6. Click **"Generate Cover Letter"**
7. Review the generated letter
8. Click **"Copy to Clipboard"**
9. Paste into your Upwork proposal!

## 🎨 Upwork Theme

The platform uses Upwork's signature colors:
- **Green** (#14a800) - Primary actions and highlights
- **Black** (#001e00) - Headers and important text
- **White** - Clean backgrounds
- **Gray shades** - Secondary text and borders

## 💡 Tips for Success

### Template Best Practices
- ✅ Keep templates flexible with multiple placeholders
- ✅ Create different templates for different job types
- ✅ Include your unique value proposition
- ✅ Keep it concise (200-300 words)
- ❌ Don't be too generic
- ❌ Avoid overly long templates

### Writing Great Proposals
1. **Personalize**: Always reference the specific job
2. **Show expertise**: Mention relevant skills and experience
3. **Be professional**: Use proper grammar and formatting
4. **Include a CTA**: End with a call to action
5. **Proofread**: Always review before sending

### Placeholder Reference

| Placeholder | Description | Example |
|------------|-------------|---------|
| `{{JOB_TITLE}}` | Job posting title | "Full Stack Developer" |
| `{{JOB_DESCRIPTION}}` | Job description (preview) | "We need a developer for..." |
| `{{SKILLS}}` | Required skills | "React, Node.js, MongoDB" |
| `{{BUDGET}}` | Job budget | "$500 - $1000" |
| `{{YOUR_NAME}}` | Your name | "John Doe" |
| `{{COMPANY_NAME}}` | Client's company | "Acme Corp" |

You can add any custom placeholders you like!

## 🔧 Troubleshooting

### Extension Not Working
- Make sure you're on a Upwork job page (`/jobs/` URL)
- Refresh the page after installing the extension
- Check if the extension is enabled in `chrome://extensions/`

### Template Not Saving
- Ensure both name and content are filled in
- Templates are currently stored in browser memory
- Check the browser console for errors

### Styling Issues
- Clear browser cache and reload
- Make sure Tailwind CSS is properly configured
- Check that the dev server is running

## 🚀 Next Steps

Now that you're set up:

1. **Create multiple templates** for different job types
2. **Customize your profile** with your best skills
3. **Test on real Upwork jobs** to refine your templates
4. **Track your success** and update templates based on what works

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Development Guide**: See `DEVELOPMENT.md`
- **Extension README**: See `packages/extension/README.md`

## 🆘 Need Help?

- Check the documentation files
- Review the code examples
- Look at the default templates for inspiration

---

**Happy proposing! Win more projects with Proposals Mastery AI! 🎉**
