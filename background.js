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

    console.log("🔁 Fetching and updating badge...");

    fetch(testResultFileUrl)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch test results");
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

        // 🔁 Set dynamic badge text
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
        console.error("Error loading test results:", error);
        chrome.action.setBadgeText({ text: "?" });
        chrome.action.setBadgeBackgroundColor({ color: "gray" });
      });
  });
}

// Run once on install/update
chrome.runtime.onInstalled.addListener(() => {
  fetchAndUpdateBadge();
  chrome.alarms.create("refreshResults", { periodInMinutes: 5 });
});

// Also run on browser startup
chrome.runtime.onStartup?.addListener(() => {
  fetchAndUpdateBadge();
  chrome.alarms.create("refreshResults", { periodInMinutes: 5 });
});

// ✅ Use chrome.alarms for reliable recurring updates
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshResults") {
    fetchAndUpdateBadge();
  }
});

// Allow popup to manually trigger badge refresh
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "refreshBadge") {
    fetchAndUpdateBadge();
  }
});
