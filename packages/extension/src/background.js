// Background service worker
console.log('Proposals Mastery AI: Background service worker loaded');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateCoverLetter') {
    // In a real implementation, this would call an API to generate the cover letter
    // For now, we'll just acknowledge the request
    console.log('Generate cover letter request received:', request.data);
    sendResponse({ success: true });
  }
  return true;
});
