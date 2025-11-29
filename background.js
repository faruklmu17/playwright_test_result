// Function to calculate the number of passed, failed, and flaky tests from Playwright JSON
// Counts unique test specs (not per-browser runs)
function calculateResults(data) {
  // Use a map to deduplicate specs by file + line + title
  const specMap = new Map();

  if (data.suites && Array.isArray(data.suites)) {
    data.suites.forEach((suite) => {
      suite.specs?.forEach((spec) => {
        const key = `${spec.file}:${spec.line}:${spec.title}`;

        if (!specMap.has(key)) {
          specMap.set(key, { ok: true, flaky: false, failed: false });
        }

        const entry = specMap.get(key);

        // Check if any test in this spec is flaky
        const hasFlaky = spec.tests?.some((test) => test.status === "flaky");
        // Check if any test in this spec failed
        const hasFailed = spec.tests?.some((test) => test.status === "unexpected");

        if (hasFlaky) entry.flaky = true;
        if (hasFailed || spec.ok === false) entry.failed = true;
        if (spec.ok === false) entry.ok = false;
      });
    });
  }

  let passed = 0;
  let failed = 0;
  let flaky = 0;

  specMap.forEach((entry) => {
    if (entry.flaky) {
      flaky++;
    } else if (entry.failed || !entry.ok) {
      failed++;
    } else {
      passed++;
    }
  });

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
  console.log("🚀 Extension installed/updated");
  // Create alarm on install
  chrome.alarms.create("refreshResults", { periodInMinutes: 5 });
  fetchAndUpdateBadge();
});

// Run on browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log("🚀 Browser started");
  // Ensure alarm exists on startup
  chrome.alarms.create("refreshResults", { periodInMinutes: 5 });
  fetchAndUpdateBadge();
});

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

// 🔁 Ensure alarm exists when service worker wakes up
chrome.alarms.get("refreshResults", (alarm) => {
  if (!alarm) {
    console.log("⚠️ Alarm not found, creating it...");
    chrome.alarms.create("refreshResults", { periodInMinutes: 5 });
  }
});
