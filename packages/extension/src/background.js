// Background service worker
console.log('Proposals Mastery AI: Background service worker loaded');

// YouTube API configuration
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // User needs to set this
const YOUTUBE_UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos';

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Upload video to YouTube
async function uploadToYouTube(videoData, accessToken) {
  try {
    // Convert base64 to blob
    const base64Data = videoData.split(',')[1];
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'video/webm' });

    // Prepare metadata
    const metadata = {
      snippet: {
        title: 'Upwork Proposal - ' + new Date().toISOString(),
        description: 'Automated recording from Proposals Mastery AI',
        categoryId: '22' // People & Blogs
      },
      status: {
        privacyStatus: 'unlisted' // Set to unlisted as requested
      }
    };

    // Create form data
    const formData = new FormData();
    formData.append('video', blob);
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

    // Upload to YouTube
    const response = await fetch(`${YOUTUBE_UPLOAD_URL}?uploadType=multipart&part=snippet,status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('YouTube upload failed: ' + response.statusText);
    }

    const result = await response.json();
    return { success: true, videoId: result.id };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

// Get YouTube OAuth token
async function getYouTubeToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'uploadToYouTube') {
    // Handle YouTube upload asynchronously
    (async () => {
      try {
        const token = await getYouTubeToken();
        const result = await uploadToYouTube(request.videoData, token);
        sendResponse(result);
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // Keep the message channel open
  }
  return true;
});
