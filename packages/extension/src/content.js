// Content script that runs on all pages for recording and Upwork application page features
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
    'h3[data-v-45c81e35]',  // Specific selector from user's example
    '[data-test="job-title"]',
    'h3.h5',
    'h1',
    'h2',
    'h3',
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
    '#air3-truncation-1',  // New Upwork truncation format
    '.description [id^="air3-truncation"]',  // Any air3-truncation ID
    '.description.text-body-sm',
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

// Extract just the job title (simplified version)
function extractJobTitle() {
  const titleSelectors = [
    'h3[data-v-45c81e35]',
    '[data-test="job-title"]',
    'h3.h5',
    'h1',
    'h2',
    'h3',
    '.job-title',
    'h2[class*="title"]',
    '[class*="JobTitle"]'
  ];
  
  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      return element.textContent.trim();
    }
  }
  
  // Fallback to page title if no heading found
  return document.title || 'Screen Recording';
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
async function startRecording(mode = 'screen') {
  console.log('[Content] startRecording called with mode:', mode);
  try {
    let videoStream = null;
    let audioStream = null;
    
    // Get screen stream for screen and both modes
    if (mode === 'screen' || mode === 'both') {
      try {
        videoStream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: true
        });
        console.log('[Content] Screen stream obtained');
      } catch (screenError) {
        console.error('[Content] Screen capture error:', screenError);
        console.error('[Content] Error name:', screenError.name);
        console.error('[Content] Error message:', screenError.message);
        
        // Check if user cancelled
        if (screenError.name === 'NotAllowedError' || screenError.message.includes('denied')) {
          return { success: false, error: 'Screen recording permission denied or cancelled by user' };
        }
        throw screenError;
      }
    }
    
    // Get camera stream for camera and both modes
    if (mode === 'camera' || mode === 'both') {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: mode === 'camera' // Only use camera audio if camera-only
        });
        console.log('[Content] Camera stream obtained');
        
        // Save camera state to storage so other tabs can show overlay
        await chrome.storage.local.set({ 
          cameraActive: true,
          recordingMode: mode
        });
        
        if (mode === 'both') {
          // Create camera overlay for "both" mode
          createCameraOverlay(cameraStream);
          
          // Notify other tabs to show camera overlay
          chrome.runtime.sendMessage({ 
            action: 'showCameraOnAllTabs',
            mode: mode
          });
        } else {
          // Camera-only mode
          videoStream = cameraStream;
        }
      } catch (cameraError) {
        console.error('[Content] Camera error:', cameraError);
        console.error('[Content] Error name:', cameraError.name);
        console.error('[Content] Error message:', cameraError.message);
        
        // Check if user cancelled or denied permission
        if (cameraError.name === 'NotAllowedError' || cameraError.message.includes('denied')) {
          return { success: false, error: 'Camera permission denied or cancelled by user' };
        }
        throw cameraError;
      }
    }
    
    if (!videoStream) {
      throw new Error('Failed to obtain video stream');
    }
    
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
      ? new MediaRecorder(videoStream, { mimeType })
      : new MediaRecorder(videoStream);
    
    mediaRecorder.ondataavailable = (event) => {
      console.log('[Content] Data available, size:', event.data.size);
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      console.log('[Content] MediaRecorder stopped by user (browser button)');
      
      // Immediately remove camera overlay and clear active state
      chrome.storage.local.set({ cameraActive: false });
      removeCameraOverlay();
      console.log('[Content] Camera overlay removed immediately after recording stopped');
      
      // Create blob from chunks
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      recordedVideoBlob = blob;
      console.log('[Content] Video blob created, size:', blob.size);
      
      // Upload directly to YouTube instead of storing locally
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const videoData = reader.result;
          console.log('[Content] Video converted to data URL, uploading to YouTube...');
          
          // Get video title from page
          const title = extractJobTitle() || 'Screen Recording - ' + new Date().toISOString();
          
          // Send directly to background script for YouTube upload
          chrome.runtime.sendMessage({
            action: 'uploadToYouTube',
            videoData: videoData,
            videoTitle: title,
            timestamp: Date.now()
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('[Content] Error starting upload:', chrome.runtime.lastError);
            } else {
              console.log('[Content] Upload started, will clean up camera overlay when complete');
            }
          });
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('[Content] Error converting/uploading video:', error);
      }
      
      // Clean up stream
      videoStream.getTracks().forEach(track => track.stop());
    };
    
    mediaRecorder.start();
    console.log('[Content] Recording started successfully');
    return { success: true, message: 'Recording started' };
  } catch (error) {
    console.error('[Content] Error starting recording:', error);
    console.error('[Content] Error name:', error.name);
    console.error('[Content] Error message:', error.message);
    console.error('[Content] Error stack:', error.stack);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.name === 'NotAllowedError') {
      userMessage = 'Permission denied. Please allow screen/camera access.';
    } else if (error.name === 'NotFoundError') {
      userMessage = 'No camera or screen found.';
    } else if (error.name === 'NotReadableError') {
      userMessage = 'Camera or screen is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      userMessage = 'Camera settings not supported.';
    } else if (error.name === 'SecurityError') {
      userMessage = 'Recording blocked for security reasons.';
    }
    
    return { success: false, error: userMessage };
  }
}

// Create circular camera overlay (Loom-style)
function createCameraOverlay(cameraStream) {
  // Remove existing overlay if any
  removeCameraOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'pm-camera-overlay';
  
  // Load saved position and size
  chrome.storage.local.get(['cameraOverlaySize', 'cameraOverlayPosition'], (result) => {
    const size = result.cameraOverlaySize || 150;
    const position = result.cameraOverlayPosition || { bottom: 20, right: 20 };
    
    overlay.style.cssText = `
      position: fixed;
      bottom: ${position.bottom}px;
      right: ${position.right}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(76, 175, 80, 0.5);
      z-index: 999999;
      cursor: move;
      border: 3px solid rgba(76, 175, 80, 0.8);
    `;
    
    // Add hover effect to show it's interactive
    overlay.addEventListener('mouseenter', () => {
      overlay.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(76, 175, 80, 0.9)';
      overlay.style.borderColor = 'rgba(76, 175, 80, 1)';
    });
    overlay.addEventListener('mouseleave', () => {
      overlay.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 3px rgba(76, 175, 80, 0.5)';
      overlay.style.borderColor = 'rgba(76, 175, 80, 0.8)';
    });
  });
  
  const video = document.createElement('video');
  video.srcObject = cameraStream;
  video.autoplay = true;
  video.muted = true;
  video.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1); /* Mirror the camera */
    pointer-events: none;
  `;
  
  // Add resize handle with better visibility
  const resizeHandle = document.createElement('div');
  resizeHandle.style.cssText = `
    position: absolute;
    bottom: 0px;
    right: 0px;
    width: 35px;
    height: 35px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border-radius: 0 0 50% 0;
    cursor: nwse-resize;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: white;
    font-weight: bold;
    user-select: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: all 0.2s ease;
  `;
  resizeHandle.innerHTML = '⇱';
  resizeHandle.title = 'Drag to resize';
  
  // Add hover effect
  resizeHandle.addEventListener('mouseenter', () => {
    resizeHandle.style.background = 'linear-gradient(135deg, #5CBF60 0%, #55b059 100%)';
    resizeHandle.style.transform = 'scale(1.1)';
  });
  resizeHandle.addEventListener('mouseleave', () => {
    resizeHandle.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    resizeHandle.style.transform = 'scale(1)';
  });
  
  overlay.appendChild(video);
  overlay.appendChild(resizeHandle);
  document.body.appendChild(overlay);
  
  // Make it draggable
  makeDraggable(overlay);
  
  // Make it resizable
  makeResizable(overlay, resizeHandle);
  
  console.log('[Content] Camera overlay created');
}

// Remove camera overlay
function removeCameraOverlay() {
  const overlay = document.getElementById('pm-camera-overlay');
  if (overlay) {
    const video = overlay.querySelector('video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    overlay.remove();
    console.log('[Content] Camera overlay removed');
  }
}

// Make element draggable
function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  element.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    // Don't drag if clicking the resize handle
    if (e.target.innerHTML === '⇱' || e.target.innerHTML === '⇲') return;
    
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + 'px';
    element.style.left = (element.offsetLeft - pos1) + 'px';
    element.style.bottom = 'auto';
    element.style.right = 'auto';
  }
  
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    
    // Save position
    const rect = element.getBoundingClientRect();
    chrome.storage.local.set({
      cameraOverlayPosition: {
        bottom: window.innerHeight - rect.bottom,
        right: window.innerWidth - rect.right
      }
    });
  }
}

// Make element resizable
function makeResizable(element, handle) {
  let isResizing = false;
  let startX, startY, startSize;

  handle.onmousedown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startSize = element.offsetWidth;
    
    document.onmousemove = resize;
    document.onmouseup = stopResize;
  };

  function resize(e) {
    if (!isResizing) return;
    e.preventDefault();
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    const delta = Math.max(deltaX, deltaY);
    
    let newSize = startSize + delta;
    newSize = Math.max(80, Math.min(400, newSize)); // Constrain between 80px and 400px
    
    element.style.width = newSize + 'px';
    element.style.height = newSize + 'px';
  }

  function stopResize() {
    if (!isResizing) return;
    isResizing = false;
    
    // Save size
    chrome.storage.local.set({
      cameraOverlaySize: element.offsetWidth
    });
    
    document.onmousemove = null;
    document.onmouseup = null;
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

// Initialize: Check if camera should be active on this tab
(async () => {
  const result = await chrome.storage.local.get(['cameraActive', 'recordingMode']);
  if (result.cameraActive && (result.recordingMode === 'both' || result.recordingMode === 'camera')) {
    console.log('[Content] Camera is active, creating overlay on page load');
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      createCameraOverlay(cameraStream);
    } catch (error) {
      console.error('[Content] Failed to create camera overlay on init:', error);
    }
  }
})();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content] Received message:', request.action);
  
  // Ping check for content script availability
  if (request.action === 'ping') {
    sendResponse({ success: true });
    return true;
  }
  
  // Show camera overlay on this tab
  if (request.action === 'showCameraOverlay') {
    (async () => {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false // No audio needed for overlay
        });
        createCameraOverlay(cameraStream);
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Content] Failed to create camera overlay:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
  
  // Extract job title
  if (request.action === 'extractJobTitle') {
    const title = extractJobTitle();
    sendResponse({ title: title });
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
    const mode = request.mode || 'screen';
    startRecording(mode).then(result => {
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
      // Clear camera active state and remove overlay after successful stop
      chrome.storage.local.set({ cameraActive: false });
      removeCameraOverlay();
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

