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

        drawIcon(newResults.passed, newResults.failed, newResults.flaky);
      })
      .catch((error) => {
        console.warn("⚠️ Fetch failed: unable to retrieve test results.");
        console.error("Reason:", error.message);
        chrome.action.setBadgeText({ text: "?" });
        chrome.action.setBadgeBackgroundColor({ color: "gray" });
        drawIcon(0, 0, 0); // Gray state
      });
  });
}

/**
 * Draws a dynamic pie chart icon based on test results.
 */
function drawIcon(passed, failed, flaky) {
  const canvas = new OffscreenCanvas(128, 128);
  const ctx = canvas.getContext('2d');
  const total = passed + failed + flaky;

  // Clear canvas
  ctx.clearRect(0, 0, 128, 128);

  // Background circle
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, 2 * Math.PI);
  ctx.fillStyle = '#f0f0f0';
  ctx.fill();

  if (total === 0) {
    // Gray ring for unknown state
    ctx.beginPath();
    ctx.arc(64, 64, 50, 0, 2 * Math.PI);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#9E9E9E';
    ctx.stroke();
  } else {
    let startAngle = -Math.PI / 2;

    const drawSlice = (count, color) => {
      if (count === 0) return;
      const sliceAngle = (count / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(64, 64);
      ctx.arc(64, 64, 60, startAngle, startAngle + sliceAngle);
      ctx.fillStyle = color;
      ctx.fill();
      startAngle += sliceAngle;
    };

    drawSlice(passed, '#00C853'); // Green
    drawSlice(flaky, '#FFAB00');  // Orange/Amber
    drawSlice(failed, '#FF1744'); // Red

    // Inner circle for donut look (optional, but looks premium)
    ctx.beginPath();
    ctx.arc(64, 64, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  const imageData = ctx.getImageData(0, 0, 128, 128);
  chrome.action.setIcon({ imageData: imageData });
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
