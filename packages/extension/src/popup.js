// Popup script
document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const noJobEl = document.getElementById('no-job');
  const jobDetailsEl = document.getElementById('job-details');
  const jobTitleEl = document.getElementById('job-title');
  const jobDescriptionEl = document.getElementById('job-description');
  const templateSelect = document.getElementById('template-select');
  const generateBtn = document.getElementById('generate-btn');
  const resultSection = document.getElementById('result-section');
  const generatedLetterEl = document.getElementById('generated-letter');
  const copyBtn = document.getElementById('copy-btn');

  let currentJob = null;
  let templates = [];

  // Show loading
  loadingEl.style.display = 'block';
  noJobEl.style.display = 'none';
  jobDetailsEl.style.display = 'none';

  // Load templates from storage (in a real app, this would come from the web app)
  chrome.storage.local.get(['templates'], (result) => {
    templates = result.templates || [
      {
        id: '1',
        name: 'Web Development Template',
        content: 'Hello! I noticed your job posting for {{JOB_TITLE}}. With several years of experience in web development, I am confident I can deliver excellent results for your project.\n\nI have expertise in: {{SKILLS}}\n\nI would love to discuss your project further. Looking forward to hearing from you!',
      },
      {
        id: '2',
        name: 'General Template',
        content: 'Dear Hiring Manager,\n\nI am writing to express my interest in your project: {{JOB_TITLE}}.\n\n{{JOB_DESCRIPTION}}\n\nI believe I am a great fit for this role and would appreciate the opportunity to work with you.\n\nBest regards',
      },
    ];

    // Populate template dropdown
    templates.forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = template.name;
      templateSelect.appendChild(option);
    });
  });

  // Try to get job details from the current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (tab.url && tab.url.includes('upwork.com/jobs/')) {
      // Send message to content script to get job details
      chrome.tabs.sendMessage(tab.id, { action: 'getJobDetails' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not loaded yet
          showNoJob();
        } else if (response && response.jobDetails) {
          currentJob = response.jobDetails;
          showJobDetails();
        } else {
          showNoJob();
        }
      });
    } else {
      showNoJob();
    }
  } catch (error) {
    console.error('Error getting job details:', error);
    showNoJob();
  }

  function showNoJob() {
    loadingEl.style.display = 'none';
    noJobEl.style.display = 'block';
    jobDetailsEl.style.display = 'none';
  }

  function showJobDetails() {
    loadingEl.style.display = 'none';
    noJobEl.style.display = 'none';
    jobDetailsEl.style.display = 'block';

    if (currentJob) {
      jobTitleEl.textContent = currentJob.title || 'Not found';
      const descPreview = currentJob.description 
        ? currentJob.description.substring(0, 100) + '...' 
        : 'Not found';
      jobDescriptionEl.textContent = descPreview;
    }
  }

  // Enable generate button when template is selected
  templateSelect.addEventListener('change', () => {
    generateBtn.disabled = !templateSelect.value;
  });

  // Generate cover letter
  generateBtn.addEventListener('click', () => {
    const selectedTemplateId = templateSelect.value;
    const template = templates.find(t => t.id === selectedTemplateId);
    
    if (!template || !currentJob) return;

    // Replace placeholders with actual job data
    let coverLetter = template.content;
    coverLetter = coverLetter.replace(/{{JOB_TITLE}}/g, currentJob.title || '[Job Title]');
    coverLetter = coverLetter.replace(/{{JOB_DESCRIPTION}}/g, 
      currentJob.description ? currentJob.description.substring(0, 200) + '...' : '[Job Description]'
    );
    coverLetter = coverLetter.replace(/{{SKILLS}}/g, 
      currentJob.skills && currentJob.skills.length > 0 
        ? currentJob.skills.join(', ') 
        : '[Skills]'
    );
    coverLetter = coverLetter.replace(/{{BUDGET}}/g, currentJob.budget || '[Budget]');

    // Show result
    generatedLetterEl.textContent = coverLetter;
    resultSection.style.display = 'block';
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    const text = generatedLetterEl.textContent;
    try {
      await navigator.clipboard.writeText(text);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied!';
      copyBtn.style.backgroundColor = '#14a800';
      copyBtn.style.color = 'white';
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.backgroundColor = '';
        copyBtn.style.color = '';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  });
});
