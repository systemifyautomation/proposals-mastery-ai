// Popup script - Template selection for extension
document.addEventListener('DOMContentLoaded', async () => {
  const templateSelect = document.getElementById('template-select');
  const statusEl = document.getElementById('status');
  const fillBtn = document.getElementById('fill-btn');
  const startRecordBtn = document.getElementById('start-record-btn');
  const cancelUploadBtn = document.getElementById('cancel-upload-btn');
  const recordingStatus = document.getElementById('recording-status');
  const videoLinksSection = document.getElementById('video-links');
  const linksContainer = document.getElementById('links-container');
  const clearRecordingBtn = document.getElementById('clear-recording-btn');
  const tooltipEl = document.getElementById('tooltip');
  const settingsBtn = document.getElementById('settings-btn');
  const videoTitleInput = document.getElementById('video-title');

  let pollingInterval = null;
  
  // Check upload status on popup open
  checkUploadStatus();
  
  // Extract and populate job title
  async function extractJobTitle() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      
      // Skip if on restricted pages (chrome://, chrome-extension://, etc.)
      if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:'))) {
        console.log('[Popup] Skipping job title extraction on restricted page');
        return;
      }
      
      chrome.tabs.sendMessage(tab.id, { action: 'extractJobTitle' }, (response) => {
        if (chrome.runtime.lastError) {
          // Silently ignore - content script not available on this page
          console.log('[Popup] Content script not available for job title extraction');
          return;
        }
        if (response && response.title) {
          videoTitleInput.value = response.title;
          console.log('[Popup] Job title extracted:', response.title);
        }
      });
    } catch (error) {
      console.error('[Popup] Error extracting job title:', error);
    }
  }
  
  // Check upload status and show UI accordingly
  async function checkUploadStatus() {
    const result = await chrome.storage.local.get(['uploadStatus', 'youtubeUrl']);
    console.log('[Popup] Checking upload status:', result);
    
    if (result.uploadStatus === 'uploading') {
      cancelUploadBtn.style.display = 'block';
      startRecordBtn.style.display = 'none';
      clearRecordingBtn.style.display = 'none';
      recordingStatus.innerHTML = '<div class="recording-status-card uploading"><div class="recording-status-icon"><i class="fas fa-upload"></i></div><div class="recording-status-text">Uploading to YouTube...</div></div>';
      recordingStatus.style.display = 'block';
      videoLinksSection.style.display = 'block';
      displayYouTubeLink('loading');
      
      // Start polling for upload completion - CRITICAL for when popup reopens
      pollRecordingStatus();
    } else if (result.uploadStatus === 'completed' && result.youtubeUrl) {
      cancelUploadBtn.style.display = 'none';
      startRecordBtn.style.display = 'block';
      clearRecordingBtn.style.display = 'block';
      recordingStatus.innerHTML = '<div class="recording-status-card"><div class="recording-status-icon"><i class="fas fa-check"></i></div><div class="recording-status-text">Uploaded to YouTube!</div></div>';
      recordingStatus.style.display = 'block';
      videoLinksSection.style.display = 'block';
      displayYouTubeLink(result.youtubeUrl);
    } else if (result.uploadStatus === 'failed') {
      cancelUploadBtn.style.display = 'none';
      startRecordBtn.style.display = 'block';
      clearRecordingBtn.style.display = 'block';
      recordingStatus.innerHTML = '<div class="recording-status-card" style="border-color: #dc3545; background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);"><div class="recording-status-icon" style="color: #dc3545;"><span class="icon icon-close"></span></div><div class="recording-status-text">Upload failed. Try again.</div></div>';
      recordingStatus.style.display = 'block';
    } else if (result.uploadStatus === 'cancelled') {
      cancelUploadBtn.style.display = 'none';
      startRecordBtn.style.display = 'block';
      clearRecordingBtn.style.display = 'block';
      recordingStatus.innerHTML = '<div class="recording-status-card" style="border-color: #ffc107; background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);"><div class="recording-status-icon" style="color: #ffc107;"><i class="fas fa-times"></i></div><div class="recording-status-text">Upload cancelled</div></div>';
      recordingStatus.style.display = 'block';
    } else {
      // No upload in progress or completed
      recordingStatus.style.display = 'none';
      videoLinksSection.style.display = 'none';
    }
  }
  
  // Poll upload status while uploading
  function startUploadStatusPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    
    console.log('[Popup] Starting upload status polling...');
    pollingInterval = setInterval(async () => {
      const result = await chrome.storage.local.get(['uploadStatus', 'youtubeUrl']);
      console.log('[Popup] Upload status check:', result.uploadStatus, 'URL:', result.youtubeUrl);
      
      if (result.uploadStatus === 'completed' || result.uploadStatus === 'failed' || result.uploadStatus === 'cancelled') {
        console.log('[Popup] Upload finished with status:', result.uploadStatus);
        clearInterval(pollingInterval);
        pollingInterval = null;
        checkUploadStatus();
      }
    }, 1000);
  }
  
  // Extract job title when popup opens
  extractJobTitle();
  
  // Cleanup on popup close
  window.addEventListener('unload', () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  });
  
  // Load saved recording mode preference
  async function loadRecordingMode() {
    const result = await chrome.storage.local.get(['recordingMode']);
    if (result.recordingMode) {
      const modeInput = document.querySelector(`input[name="recording-mode"][value="${result.recordingMode}"]`);
      if (modeInput) {
        modeInput.checked = true;
      }
    }
  }
  loadRecordingMode();

  // Check if onboarding is complete
  async function checkOnboarding() {
    const result = await persistentStorage.load(['onboardingComplete']);
    if (!result.onboardingComplete) {
      // Open settings page for onboarding
      chrome.runtime.openOptionsPage();
      window.close();
    }
  }

  // Open settings page
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Helper function to ensure content script is loaded
  async function ensureContentScript(tabId) {
    try {
      // Try to ping the content script
      await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      return true;
    } catch (error) {
      // Check for runtime error
      if (chrome.runtime.lastError) {
        console.log('[Popup] Content script not loaded:', chrome.runtime.lastError.message);
      }
      // Content script not loaded, inject it
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
        // Also inject CSS
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['content.css']
        });
        console.log('[Popup] Content script injected successfully');
        return true;
      } catch (injectionError) {
        console.error('[Popup] Failed to inject content script:', injectionError);
        return false;
      }
    }
  }

  // Show tooltip near element
  function showTooltip(element, message, type = 'error') {
    const rect = element.getBoundingClientRect();
    tooltipEl.textContent = message;
    tooltipEl.className = `tooltip ${type} show`;
    
    // Position tooltip above the button
    const tooltipWidth = 250;
    tooltipEl.style.left = `${rect.left + (rect.width / 2) - (tooltipWidth / 2)}px`;
    tooltipEl.style.top = `${rect.top - 40}px`;
    tooltipEl.style.width = `${tooltipWidth}px`;
    
    // Hide after 3 seconds
    setTimeout(() => {
      tooltipEl.classList.remove('show');
    }, 3000);
  }

  // Default templates - users can modify these or add their own
  const defaultTemplates = [
    {
      id: '1',
      name: 'Professional Template',
      content: `Hello!

I'm excited about {{JOB_TITLE}}. With {{YEARS_EXPERIENCE}} years of experience as a {{TITLE}}, I've delivered exceptional results for clients worldwide.

{{BIO}}

I'd love to discuss how I can help with your project.

Best regards,
{{NAME}}`
    },
    {
      id: '2',
      name: 'Technical Template',
      content: `Hi there!

I noticed your posting for {{JOB_TITLE}} and I'm confident I can deliver excellent results.

Relevant skills: {{SKILLS}}

{{BIO}}

Portfolio: {{PORTFOLIO}}

Looking forward to working together!`
    }
  ];

  // Load templates from storage or use defaults
  function loadTemplates() {
    console.log('[Popup] Loading templates...');
    
    try {
      persistentStorage.load(['templates', 'selectedTemplate']).then((result) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Chrome storage error:', chrome.runtime.lastError);
          showTooltip(templateSelect, 'Failed to load templates: ' + chrome.runtime.lastError.message);
          templateSelect.innerHTML = '<option value="">Error loading templates</option>';
          return;
        }

        console.log('[Popup] Storage result:', result);
        let templates = result.templates || defaultTemplates;
        console.log('[Popup] Using templates:', templates);
        
        // Save defaults if nothing in storage
        if (!result.templates) {
          console.log('[Popup] Saving default templates to storage');
          persistentStorage.save({ templates: defaultTemplates }).catch((error) => {
            console.error('[Popup] Failed to save defaults:', error);
          });
        }

        // Populate template dropdown
        templateSelect.innerHTML = '<option value="">Select a template...</option>';
        templates.forEach(template => {
          console.log('[Popup] Adding template to dropdown:', template.name);
          const option = document.createElement('option');
          option.value = template.id;
          option.textContent = template.name;
          templateSelect.appendChild(option);
        });

        console.log('[Popup] Templates loaded successfully. Count:', templates.length);

        // Pre-select previously selected template
        if (result.selectedTemplate) {
          console.log('[Popup] Pre-selecting template:', result.selectedTemplate.name);
          templateSelect.value = result.selectedTemplate.id;
          showStatus('Template loaded: ' + result.selectedTemplate.name, 'success');
        }
      }).catch((error) => {
        console.error('[Popup] Exception loading templates:', error);
        showTooltip(templateSelect, 'Exception: ' + error.message);
        templateSelect.innerHTML = '<option value="">Error loading templates</option>';
      });
    } catch (error) {
      console.error('[Popup] Exception loading templates:', error);
      showTooltip(templateSelect, 'Exception: ' + error.message);
      templateSelect.innerHTML = '<option value="">Error loading templates</option>';
    }
  }

  // Show status message
  function showStatus(message, type = 'info') {
    statusEl.textContent = message;
    statusEl.className = 'status ' + type;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }

  // When template is selected, save it to storage
  templateSelect.addEventListener('change', async () => {
    const selectedId = templateSelect.value;
    console.log('[Popup] Template changed, selected ID:', selectedId);
    
    if (!selectedId) return;

    try {
      const result = await persistentStorage.load(['templates']);
      const templates = result.templates || defaultTemplates;
      const selectedTemplate = templates.find(t => t.id === selectedId);
      console.log('[Popup] Selected template:', selectedTemplate);
      
      if (selectedTemplate) {
        await persistentStorage.save({ selectedTemplate });
        console.log('[Popup] Template saved successfully');
        showStatus('Template selected: ' + selectedTemplate.name, 'success');
      }
    } catch (error) {
      console.error('[Popup] Error saving template:', error);
      showTooltip(templateSelect, 'Error: ' + error.message);
    }
  });

  // Generate and fill cover letter
  fillBtn.addEventListener('click', async () => {
    console.log('[Popup] Fill button clicked');
    const selectedId = templateSelect.value;
    console.log('[Popup] Selected template ID:', selectedId);
    
    if (!selectedId) {
      console.warn('[Popup] No template selected');
      showTooltip(fillBtn, 'Please select a template first');
      return;
    }

    fillBtn.disabled = true;
    fillBtn.textContent = '⏳ Generating...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('[Popup] Current tab:', tab);
      
      // Check if on Upwork for auto-fill feature (recording works on all sites)
      const isUpworkJob = tab.url && tab.url.includes('upwork.com/nx/proposals/job');
      if (!isUpworkJob) {
        console.warn('[Popup] Not on Upwork application page. URL:', tab.url);
        showTooltip(fillBtn, 'Auto-fill only works on Upwork job pages');
        fillBtn.disabled = false;
        fillBtn.textContent = '✨ Generate & Auto-Fill';
        return;
      }

      // Ensure content script is loaded
      const isReady = await ensureContentScript(tab.id);
      if (!isReady) {
        showTooltip(fillBtn, 'Failed to initialize extension on this page');
        fillBtn.disabled = false;
        fillBtn.textContent = '✨ Generate & Auto-Fill';
        return;
      }

      console.log('[Popup] Sending generateAndFill message to content script');
      chrome.tabs.sendMessage(tab.id, { action: 'generateAndFill' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Runtime error:', chrome.runtime.lastError);
          showTooltip(fillBtn, 'Error: ' + chrome.runtime.lastError.message + ' (Make sure you\'re on an Upwork application page)');
        } else if (response && response.success) {
          console.log('[Popup] Success:', response.message);
          showStatus(response.message, 'success');
        } else {
          console.error('[Popup] Failed:', response);
          showTooltip(fillBtn, response?.error || 'Failed to fill cover letter');
        }
        fillBtn.disabled = false;
        fillBtn.textContent = '✨ Generate & Auto-Fill';
      });
    } catch (error) {
      console.error('[Popup] Exception:', error);
      showTooltip(fillBtn, 'Error: ' + error.message);
      fillBtn.disabled = false;
      fillBtn.textContent = '✨ Generate & Auto-Fill';
    }
  });

  // Start recording
  startRecordBtn.addEventListener('click', async () => {
    console.log('[Popup] Start recording button clicked');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('[Popup] Sending startRecording to tab:', tab.id);
      
      // Get selected recording mode
      const recordingMode = document.querySelector('input[name="recording-mode"]:checked').value;
      console.log('[Popup] Recording mode:', recordingMode);
      
      // Save recording mode preference
      await chrome.storage.local.set({ recordingMode: recordingMode });
      
      // Clear any previous recording data and reset UI
      await chrome.storage.local.remove(['youtubeUrl', 'uploadStatus']);
      
      // Stop any existing upload status polling
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      
      // Reset UI elements
      videoLinksSection.style.display = 'none';
      linksContainer.innerHTML = '';
      clearRecordingBtn.style.display = 'none';
      cancelUploadBtn.style.display = 'none';
      cancelUploadBtn.disabled = false;
      
      // Ensure content script is loaded
      const isReady = await ensureContentScript(tab.id);
      if (!isReady) {
        showTooltip(startRecordBtn, 'Failed to initialize extension on this page');
        return;
      }
      
      // Update UI immediately for better responsiveness
      startRecordBtn.disabled = true;
      startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Starting...';
      
      chrome.tabs.sendMessage(tab.id, { 
        action: 'startRecording',
        mode: recordingMode
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Start recording error:', chrome.runtime.lastError.message);
          showTooltip(startRecordBtn, 'Please navigate to any webpage first. Recording works on all pages.');
          // Reset button state
          startRecordBtn.disabled = false;
          startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Start Recording';
          return;
        }
        
        console.log('[Popup] Start recording response:', response);
        if (response && response.success) {
          startRecordBtn.disabled = true;
          startRecordBtn.innerHTML = '<i class="fas fa-video icon"></i>Recording...';
          recordingStatus.innerHTML = '<div class="recording-status-card" style="border-color: #dc3545; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);"><div class="recording-status-icon" style="color: #dc3545;"><span class="icon icon-video"></span></div><div class="recording-status-text">Recording... <strong>Use browser stop button to finish</strong></div></div>';
          recordingStatus.style.display = 'block';
          showStatus('Recording started. Use browser stop button when done.', 'info');
          
          // Start polling for recording completion
          pollRecordingStatus();
        } else {
          const errorMsg = response?.error || 'Unknown error';
          console.error('[Popup] Recording failed:', errorMsg);
          
          // Show detailed error message in status card
          recordingStatus.innerHTML = `<div class="recording-status-card" style="border-color: #dc3545; background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);"><div class="recording-status-icon" style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i></div><div class="recording-status-text"><strong>Recording Failed</strong><br>${errorMsg}</div></div>`;
          recordingStatus.style.display = 'block';
          
          showTooltip(startRecordBtn, errorMsg);
          // Reset button state
          startRecordBtn.disabled = false;
          startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Start Recording';
        }
      });
    } catch (error) {
      console.error('[Popup] Exception starting recording:', error);
      
      // Show error in status card
      recordingStatus.innerHTML = `<div class="recording-status-card" style="border-color: #dc3545; background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);"><div class="recording-status-icon" style="color: #dc3545;"><i class="fas fa-exclamation-triangle"></i></div><div class="recording-status-text"><strong>Error</strong><br>${error.message}</div></div>`;
      recordingStatus.style.display = 'block';
      
      showTooltip(startRecordBtn, 'Error: ' + error.message);
      // Reset button state
      startRecordBtn.disabled = false;
      startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Start Recording';
    }
  });

  // Poll for recording completion (triggered by browser's stop button)
  function pollRecordingStatus() {
    if (pollingInterval) clearInterval(pollingInterval);
    
    console.log('[Popup] Starting upload status polling...');
    pollingInterval = setInterval(async () => {
      try {
        // Check for upload status (no longer checking for saved video)
        const result = await chrome.storage.local.get(['uploadStatus', 'youtubeUrl']);
        console.log('[Popup] Poll check - uploadStatus:', result.uploadStatus, ', youtubeUrl:', result.youtubeUrl);
        
        if (result.uploadStatus === 'uploading') {
          // Show uploading UI (just the loading link, no status card)
          cancelUploadBtn.style.display = 'block';
          startRecordBtn.style.display = 'none';
          clearRecordingBtn.style.display = 'none';
          recordingStatus.style.display = 'none'; // Hide status during upload
          displayYouTubeLink('loading');
          videoLinksSection.style.display = 'block';
        } else if (result.uploadStatus === 'completed' && result.youtubeUrl) {
          // Upload complete!
          clearInterval(pollingInterval);
          pollingInterval = null;
          console.log('[Popup] Upload completed! URL:', result.youtubeUrl);
          
          startRecordBtn.disabled = false;
          startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Start Recording';
          recordingStatus.innerHTML = '<div class="recording-status-card"><div class="recording-status-icon"><i class="fas fa-check"></i></div><div class="recording-status-text">Uploaded to YouTube!</div></div>';
          recordingStatus.style.display = 'block';
          cancelUploadBtn.style.display = 'none';
          startRecordBtn.style.display = 'block';
          clearRecordingBtn.style.display = 'block';
          
          displayYouTubeLink(result.youtubeUrl);
          videoLinksSection.style.display = 'block';
          
          showStatus('Video uploaded to YouTube!', 'success');
        } else if (result.uploadStatus === 'failed') {
          clearInterval(pollingInterval);
          pollingInterval = null;
          startRecordBtn.disabled = false;
          startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Start Recording';
          cancelUploadBtn.style.display = 'none';
          startRecordBtn.style.display = 'block';
          clearRecordingBtn.style.display = 'block';
          recordingStatus.innerHTML = '<div class="recording-status-card" style="border-color: #dc3545; background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);"><div class="recording-status-icon" style="color: #dc3545;"><i class="fas fa-times"></i></div><div class="recording-status-text">Upload failed. Try again.</div></div>';
          recordingStatus.style.display = 'block';
        } else if (result.uploadStatus === 'cancelled') {
          clearInterval(pollingInterval);
          pollingInterval = null;
          startRecordBtn.disabled = false;
          startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Start Recording';
          cancelUploadBtn.style.display = 'none';
          startRecordBtn.style.display = 'block';
          clearRecordingBtn.style.display = 'block';
          recordingStatus.innerHTML = '<div class="recording-status-card" style="border-color: #ffc107; background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);"><div class="recording-status-icon" style="color: #ffc107;"><i class="fas fa-times"></i></div><div class="recording-status-text">Upload cancelled</div></div>';
          recordingStatus.style.display = 'block';
        }
      } catch (error) {
        console.error('[Popup] Error polling:', error);
      }
    }, 1000);
  }
  
  // Display video links
  function displayVideoLinks(localPath, storageLocation, youtubeUrl = null) {
    linksContainer.innerHTML = '';
    
    if (localPath) {
      const localLink = document.createElement('div');
      localLink.className = 'video-link';
      localLink.textContent = `Local: ${localPath}`;
      localLink.style.cursor = 'default';
      linksContainer.appendChild(localLink);
    }
    
    if (youtubeUrl) {
      const youtubeLink = document.createElement('a');
      youtubeLink.href = youtubeUrl;
      youtubeLink.target = '_blank';
      youtubeLink.className = 'video-link';
      youtubeLink.textContent = `YouTube: ${youtubeUrl.split('v=')[1]}`;
      linksContainer.appendChild(youtubeLink);
    } else if (storageLocation === 'youtube' || storageLocation === 'both') {
      const youtubeNote = document.createElement('div');
      youtubeNote.className = 'video-link';
      youtubeNote.textContent = 'YouTube: Click Upload button above';
      youtubeNote.style.cursor = 'default';
      linksContainer.appendChild(youtubeNote);
    }
    
    videoLinksSection.style.display = 'block';
  }

  // Clear recording and allow new one
  clearRecordingBtn.addEventListener('click', async () => {
    console.log('[Popup] Clearing recording');
    
    // Clear from chrome.storage
    await chrome.storage.local.remove(['youtubeUrl', 'uploadStatus']);
    
    // Stop upload status polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    
    // Reset UI
    videoLinksSection.style.display = 'none';
    linksContainer.innerHTML = '';
    startRecordBtn.disabled = false;
    cancelUploadBtn.style.display = 'none';
    cancelUploadBtn.disabled = false;
    recordingStatus.style.display = 'none';
    videoTitleInput.value = '';
    
    showStatus('Recording cleared. Ready for new recording.', 'info');
  });
  
  // Download video locally
  function downloadVideo(videoData) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `upwork-recording-${timestamp}.webm`;
    
    const a = document.createElement('a');
    a.href = videoData;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('[Popup] Video downloaded:', filename);
    return filename;
  }

  // Cancel upload handler
  cancelUploadBtn.addEventListener('click', async () => {
    console.log('[Popup] Cancel upload clicked');
    cancelUploadBtn.disabled = true;
    recordingStatus.innerHTML = '<div class="recording-status-card" style="border-color: #ffc107; background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);"><div class="recording-status-icon" style="color: #ffc107;"><i class="fas fa-times"></i></div><div class="recording-status-text">Cancelling upload...</div></div>';
    
    chrome.runtime.sendMessage({ action: 'cancelUpload' }, (response) => {
      console.log('[Popup] Cancel response:', response);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      // Wait a moment for background to update storage, then check status
      setTimeout(() => checkUploadStatus(), 500);
    });
  });
  
  // Display YouTube link with copy icon
  function displayYouTubeLink(youtubeUrl) {
    if (!youtubeUrl || youtubeUrl === 'loading') {
      console.log('[Popup] YouTube URL not ready yet, showing loading state');
      linksContainer.innerHTML = '<div class="video-item"><div class="video-icon"><i class="fas fa-spinner fa-spin"></i></div><div class="video-info"><div class="video-title">Waiting for YouTube URL...</div></div></div>';
      videoLinksSection.style.display = 'block';
      return;
    }
    
    linksContainer.innerHTML = '';
    
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    
    const videoIcon = document.createElement('div');
    videoIcon.className = 'video-icon';
    videoIcon.innerHTML = '<i class="fas fa-video"></i>';
    
    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-info';
    
    const videoTitle = document.createElement('div');
    videoTitle.className = 'video-title';
    const videoId = youtubeUrl.split('v=')[1] || 'Unknown';
    videoTitle.textContent = `YouTube: ${videoId}`;
    
    videoInfo.appendChild(videoTitle);
    
    const videoActions = document.createElement('div');
    videoActions.className = 'video-actions';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'icon-btn';
    viewBtn.innerHTML = '<i class="fas fa-external-link-alt"></i>';
    viewBtn.title = 'Open video';
    viewBtn.onclick = () => {
      window.open(youtubeUrl, '_blank');
    };
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'icon-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = 'Copy link';
    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(youtubeUrl);
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
        showTooltip(copyBtn, 'Failed to copy URL');
      }
    };
    
    videoActions.appendChild(viewBtn);
    videoActions.appendChild(copyBtn);
    
    videoItem.appendChild(videoIcon);
    videoItem.appendChild(videoInfo);
    videoItem.appendChild(videoActions);
    
    linksContainer.appendChild(videoItem);
    
    videoLinksSection.style.display = 'block';
    clearRecordingBtn.style.display = 'block';
  }

  // Load existing recording from storage
  async function loadExistingRecording() {
    try {
      // Load from chrome.storage instead of content script
      const result = await chrome.storage.local.get(['recordedVideo', 'recordedTimestamp', 'youtubeUrl']);
      
      if (result.recordedVideo) {
        console.log('[Popup] Found existing recording from:', new Date(result.recordedTimestamp).toLocaleString());
        
        // Restore video data
        recordedVideoData = result.recordedVideo;
        
        // Update UI
        startRecordBtn.disabled = false;
        startRecordBtn.innerHTML = '<span class="icon icon-play"></span>Start Recording';
        recordingStatus.innerHTML = '<div class="recording-status-card"><div class="recording-status-icon"><i class="fas fa-check"></i></div><div class="recording-status-text">Recording ready<div class="recording-status-time">' + new Date(result.recordedTimestamp).toLocaleString() + '</div></div></div>';
        recordingStatus.style.display = 'block';
        
        // If already uploaded, show YouTube link
        if (result.youtubeUrl) {
          uploadYoutubeBtn.disabled = true;
          uploadYoutubeBtn.innerHTML = '<span class="icon icon-check"></span>Uploaded';
          displayYouTubeLink(result.youtubeUrl);
        } else {
          uploadYoutubeBtn.disabled = false;
        }
        
        // Show clear button and video links section
        videoLinksSection.style.display = 'block';
        clearRecordingBtn.style.display = 'block';
      }
    } catch (error) {
      console.error('[Popup] Error loading existing recording:', error);
    }
  }
  
  // Check if recording is in progress when popup opens
  async function checkRecordingStatus() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      
      // Try to check recording status
      chrome.tabs.sendMessage(tab.id, { action: 'checkRecordingStatus' }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not available, ignore
          console.log('[Popup] Could not check recording status');
          return;
        }
        
        if (response && response.isRecording) {
          console.log('[Popup] Recording is in progress, updating UI');
          startRecordBtn.disabled = true;
          recordingStatus.innerHTML = '<div class="recording-status-card" style="border-color: #dc3545; background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);"><div class="recording-status-icon" style="color: #dc3545;"><span class="icon icon-video"></span></div><div class="recording-status-text">Recording... <strong>Use browser stop button to finish</strong></div></div>';
          recordingStatus.style.display = 'block';
          pollRecordingStatus();
        }
      });
    } catch (error) {
      console.log('[Popup] Error checking recording status:', error);
    }
  }

  // Load templates on startup
  loadTemplates();
  
  // Load existing recording if any
  loadExistingRecording();
  
  // Check recording status
  checkRecordingStatus();
  
  // Check if onboarding is complete
  checkOnboarding();
});

