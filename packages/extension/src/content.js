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

// Recording state
let mediaRecorder = null;
let recordedChunks = [];
let recordedVideoBlob = null;

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

// Generate and fill cover letter (called from popup)
async function generateAndFillCoverLetter() {
  console.log('[Content] generateAndFillCoverLetter called');
  
  try {
    const jobDetails = extractJobDetails();
    console.log('[Content] Job details extracted:', jobDetails);
    
    // Get profile and templates from Chrome storage
    const result = await chrome.storage.local.get(['selectedTemplate', 'userProfile']);
    console.log('[Content] Storage result:', result);
    
    const template = result.selectedTemplate;
    const profile = result.userProfile;

    if (!template) {
      console.error('[Content] No template found in storage');
      return { success: false, error: 'Please select a template first!' };
    }

    console.log('[Content] Using template:', template.name);

    // Generate cover letter by replacing placeholders
    let coverLetter = template.content;
    
    // Replace job placeholders
    coverLetter = coverLetter.replace(/\{\{JOB_TITLE\}\}/g, jobDetails.title || 'this position');
    coverLetter = coverLetter.replace(/\{\{JOB_DESCRIPTION\}\}/g, jobDetails.description || '');
    coverLetter = coverLetter.replace(/\{\{SKILLS\}\}/g, jobDetails.skills.join(', ') || '');
    
    // Replace profile placeholders if profile exists
    if (profile) {
      console.log('[Content] Applying profile data');
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
    } else {
      console.log('[Content] No profile data found');
    }

    console.log('[Content] Generated cover letter length:', coverLetter.length);
    console.log('[Content] Cover letter preview:', coverLetter.substring(0, 100) + '...');

    // Fill the cover letter field
    const success = await fillCoverLetter(coverLetter);
    
    if (success) {
      console.log('[Content] Cover letter filled successfully');
      return { success: true, message: 'Cover letter filled successfully!' };
    } else {
      console.error('[Content] Failed to fill cover letter field');
      return { success: false, error: 'Could not find the cover letter field.' };
    }
  } catch (error) {
    console.error('[Content] Error generating cover letter:', error);
    return { success: false, error: error.message };
  }
}

// Start screen recording
async function startRecording() {
  console.log('[Content] startRecording called');
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
      audio: true
    });
    
    console.log('[Content] Display media stream obtained');
    recordedChunks = [];
    
    // Find supported MIME type
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];
    
    let mimeType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        console.log('[Content] Using MIME type:', mimeType);
        break;
      }
    }
    
    mediaRecorder = mimeType 
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      console.log('[Content] Data available, size:', event.data.size);
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      console.log('[Content] MediaRecorder stopped by user (browser button)');
      
      // Create blob from chunks
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedVideoBlob = blob;
      console.log('[Content] Video blob saved, size:', blob.size);
      
      // Clean up stream
      stream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    console.log('[Content] Recording started successfully');
    return { success: true, message: 'Recording started' };
  } catch (error) {
    console.error('[Content] Error starting recording:', error);
    return { success: false, error: error.message };
  }
}

// Stop recording and return video blob
async function stopRecording() {
  console.log('[Content] stopRecording called');
  console.log('[Content] MediaRecorder state:', mediaRecorder?.state);
  console.log('[Content] Recorded chunks count:', recordedChunks?.length);
  
  return new Promise((resolve) => {
    if (!mediaRecorder) {
      console.error('[Content] No mediaRecorder instance');
      resolve({ success: false, error: 'No recording found. Please start recording first.' });
      return;
    }
    
    if (mediaRecorder.state === 'inactive') {
      console.error('[Content] MediaRecorder already inactive');
      resolve({ success: false, error: 'Recording is not active' });
      return;
    }
    
    console.log('[Content] Setting up onstop handler');
    // Set up the handler BEFORE stopping
    mediaRecorder.onstop = () => {
      console.log('[Content] onstop fired, chunks:', recordedChunks.length);
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      console.log('[Content] Blob created, size:', blob.size);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('[Content] FileReader complete, data length:', reader.result?.length);
        resolve({ success: true, data: reader.result });
      };
      reader.onerror = (error) => {
        console.error('[Content] FileReader error:', error);
        resolve({ success: false, error: 'Failed to read recording data' });
      };
      reader.readAsDataURL(blob);
    };
    
    console.log('[Content] Calling mediaRecorder.stop()');
    try {
      mediaRecorder.stop();
    } catch (error) {
      console.error('[Content] Error calling stop():', error);
      resolve({ success: false, error: error.message });
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] Received message:', request.action);
  
  // Ping check for content script availability
  if (request.action === 'ping') {
    sendResponse({ success: true });
    return true;
  }
  
  // Check recording status
  if (request.action === 'checkRecordingStatus') {
    const isRecording = mediaRecorder && mediaRecorder.state === 'recording';
    const hasRecording = recordedVideoBlob !== null;
    console.log('[Content] Recording status check - isRecording:', isRecording, 'hasRecording:', hasRecording);
    sendResponse({ isRecording: isRecording, hasRecording: hasRecording });
    return true;
  }
  
  // Get recorded video
  if (request.action === 'getRecordedVideo') {
    console.log('[Content] getRecordedVideo called, blob exists:', !!recordedVideoBlob);
    if (recordedVideoBlob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('[Content] Video blob converted to data URL, length:', reader.result?.length);
        sendResponse({ success: true, data: reader.result });
        // Clear the blob after sending
        recordedVideoBlob = null;
        recordedChunks = [];
      };
      reader.onerror = () => {
        console.error('[Content] Error reading video blob');
        sendResponse({ success: false, error: 'Failed to read video data' });
      };
      reader.readAsDataURL(recordedVideoBlob);
      return true; // Keep channel open for async response
    } else {
      sendResponse({ success: false, error: 'No recording available' });
      return true;
    }
  }
  
  if (request.action === 'generateAndFill') {
    generateAndFillCoverLetter().then(result => {
      console.log('[Content] Sending response:', result);
      sendResponse(result);
    }).catch(error => {
      console.error('[Content] Error in generateAndFill:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep the message channel open for async response
  } else if (request.action === 'startRecording') {
    startRecording().then(result => {
      console.log('[Content] Recording started:', result);
      sendResponse(result);
    }).catch(error => {
      console.error('[Content] Error starting recording:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'stopRecording') {
    stopRecording().then(result => {
      console.log('[Content] Recording stopped:', result);
      sendResponse(result);
    }).catch(error => {
      console.error('[Content] Error stopping recording:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } else if (request.action === 'getJobDetails') {
    const jobDetails = extractJobDetails();
    console.log('[Content] Job details requested:', jobDetails);
    sendResponse({ jobDetails });
    return true;
  } else if (request.action === 'fillCoverLetter') {
    fillCoverLetter(request.coverLetter).then(success => {
      console.log('[Content] Fill cover letter result:', success);
      sendResponse({ success });
    }).catch(error => {
      console.error('[Content] Error filling cover letter:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep the message channel open for async response
  }
  return true;
});

