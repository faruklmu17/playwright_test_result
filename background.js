// Function to calculate the number of passed and failed tests from Playwright JSON
function calculateResults(data) {
  let passed = 0;
  let failed = 0;

  if (data.suites && Array.isArray(data.suites)) {
    data.suites.forEach((suite) => {
      suite.specs?.forEach((spec) => {
        spec.tests?.forEach((test) => {
          test.results?.forEach((result) => {
            if (result.status === "passed") {
              passed++;
            } else if (result.status === "failed") {
              failed++;
            }
          });
        });
      });
    });
  }

  return { passed, failed };
}

// Fetch and update badge
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
        if (!response.ok) {
          throw new Error("Failed to fetch test results");
        }
        return response.json();
      })
      .then((data) => {
        const { passed, failed } = calculateResults(data);

        // ✅ Show passed count on badge
        chrome.action.setBadgeText({ text: `Test` });

        // ✅ Badge color: green if all passed, red if any failed
        chrome.action.setBadgeBackgroundColor({
          color: failed > 0 ? "#FF1744" : "#00C853"
        });

        // Optional white text for better visibility
        chrome.action.setBadgeTextColor?.({ color: "#FFFFFF" });

        // Optional icon refresh
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

// Optional: Refresh badge immediately if popup saves a new URL
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "refreshBadge") {
    fetchAndUpdateBadge();
  }
});
