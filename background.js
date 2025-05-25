// Function to calculate the number of passed, failed, and flaky tests from Playwright JSON
function calculateResults(data) {
  let passed = 0;
  let failed = 0;
  let flaky = 0;

  if (data.suites && Array.isArray(data.suites)) {
    data.suites.forEach((suite) => {
      suite.specs?.forEach((spec) => {
        spec.tests?.forEach((test) => {
          test.results?.forEach((result) => {
            if (result.status === "passed") passed++;
            else if (result.status === "failed") failed++;
            else if (result.status === "flaky") flaky++;
          });
        });
      });
    });
  }

  return { passed, failed, flaky };
}

// Fetch and update badge using data.stats.startTime
function fetchAndUpdateBadge() {
  chrome.storage.sync.get("testJsonUrl", (result) => {
    const testResultFileUrl = result.testJsonUrl;

    // Skip fetch if no valid URL is set
    if (!testResultFileUrl || !testResultFileUrl.startsWith("http")) {
      chrome.action.setBadgeText({ text: "?" });
      chrome.action.setBadgeBackgroundColor({ color: "gray" });
      return;
    }

    console.log("🔁 Fetching and updating badge from:", testResultFileUrl);

    // Force fresh fetch by appending a cache-busting timestamp
    fetch(`${testResultFileUrl}?_=${Date.now()}`)
      .then((response) => {
        if (!response.ok) throw new Error("Non-200 HTTP response");
        return response.json();
      })
      .then((data) => {
        const newResults = calculateResults(data);
        const newStartTime = data.stats?.startTime;

        // Store timestamp and results
        if (newStartTime) {
          chrome.storage.local.set({
            lastResults: newResults,
            lastUpdated: newStartTime
          });
        }

        // Badge logic: ignore flaky, only show failed or passed
        const badgeText = newResults.failed > 0
          ? `${newResults.failed}❌`
          : `${newResults.passed}`;

        chrome.action.setBadgeText({ text: badgeText });
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
        console.warn("⚠️ Fetch failed: unable to retrieve test results.");
        console.error("Reason:", error.message);
        chrome.action.setBadgeText({ text: "?" });
        chrome.action.setBadgeBackgroundColor({ color: "gray" });
      });
  });
}

// Run on install/update
chrome.runtime.onInstalled.addListener(() => {
  fetchAndUpdateBadge();
});

// Run on browser startup
chrome.runtime.onStartup?.addListener(() => {
  fetchAndUpdateBadge();
});

// 🔁 Ensure alarm always exists (even after manual reload)
chrome.alarms.create("refreshResults", { periodInMinutes: 5 });

// ✅ Handle alarm every 5 minutes
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshResults") {
    console.log("⏰ Alarm triggered: refreshing badge...");
    fetchAndUpdateBadge();
  }
});

// Allow popup to manually trigger badge refresh
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "refreshBadge") {
    fetchAndUpdateBadge();
  }
});
