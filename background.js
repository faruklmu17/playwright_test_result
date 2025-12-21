import { calculateResults } from './utils.js';

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
        const newStartTime = data.startTime || data.stats?.startTime;

        // Store timestamp and results
        if (newStartTime) {
          chrome.storage.local.set({
            lastResults: newResults,
            lastUpdated: newStartTime
          });
        }

        // Badge logic: Show Passed/Failed count
        const total = newResults.passed + newResults.failed + newResults.flaky;
        let badgeText = `${newResults.passed}/${newResults.failed}`;
        let badgeColor = newResults.failed > 0 ? "#FF1744" : "#00C853";

        if (total === 0) {
          badgeText = "?";
          badgeColor = "#9E9E9E"; // Gray for unknown/empty
        }

        chrome.action.setBadgeText({ text: badgeText });
        chrome.action.setBadgeBackgroundColor({ color: badgeColor });
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
  console.log("🚀 Extension installed/updated");
  // Create alarm on install (1 minute for responsiveness)
  chrome.alarms.create("refreshResults", { periodInMinutes: 1 });
  fetchAndUpdateBadge();
});

// Run on browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log("🚀 Browser started");
  // Ensure alarm exists on startup
  chrome.alarms.create("refreshResults", { periodInMinutes: 1 });
  fetchAndUpdateBadge();
});

// ✅ Handle alarm every minute
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

// 🔁 Ensure alarm exists when service worker wakes up
chrome.alarms.get("refreshResults", (alarm) => {
  if (!alarm || alarm.periodInMinutes !== 1) {
    console.log("⏰ Setting/Updating alarm to 1 minute...");
    chrome.alarms.create("refreshResults", { periodInMinutes: 1 });
  }
});
