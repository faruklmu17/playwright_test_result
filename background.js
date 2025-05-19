// Function to calculate the number of passed and failed tests from Playwright JSON
function calculateResults(data) {
  let passed = 0;
  let failed = 0;

  if (data.suites && Array.isArray(data.suites)) {
    data.suites.forEach((suite) => {
      suite.specs?.forEach((spec) => {
        spec.tests?.forEach((test) => {
          test.results?.forEach((result) => {
            if (result.status === "passed") passed++;
            if (result.status === "failed") failed++;
          });
        });
      });
    });
  }

  return { passed, failed };
}

// Fetch and update badge using data.stats.startTime
function fetchAndUpdateBadge() {
  chrome.storage.sync.get("testJsonUrl", (result) => {
    const testResultFileUrl = result.testJsonUrl;

    if (!testResultFileUrl || !testResultFileUrl.startsWith("http")) {
      console.warn("No valid test result URL set.");
      chrome.action.setBadgeText({ text: "?" });
      chrome.action.setBadgeBackgroundColor({ color: "gray" });
      return;
    }

    fetch(testResultFileUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch test results");
        return response.json();
      })
      .then((data) => {
        const newResults = calculateResults(data);
        const newStartTime = data.stats?.startTime;

        // Store the timestamp directly from the file
        if (newStartTime) {
          chrome.storage.local.set({
            lastResults: newResults,
            lastUpdated: newStartTime
          });
        }

        // Update badge (static text: "Test")
        chrome.action.setBadgeText({ text: "Test" });

        chrome.action.setBadgeBackgroundColor({
          color: newResults.failed > 0 ? "#FF1744" : "#00C853"
        });

        chrome.action.setBadgeTextColor?.({ color: "#FFFFFF" });

        chrome.action.setIcon({
          path: {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
          }
        });
      })
      .catch((error) => {
        console.error("Error loading test results:", error);
        chrome.action.setBadgeText({ text: "?" });
        chrome.action.setBadgeBackgroundColor({ color: "gray" });
      });
  });
}

// Run on install/update
chrome.runtime.onInstalled.addListener(fetchAndUpdateBadge);

// Run on browser startup
chrome.runtime.onStartup?.addListener(fetchAndUpdateBadge);

// Refresh badge every 5 minutes
setInterval(fetchAndUpdateBadge, 5 * 60 * 1000);

// Allow popup to trigger immediate badge refresh
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "refreshBadge") {
    fetchAndUpdateBadge();
  }
});
