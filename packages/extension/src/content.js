// Content script that runs on Upwork application pages
console.log('Proposals Mastery AI: Content script loaded on application page');

// Wait for the page to fully load and the cover letter field to be available
function waitForElement(selector, maxAttempts = 20) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      attempts++;
      
      if (element) {
        clearInterval(interval);
        resolve(element);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error(`Element ${selector} not found after ${maxAttempts} attempts`));
      }
    }, 500);
  });
}

// Extract job details from the application page
function extractJobDetails() {
  const jobDetails = {
    title: '',
    description: '',
    budget: '',
    skills: [],
    clientInfo: '',
  };

  // Try multiple selectors for job title
  const titleSelectors = [
    '[data-test="job-title"]',
    'h1',
    '.job-title',
    'h2[class*="title"]',
    '[class*="JobTitle"]'
  ];
  
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      jobDetails.title = element.textContent.trim();
      break;
    }
  }

  // Try to find job description
  const descriptionSelectors = [
    '[data-test="Description"]',
    '[data-test="job-description"]',
    '.description',
    '[class*="description"]'
  ];
  
  for (const selector of descriptionSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      jobDetails.description = element.textContent.trim();
      break;
    }
  }

  // Extract skills
  const skillElements = document.querySelectorAll('[data-test="Skill"], .skill, [class*="skill"]');
  jobDetails.skills = Array.from(skillElements)
    .map(el => el.textContent?.trim())
    .filter(Boolean);

  return jobDetails;
}

// Find and fill the cover letter textarea
async function fillCoverLetter(coverLetterText) {
  try {
    // Common selectors for Upwork's cover letter field
    const textareaSelectors = [
      'textarea[name="coverLetter"]',
      'textarea[placeholder*="cover letter"]',
      'textarea[placeholder*="Cover Letter"]',
      'textarea[aria-label*="cover letter"]',
      'textarea[id*="cover"]',
      'textarea[data-test="cover-letter"]',
      'textarea[class*="coverLetter"]',
      'textarea' // fallback to any textarea
    ];

    let textarea = null;
    for (const selector of textareaSelectors) {
      textarea = document.querySelector(selector);
      if (textarea) break;
    }

    if (!textarea) {
      // Try waiting for it to appear
      textarea = await waitForElement('textarea');
    }

    if (textarea) {
      // Set the value
      textarea.value = coverLetterText;
      
      // Trigger events to ensure Upwork's form detects the change
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      textarea.focus();
      
      console.log('Cover letter filled successfully');
      return true;
    } else {
      console.error('Could not find cover letter textarea');
      return false;
    }
  } catch (error) {
    console.error('Error filling cover letter:', error);
    return false;
  }
}

// Add a floating button to generate and fill cover letter
function addGenerateButton() {
  // Check if button already exists
  if (document.getElementById('proposals-mastery-button')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'proposals-mastery-button';
  button.className = 'proposals-mastery-generate-btn';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
    AI Generate & Fill
  `;

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerHTML = '⏳ Generating...';
    
    try {
      const jobDetails = extractJobDetails();
      
      // Get profile and templates from Chrome storage
      chrome.storage.local.get(['selectedTemplate', 'userProfile'], async (result) => {
        const template = result.selectedTemplate;
        const profile = result.userProfile;

        if (!template) {
          alert('Please select a template first! Click the extension icon to choose one.');
          button.disabled = false;
          button.innerHTML = 'AI Generate & Fill';
          return;
        }

        // Generate cover letter by replacing placeholders
        let coverLetter = template.content;
        
        // Replace job placeholders
        coverLetter = coverLetter.replace(/\{\{JOB_TITLE\}\}/g, jobDetails.title || 'this position');
        coverLetter = coverLetter.replace(/\{\{JOB_DESCRIPTION\}\}/g, jobDetails.description || '');
        coverLetter = coverLetter.replace(/\{\{SKILLS\}\}/g, jobDetails.skills.join(', ') || '');
        
        // Replace profile placeholders if profile exists
        if (profile) {
          const data = profile.profileType === 'agency' ? profile.agencyData : profile.freelancerData;
          
          coverLetter = coverLetter.replace(/\{\{NAME\}\}/g, data.name || data.agencyName || '');
          coverLetter = coverLetter.replace(/\{\{TITLE\}\}/g, data.title || '');
          coverLetter = coverLetter.replace(/\{\{YEARS_EXPERIENCE\}\}/g, data.yearsExperience || data.yearsInBusiness || '');
          coverLetter = coverLetter.replace(/\{\{SKILLS\}\}/g, data.skills || data.specializations || '');
          coverLetter = coverLetter.replace(/\{\{PORTFOLIO\}\}/g, data.portfolio || data.website || '');
          coverLetter = coverLetter.replace(/\{\{BIO\}\}/g, data.bio || data.description || '');
          
          // Add projects if available
          if (data.projects && data.projects.length > 0) {
            const projectsList = data.projects.map(p => 
              `- ${p.title}: ${p.results}`
            ).join('\n');
            coverLetter = coverLetter.replace(/\{\{PROJECTS\}\}/g, projectsList);
          }
          
          // Add achievements if available
          if (data.achievements && data.achievements.length > 0) {
            const achievementsList = data.achievements.join('\n- ');
            coverLetter = coverLetter.replace(/\{\{ACHIEVEMENTS\}\}/g, '- ' + achievementsList);
          }
        }

        // Fill the cover letter field
        const success = await fillCoverLetter(coverLetter);
        
        if (success) {
          button.innerHTML = '✓ Filled!';
          setTimeout(() => {
            button.innerHTML = 'AI Generate & Fill';
            button.disabled = false;
          }, 2000);
        } else {
          alert('Could not find the cover letter field. Make sure you\'re on the application page.');
          button.innerHTML = 'AI Generate & Fill';
          button.disabled = false;
        }
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Error generating cover letter. Please try again.');
      button.innerHTML = 'AI Generate & Fill';
      button.disabled = false;
    }
  });

  document.body.appendChild(button);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addGenerateButton);
} else {
  addGenerateButton();
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobDetails') {
    const jobDetails = extractJobDetails();
    sendResponse({ jobDetails });
  } else if (request.action === 'fillCoverLetter') {
    fillCoverLetter(request.coverLetter).then(success => {
      sendResponse({ success });
    });
    return true; // Keep the message channel open for async response
  }
  return true;
});

