// Function to calculate the number of passed and failed tests
function calculateResults(data) {
  let passed = 0;
  let failed = 0;

  // Check if the 'rows' array exists and is an array
  if (data.rows && Array.isArray(data.rows)) {
    data.rows.forEach((suite) => {
      suite.subs.forEach((spec) => {
        spec.subs.forEach((test) => {
          // Count 'passed' and 'failed' results based on test status
          if (test.status === "passed") {
            passed++;
          } else if (test.status === "failed") {
            failed++;
          }
        });
      });
    });
  }

  return { passed, failed };
}

// Listen for requests from the popup to update the icon
chrome.runtime.onInstalled.addListener(() => {
  // GitHub raw URL for the JSON file with test results
  const testResultFileUrl = 'https://raw.githubusercontent.com/faruklmu17/ci_testing/refs/heads/main/monocart-report/index.json';

  // Fetch the JSON file from GitHub
  fetch(testResultFileUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch test results');
      }
      return response.json();
    })
    .then((data) => {
      const { passed, failed } = calculateResults(data);

      // Instead of dynamic icon paths, use a fixed icon and just update the badge
      chrome.action.setIcon({ path: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      }});

      // Update the badge text with the counts
      chrome.action.setBadgeText({ text: `${passed}/${failed}` });
      // Set badge color based on test results
      chrome.action.setBadgeBackgroundColor({ 
        color: failed > 0 ? '#F44336' : '#4CAF50' 
      });
    })
    .catch((error) => console.error('Error loading test results:', error));
});
