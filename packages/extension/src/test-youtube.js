// Test YouTube upload functionality
let testStream = null;
let testRecorder = null;
let testChunks = [];
let testVideoData = null;
let oauthToken = null;

// Check if running in extension context
if (!chrome || !chrome.runtime || !chrome.runtime.id) {
  document.body.innerHTML = `
    <div style="background: #ffebee; color: #c62828; padding: 20px; border-radius: 8px; margin: 20px; max-width: 600px;">
      <h2>❌ Error: Not Running in Extension Context</h2>
      <p>This test page must be opened from within the Chrome extension.</p>
      <h3>How to open correctly:</h3>
      <ol>
        <li>Make sure extension is loaded in <code>chrome://extensions/</code></li>
        <li>Copy your Extension ID</li>
        <li>In a new tab, navigate to:<br>
            <code>chrome-extension://[YOUR-EXTENSION-ID]/test-youtube.html</code>
        </li>
      </ol>
      <p><strong>Or easier:</strong></p>
      <ol>
        <li>Click the extension icon in Chrome toolbar</li>
        <li>Right-click anywhere in the popup</li>
        <li>Select "Inspect"</li>
        <li>In the DevTools console, run:<br>
            <code>window.open('test-youtube.html')</code>
        </li>
      </ol>
    </div>
  `;
  throw new Error('Must run in extension context');
}

// Display extension ID
document.getElementById('extension-id').innerHTML = 
  `Extension ID: <strong>${chrome.runtime.id}</strong>
  <br><small>URL to this page: chrome-extension://${chrome.runtime.id}/test-youtube.html</small>`;

// Check OAuth configuration
function checkOAuthConfig() {
  const result = document.getElementById('oauth-result');
  try {
    const manifest = chrome.runtime.getManifest();
    
    if (!manifest.oauth2) {
      result.innerHTML = '<div class="error">❌ No OAuth2 configuration found in manifest</div>';
      return;
    }
    
    const clientId = manifest.oauth2.client_id;
    const scopes = manifest.oauth2.scopes;
    const redirectUrl = chrome.identity.getRedirectURL();
    
    let html = '<div class="success">✅ OAuth2 Configuration Found</div>';
    html += '<pre>';
    html += `Client ID: ${clientId}\n`;
    html += `Scopes: ${JSON.stringify(scopes, null, 2)}\n`;
    html += `\nExtension ID: ${chrome.runtime.id}\n`;
    html += `Redirect URI: ${redirectUrl}\n\n`;
    html += `⚠️ IMPORTANT: Add this Redirect URI to OAuth credentials:\n`;
    html += `1. Go to: https://console.cloud.google.com/apis/credentials\n`;
    html += `2. Click on your OAuth client ID\n`;
    html += `3. Add this URI to "Authorized redirect URIs":\n`;
    html += `   ${redirectUrl}\n`;
    html += `4. Click SAVE\n\n`;
    html += `Note: Different browsers = different Extension IDs = different Redirect URIs`;
    html += '</pre>';
    
    result.innerHTML = html;
  } catch (error) {
    result.innerHTML = `<div class="error">❌ Error reading manifest: ${error.message}</div>`;
  }
}

// Test OAuth token
async function testOAuthToken() {
  const result = document.getElementById('token-result');
  result.innerHTML = '<div>⏳ Requesting OAuth token via background script...</div>';
  
  try {
    // Request token through background script (identity API works better there)
    const response = await chrome.runtime.sendMessage({ 
      action: 'getOAuthToken'
    });
    
    if (!response || !response.token) {
      throw new Error(response?.error || 'Failed to get OAuth token');
    }
    
    const token = response.token;
    oauthToken = token;
    document.getElementById('upload-btn').disabled = false;
    
    result.innerHTML = `
      <div class="success">✅ OAuth Token Obtained!</div>
      <pre>Token (first 50 chars): ${token.substring(0, 50)}...
      
Token length: ${token.length} characters
      
✅ You're authenticated! You can now test upload.</pre>
    `;
  } catch (error) {
    result.innerHTML = `
      <div class="error">❌ OAuth Failed</div>
      <pre>Error: ${error.message || JSON.stringify(error)}

Common causes:
1. Extension ID mismatch - Check that Extension ID above matches Google Cloud
2. OAuth consent screen not configured
3. YouTube Data API v3 not enabled
4. Test user not added

Fix these in: https://console.cloud.google.com/</pre>
    `;
  }
}

// Start test recording
async function startTestRecording() {
  const result = document.getElementById('recording-result');
  try {
    testStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
    
    const preview = document.getElementById('preview');
    preview.srcObject = testStream;
    preview.style.display = 'block';
    preview.play();
    
    testChunks = [];
    testRecorder = new MediaRecorder(testStream);
    
    testRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) testChunks.push(e.data);
    };
    
    testRecorder.onstop = () => {
      const blob = new Blob(testChunks, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        testVideoData = reader.result;
        document.getElementById('upload-btn').disabled = !oauthToken;
        result.innerHTML = `<div class="success">✅ Recording saved! Size: ${blob.size} bytes</div>`;
      };
      reader.readAsDataURL(blob);
      
      testStream.getTracks().forEach(track => track.stop());
      preview.style.display = 'none';
    };
    
    testRecorder.start();
    document.getElementById('stop-btn').disabled = false;
    result.innerHTML = '<div class="success">🔴 Recording... (will auto-stop in 5 seconds)</div>';
    
    // Auto stop after 5 seconds
    setTimeout(() => {
      if (testRecorder && testRecorder.state === 'recording') {
        stopTestRecording();
      }
    }, 5000);
    
  } catch (error) {
    result.innerHTML = `<div class="error">❌ Recording failed: ${error.message}</div>`;
  }
}

function stopTestRecording() {
  if (testRecorder && testRecorder.state === 'recording') {
    testRecorder.stop();
    document.getElementById('stop-btn').disabled = true;
  }
}

// Test upload
async function testUpload() {
  const result = document.getElementById('upload-result');
  
  if (!testVideoData) {
    result.innerHTML = '<div class="error">❌ No video recorded yet</div>';
    return;
  }
  
  if (!oauthToken) {
    result.innerHTML = '<div class="error">❌ No OAuth token. Click "Get OAuth Token" first</div>';
    return;
  }
  
  result.innerHTML = '<div>⏳ Uploading to YouTube...</div>';
  
  try {
    // Send to background script
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'uploadToYouTube',
        videoData: testVideoData
      }, resolve);
    });
    
    console.log('Upload response:', response);
    
    if (response && response.success) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${response.videoId}`;
      result.innerHTML = `
        <div class="success">✅ Upload Successful!</div>
        <pre>Video ID: ${response.videoId}
URL: <a href="${youtubeUrl}" target="_blank">${youtubeUrl}</a>

Privacy: Unlisted (not public, but shareable via link)</pre>
      `;
    } else {
      result.innerHTML = `
        <div class="error">❌ Upload Failed</div>
        <pre>Error: ${response?.error || 'Unknown error'}

Check the browser console (F12) for detailed logs.</pre>
      `;
    }
  } catch (error) {
    result.innerHTML = `
      <div class="error">❌ Upload Exception</div>
      <pre>${error.message}</pre>
    `;
  }
}

// Add event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('check-oauth-btn').addEventListener('click', checkOAuthConfig);
  document.getElementById('test-token-btn').addEventListener('click', testOAuthToken);
  document.getElementById('start-record-btn').addEventListener('click', startTestRecording);
  document.getElementById('stop-btn').addEventListener('click', stopTestRecording);
  document.getElementById('upload-btn').addEventListener('click', testUpload);
});
