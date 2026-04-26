// Background service worker
console.log('Proposals Mastery AI: Background service worker loaded');

// YouTube API configuration
const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos';

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Extension installed');
});

// Upload video to YouTube
async function uploadToYouTube(videoData, accessToken, videoTitle = null, retryCount = 0) {
  console.log('[Background] Starting YouTube upload...');
  console.log('[Background] Video data length:', videoData?.length);
  console.log('[Background] Access token exists:', !!accessToken);
  console.log('[Background] Video title:', videoTitle);
  console.log('[Background] Retry count:', retryCount);
  
  try {
    // Convert base64 to ArrayBuffer
    const base64Data = videoData.split(',')[1];
    if (!base64Data) {
      throw new Error('Invalid video data format');
    }
    
    console.log('[Background] Converting base64 to binary...');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log('[Background] Video bytes created, size:', bytes.length, 'bytes');

    // Prepare metadata with custom title
    const title = videoTitle || 'Upwork Proposal - ' + new Date().toISOString();
    const metadata = {
      snippet: {
        title: title,
        description: 'Automated recording from Proposals Mastery AI Chrome Extension',
        categoryId: '22' // People & Blogs
      },
      status: {
        privacyStatus: 'unlisted' // Set to unlisted as requested
      }
    };

    console.log('[Background] Uploading with metadata:', metadata);

    // Create multipart request body manually
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    // Build the multipart body as a single string/buffer
    const metadataPart = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata);

    const videoPart = delimiter +
      'Content-Type: video/webm\r\n\r\n';

    // Convert text parts to bytes
    const encoder = new TextEncoder();
    const metadataBytes = encoder.encode(metadataPart);
    const videoPartBytes = encoder.encode(videoPart);
    const closeDelimiterBytes = encoder.encode(closeDelimiter);
    
    // Combine all parts
    const totalLength = metadataBytes.length + videoPartBytes.length + bytes.length + closeDelimiterBytes.length;
    const multipartBody = new Uint8Array(totalLength);
    
    let offset = 0;
    multipartBody.set(metadataBytes, offset);
    offset += metadataBytes.length;
    multipartBody.set(videoPartBytes, offset);
    offset += videoPartBytes.length;
    multipartBody.set(bytes, offset);
    offset += bytes.length;
    multipartBody.set(closeDelimiterBytes, offset);

    console.log('[Background] Multipart request size:', totalLength, 'bytes');

    // Upload to YouTube
    const uploadUrl = `${YOUTUBE_UPLOAD_URL}?uploadType=multipart&part=snippet,status`;
    console.log('[Background] Uploading to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related; boundary=' + boundary
      },
      body: multipartBody
    });

    console.log('[Background] Upload response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Background] YouTube API error response:', errorText);
      
      // If 401 and this is the first attempt, clear cached token and retry
      if (response.status === 401 && retryCount === 0) {
        console.log('[Background] Token expired, clearing cache and retrying with fresh token...');
        await chrome.storage.local.remove(['youtubeAccessToken']);
        const newToken = await getYouTubeToken();
        return uploadToYouTube(videoData, newToken, videoTitle, 1);
      }
      
      throw new Error(`YouTube upload failed (${response.status}): ${errorText}`);
    }

    // Parse the response
    const responseText = await response.text();
    console.log('[Background] Raw YouTube API response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Background] Failed to parse YouTube response:', parseError);
      throw new Error('Invalid response from YouTube API');
    }
    
    console.log('[Background] Parsed YouTube API response:', result);
    
    if (!result.id) {
      console.error('[Background] No video ID in response. Full response:', JSON.stringify(result, null, 2));
      throw new Error('YouTube upload succeeded but no video ID was returned');
    }
    
    console.log('[Background] Upload successful! Video ID:', result.id);
    return { success: true, videoId: result.id };
  } catch (error) {
    console.error('[Background] Upload error:', error);
    console.error('[Background] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
}

// Global upload state
let uploadAbortController = null;

// Get YouTube OAuth token (cross-browser compatible with caching)
async function getYouTubeToken() {
  console.log('[Background] Requesting OAuth token...');
  
  // Check if OAuth is configured
  const manifest = chrome.runtime.getManifest();
  if (!manifest.oauth2 || manifest.oauth2.client_id === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    const errorMsg = 'YouTube OAuth not configured. Please follow these steps:\n\n' +
      '1. Go to https://console.cloud.google.com/\n' +
      '2. Create OAuth credentials for Chrome Extension\n' +
      '3. Update manifest.json with your Client ID\n' +
      '4. Run: npm run build\n' +
      '5. Reload extension\n\n' +
      'See YOUTUBE_SETUP.md for detailed instructions.';
    console.error('[Background]', errorMsg);
    throw new Error('OAuth not configured. Check console for setup instructions.');
  }
  
  // Try to get cached token first
  const cached = await chrome.storage.local.get(['youtubeAccessToken', 'tokenExpiresAt']);
  if (cached.youtubeAccessToken && cached.tokenExpiresAt) {
    // Check if token is still valid (with 5 min buffer)
    const isValid = cached.tokenExpiresAt > (Date.now() + 300000);
    if (isValid) {
      console.log('[Background] Using cached OAuth token (expires in', Math.round((cached.tokenExpiresAt - Date.now()) / 60000), 'minutes)');
      return cached.youtubeAccessToken;
    } else {
      console.log('[Background] Cached token expired, requesting new one');
      await chrome.storage.local.remove(['youtubeAccessToken', 'tokenExpiresAt']);
    }
  }
  
  console.log('[Background] No cached token, requesting new one');
  const clientId = manifest.oauth2.client_id;
  const scopes = manifest.oauth2.scopes.join(' ');
  const redirectURL = chrome.identity.getRedirectURL();
  
  console.log('[Background] Using launchWebAuthFlow for cross-browser compatibility');
  console.log('[Background] Redirect URL:', redirectURL);
  
  // Build OAuth URL
  const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('redirect_uri', redirectURL);
  authUrl.searchParams.set('scope', scopes);
  
  console.log('[Background] Auth URL:', authUrl.toString());
  
  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true
      },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          const errorMsg = chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError);
          console.error('[Background] OAuth error:', errorMsg);
          reject(new Error(errorMsg));
          return;
        }
        
        if (!responseUrl) {
          reject(new Error('No response URL received from OAuth'));
          return;
        }
        
        console.log('[Background] OAuth response received');
        
        // Extract access token from URL fragment
        const url = new URL(responseUrl);
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (!accessToken) {
          reject(new Error('No access token in OAuth response'));
          return;
        }
        
        console.log('[Background] Access token obtained, length:', accessToken.length);
        
        // Extract expiration time from response
        const expiresIn = params.get('expires_in') || '3600'; // Default 1 hour
        const expiresAt = Date.now() + (parseInt(expiresIn) * 1000);
        
        // Cache the token with expiration
        chrome.storage.local.set({ 
          youtubeAccessToken: accessToken,
          tokenExpiresAt: expiresAt
        });
        
        console.log('[Background] Token cached, expires in', expiresIn, 'seconds');
        
        resolve(accessToken);
      }
    );
  });
}

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request.action);
  
  if (request.action === 'getOAuthToken') {
    // Handle OAuth token request
    (async () => {
      try {
        console.log('[Background] Getting OAuth token for test page...');
        const token = await getYouTubeToken();
        console.log('[Background] Token obtained successfully');
        sendResponse({ token: token });
      } catch (error) {
        console.error('[Background] OAuth failed:', error);
        sendResponse({ error: error.message });
      }
    })();
    return true; // Keep the message channel open
  }
  
  if (request.action === 'showCameraOnAllTabs') {
    // Broadcast camera overlay to all tabs
    (async () => {
      try {
        console.log('[Background] Broadcasting camera overlay to all tabs');
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'showCameraOverlay' });
          } catch (err) {
            console.log('[Background] Could not send to tab', tab.id, ':', err.message);
          }
        }
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Failed to broadcast camera overlay:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  if (request.action === 'hideCameraOnAllTabs') {
    // Broadcast camera removal to all tabs so every open camera stream is released
    (async () => {
      try {
        console.log('[Background] Broadcasting camera overlay removal to all tabs');
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'hideCameraOverlay' });
          } catch (err) {
            // Tab may not have the content script injected – that's fine
          }
        }
        sendResponse({ success: true });
      } catch (error) {
        console.error('[Background] Failed to broadcast camera removal:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
  
  if (request.action === 'cancelUpload') {
    // Cancel ongoing upload
    console.log('[Background] Cancel upload requested. AbortController exists:', !!uploadAbortController);
    if (uploadAbortController) {
      uploadAbortController.abort();
      uploadAbortController = null;
      console.log('[Background] Upload aborted, setting status to cancelled');
      chrome.storage.local.set({ uploadStatus: 'cancelled' });
      sendResponse({ success: true });
    } else {
      console.log('[Background] No upload in progress to cancel');
      // Still set status to cancelled in case upload is stuck
      chrome.storage.local.set({ uploadStatus: 'cancelled' });
      sendResponse({ success: true, message: 'No active upload, status cleared' });
    }
    return true;
  }
  
  if (request.action === 'uploadToYouTube') {
    // Handle YouTube upload asynchronously
    sendResponse({ success: true, message: 'Upload started' });
    
    (async () => {
      try {
        // Set upload status
        await chrome.storage.local.set({ uploadStatus: 'uploading' });
        
        console.log('[Background] Getting OAuth token...');
        const token = await getYouTubeToken();
        
        console.log('[Background] Starting upload...');
        uploadAbortController = new AbortController();
        const result = await uploadToYouTube(request.videoData, token, request.videoTitle);
        
        uploadAbortController = null;
        console.log('[Background] Upload result:', result);
        
        if (result.success) {
          if (!result.videoId) {
            console.error('[Background] Upload succeeded but videoId is missing:', result);
            await chrome.storage.local.set({ uploadStatus: 'failed' });
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: 'Upload Failed',
              message: 'Upload completed but video ID was not returned.',
              priority: 2
            });
            return;
          }
          
          const youtubeUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
          console.log('[Background] Setting storage - uploadStatus: completed, youtubeUrl:', youtubeUrl);
          
          await chrome.storage.local.set({ 
            uploadStatus: 'completed',
            youtubeUrl: youtubeUrl
          });
          
          // Verify it was saved
          const verify = await chrome.storage.local.get(['uploadStatus', 'youtubeUrl']);
          console.log('[Background] Verified storage after save:', verify);
          console.log('[Background] Upload completed, URL saved:', youtubeUrl);
          
          // Show notification on upload success
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Upload Complete!',
            message: 'Your video has been successfully uploaded to YouTube.',
            priority: 2
          });
        } else {
          await chrome.storage.local.set({ uploadStatus: 'failed' });
          console.error('[Background] Upload failed:', result.error);
          
          // Show notification on upload failure
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Upload Failed',
            message: 'Failed to upload video to YouTube. Please try again.',
            priority: 2
          });
        }
      } catch (error) {
        uploadAbortController = null;
        
        // Check if error is from abort
        if (error.name === 'AbortError' || error.message.includes('aborted')) {
          console.log('[Background] Upload was cancelled by user');
          await chrome.storage.local.set({ uploadStatus: 'cancelled' });
        } else {
          console.error('[Background] Upload exception:', error);
          await chrome.storage.local.set({ uploadStatus: 'failed' });
        }
      }
    })();
    return true; // Keep the message channel open
  }
  return true;
});
