// Content script that runs on Upwork job pages
console.log('Proposals Mastery AI: Content script loaded');

// Extract job details from the page
function extractJobDetails() {
  const jobDetails = {
    title: '',
    description: '',
    budget: '',
    skills: [],
    duration: '',
  };

  // Extract job title
  const titleElement = document.querySelector('[data-test="job-title"], h1, .job-title');
  if (titleElement) {
    jobDetails.title = titleElement.textContent?.trim() || '';
  }

  // Extract job description
  const descriptionElement = document.querySelector('[data-test="job-description"], .description, .job-description');
  if (descriptionElement) {
    jobDetails.description = descriptionElement.textContent?.trim() || '';
  }

  // Extract budget
  const budgetElement = document.querySelector('[data-test="budget"], .budget');
  if (budgetElement) {
    jobDetails.budget = budgetElement.textContent?.trim() || '';
  }

  // Extract skills
  const skillElements = document.querySelectorAll('[data-test="skill"], .skill-tag, .skills');
  jobDetails.skills = Array.from(skillElements).map(el => el.textContent?.trim() || '');

  return jobDetails;
}

// Add a floating button to analyze the job
function addAnalyzeButton() {
  // Check if button already exists
  if (document.getElementById('proposals-mastery-button')) {
    return;
  }

  const button = document.createElement('button');
  button.id = 'proposals-mastery-button';
  button.className = 'proposals-mastery-analyze-btn';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    Generate Cover Letter
  `;

  button.addEventListener('click', () => {
    const jobDetails = extractJobDetails();
    
    // Store job details in Chrome storage
    chrome.storage.local.set({ currentJob: jobDetails }, () => {
      console.log('Job details stored:', jobDetails);
      
      // Open popup or show notification
      alert('Job analyzed! Open the extension popup to generate your cover letter.');
    });
  });

  document.body.appendChild(button);
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addAnalyzeButton);
} else {
  addAnalyzeButton();
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getJobDetails') {
    const jobDetails = extractJobDetails();
    sendResponse({ jobDetails });
  }
  return true;
});
