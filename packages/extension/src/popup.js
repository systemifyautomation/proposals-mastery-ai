// Popup script - Template selection for extension
document.addEventListener('DOMContentLoaded', async () => {
  const templateSelect = document.getElementById('template-select');
  const statusEl = document.getElementById('status');
  const fillBtn = document.getElementById('fill-btn');
  const startRecordBtn = document.getElementById('start-record-btn');
  const uploadYoutubeBtn = document.getElementById('upload-youtube-btn');
  const recordingStatus = document.getElementById('recording-status');
  const videoLinksSection = document.getElementById('video-links');
  const linksContainer = document.getElementById('links-container');
  const tooltipEl = document.getElementById('tooltip');
  const settingsBtn = document.getElementById('settings-btn');

  let recordedVideoData = null;

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
      
      if (!tab.url || !tab.url.includes('upwork.com/nx/proposals/job')) {
        console.warn('[Popup] Not on Upwork application page. URL:', tab.url);
        showTooltip(fillBtn, 'Please navigate to an Upwork application page first');
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
      
      // Ensure content script is loaded
      const isReady = await ensureContentScript(tab.id);
      if (!isReady) {
        showTooltip(startRecordBtn, 'Failed to initialize extension on this page');
        return;
      }
      
      // Update UI immediately for better responsiveness
      startRecordBtn.disabled = true;
      startRecordBtn.textContent = '⏳ Starting...';
      
      chrome.tabs.sendMessage(tab.id, { action: 'startRecording' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Start recording error:', chrome.runtime.lastError.message);
          showTooltip(startRecordBtn, 'Please navigate to any webpage first. Recording works on all pages.');
          // Reset button state
          startRecordBtn.disabled = false;
          startRecordBtn.textContent = '🔴 Start Recording';
          return;
        }
        
        console.log('[Popup] Start recording response:', response);
        if (response && response.success) {
          startRecordBtn.disabled = true;
          startRecordBtn.textContent = '🔴 Recording...';
          recordingStatus.innerHTML = '🔴 Recording... <strong>Use the browser\'s stop button to finish</strong>';
          recordingStatus.style.display = 'block';
          showStatus('Recording started. Use browser stop button when done.', 'info');
          
          // Start polling for recording completion
          pollRecordingStatus();
        } else {
          showTooltip(startRecordBtn, 'Failed to start recording: ' + (response?.error || 'Unknown error'));
          // Reset button state
          startRecordBtn.disabled = false;
          startRecordBtn.textContent = '🔴 Start Recording';
        }
      });
    } catch (error) {
      console.error('[Popup] Exception starting recording:', error);
      showTooltip(startRecordBtn, 'Error: ' + error.message);
      // Reset button state
      startRecordBtn.disabled = false;
      startRecordBtn.textContent = '🔴 Start Recording';
    }
  });

  // Poll for recording completion (triggered by browser's stop button)
  let pollingInterval = null;
  
  function pollRecordingStatus() {
    if (pollingInterval) clearInterval(pollingInterval);
    
    pollingInterval = setInterval(async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;
        
        chrome.tabs.sendMessage(tab.id, { action: 'checkRecordingStatus' }, async (response) => {
          if (chrome.runtime.lastError || !response) return;
          
          // If recording stopped, get the video data
          if (!response.isRecording && response.hasRecording) {
            clearInterval(pollingInterval);
            console.log('[Popup] Recording stopped by user');
            
            // Get the recorded video
            chrome.tabs.sendMessage(tab.id, { action: 'getRecordedVideo' }, async (videoResponse) => {
              if (videoResponse && videoResponse.success) {
                recordedVideoData = videoResponse.data;
                startRecordBtn.disabled = false;
                startRecordBtn.textContent = '▶ Start Recording';
                recordingStatus.textContent = '✅ Recording complete!';
                
                // Get storage settings and handle accordingly
                const settings = await persistentStorage.load(['storageLocation']);
                const storageLocation = settings.storageLocation || 'local';
                
                let localPath = null;
                
                if (storageLocation === 'local' || storageLocation === 'both') {
                  localPath = downloadVideo(videoResponse.data);
                }
                
                if (storageLocation === 'youtube' || storageLocation === 'both') {
                  uploadYoutubeBtn.disabled = false;
                }
                
                // Display video links
                displayVideoLinks(localPath, storageLocation);
              }
            });
          }
        });
      } catch (error) {
        console.error('[Popup] Error polling:', error);
      }
    }, 1000);
  }
  
  // Display video links
  function displayVideoLinks(localPath, storageLocation) {
    linksContainer.innerHTML = '';
    
    if (localPath) {
      const localLink = document.createElement('div');
      localLink.className = 'video-link';
      localLink.textContent = `Local: ${localPath}`;
      localLink.style.cursor = 'default';
      linksContainer.appendChild(localLink);
    }
    
    if (storageLocation === 'youtube' || storageLocation === 'both') {
      const youtubeNote = document.createElement('div');
      youtubeNote.className = 'video-link';
      youtubeNote.textContent = 'YouTube: Click Upload button above';
      youtubeNote.style.cursor = 'default';
      linksContainer.appendChild(youtubeNote);
    }
    
    videoLinksSection.style.display = 'block';
  }

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

  // Upload to YouTube
  uploadYoutubeBtn.addEventListener('click', async () => {
    console.log('[Popup] Upload to YouTube button clicked');
    console.log('[Popup] Video data available:', !!recordedVideoData);
    
    if (!recordedVideoData) {
      console.warn('[Popup] No recorded video data');
      showTooltip(uploadYoutubeBtn, 'No recording available');
      return;
    }

    uploadYoutubeBtn.disabled = true;
    uploadYoutubeBtn.textContent = '⏳ Uploading...';
    recordingStatus.textContent = '⏳ Uploading to YouTube...';

    try {
      console.log('[Popup] Sending upload request to background script');
      // Send to background script to handle YouTube upload
      chrome.runtime.sendMessage({
        action: 'uploadToYouTube',
        videoData: recordedVideoData
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[Popup] Upload runtime error:', chrome.runtime.lastError.message);
          showTooltip(uploadYoutubeBtn, 'Error: ' + chrome.runtime.lastError.message);
          uploadYoutubeBtn.disabled = false;
          uploadYoutubeBtn.textContent = '📤 Upload to YouTube';
          recordingStatus.textContent = '❌ Upload failed. Try again.';
          return;
        }
        
        console.log('[Popup] Upload response:', response);
        if (response && response.success) {
          showStatus('Video uploaded to YouTube!', 'success');
          const youtubeUrl = `https://www.youtube.com/watch?v=${response.videoId}`;
          recordingStatus.innerHTML = `✅ Uploaded to YouTube!`;
          
          // Add YouTube link
          const youtubeLink = document.createElement('a');
          youtubeLink.href = youtubeUrl;
          youtubeLink.target = '_blank';
          youtubeLink.className = 'video-link';
          youtubeLink.textContent = `YouTube: ${response.videoId}`;
          
          // Replace "Click Upload" message with actual link
          const existingLinks = linksContainer.querySelectorAll('.video-link');
          existingLinks.forEach(link => {
            if (link.textContent.includes('Click Upload button')) {
              linksContainer.removeChild(link);
            }
          });
          linksContainer.appendChild(youtubeLink);
          
          recordedVideoData = null;
          uploadYoutubeBtn.disabled = true;
          uploadYoutubeBtn.textContent = '📤 Upload to YouTube';
        } else {
          showTooltip(uploadYoutubeBtn, 'Upload failed: ' + (response?.error || 'Unknown error'));
          uploadYoutubeBtn.disabled = false;
          uploadYoutubeBtn.textContent = '📤 Upload to YouTube';
          recordingStatus.textContent = '❌ Upload failed. Try again.';
        }
      });
    } catch (error) {
      console.error('[Popup] Exception uploading:', error);
      showTooltip(uploadYoutubeBtn, 'Error: ' + error.message);
      uploadYoutubeBtn.disabled = false;
      uploadYoutubeBtn.textContent = '📤 Upload to YouTube';
    }
  });

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
          recordingStatus.innerHTML = '🔴 Recording... <strong>Use the browser\'s stop button to finish</strong>';
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
  
  // Check recording status
  checkRecordingStatus();
  
  // Check if onboarding is complete
  checkOnboarding();
});

