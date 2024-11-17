// Function to update the extension badge with pass/fail info
function updateBadge(passCount, failCount) {
  // If there are any failed tests, show a red badge with the number of failures
  if (failCount > 0) {
    chrome.action.setBadgeBackgroundColor({ color: 'red' });
    chrome.action.setBadgeText({ text: `${failCount}` });
  } else {
    // Otherwise, show a green badge with the number of passed tests
    chrome.action.setBadgeBackgroundColor({ color: 'green' });
    chrome.action.setBadgeText({ text: `${passCount}` });
  }
}

// Listen for messages to update badge or store test results
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Update results when the "updateResults" action is received
  if (message.action === 'updateResults') {
    const { passCount, failCount } = message.data;
    updateBadge(passCount, failCount); // Update the badge with the counts
    chrome.storage.local.set({ testResults: message.data }, () => {
      console.log('Test results saved');
    });
    sendResponse({ success: true });
  } 
  // Retrieve stored test results when the "getResults" action is received
  else if (message.action === 'getResults') {
    chrome.storage.local.get('testResults', (data) => {
      // Send the results back to the sender (usually the popup)
      sendResponse(data.testResults || { passCount: 0, failCount: 0 });
    });
    return true; // Keep the message channel open for async response
  }
});
