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

// Function to fetch and update the badge text
function updateBadge() {
  const testResultFileUrl = 'https://raw.githubusercontent.com/faruklmu17/ci_testing/refs/heads/main/monocart-report/index.json?timestamp=' + new Date().getTime();

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

      // Update the badge text with the counts (limit to 4 characters)
      const badgeText = `${passed} / ${failed > 9 ? '9+' : failed}`;

      chrome.action.setBadgeText({ text: badgeText });

      // Set badge color based on test results - more vibrant colors
      chrome.action.setBadgeBackgroundColor({
        color: failed > 0 ? '#FF1744' : '#00C853'  // Brighter red and green
      });

      // Make badge text more visible
      chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
    })
    .catch((error) => console.error('Error loading test results:', error));
}

// Periodically update the badge every 30 seconds
setInterval(updateBadge, 30000);

// Initial badge update on installation or extension reload
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed or Reloaded, updating badge...");
  updateBadge();
});
