import { calculateResults, formatTimeAgo } from './utils.js';

function updateUI({ passed, failed, flaky }, startTime = null) {
  const total = passed + failed + flaky;
  const badgeColor = failed > 0 ? "#F44336" : "#4CAF50";

  const timestamp = startTime
    ? `<div class="timestamp">Last updated: ${formatTimeAgo(startTime)}</div>`
    : "";

  const resultsDiv = document.getElementById("results");

  if (total === 0) {
    resultsDiv.innerHTML = `<div class='loading'>No test results found in the file.</div>`;
    return;
  }

  resultsDiv.innerHTML = `
    <div class="results-card">
      <div class="results-header">Summary</div>
      <div class="results-body">
        <div class="stats">
          <div class="stat-box passed">
            ${passed} <span>Passed</span>
          </div>
          <div class="stat-box failed">
            ${failed} <span>Failed</span>
          </div>
          ${flaky > 0 ? `<div class="stat-box flaky">${flaky} <span>Flaky</span></div>` : ""}
        </div>
        
        <div class="meta-info">
          <div class="total">${total} Total Tests</div>
          ${timestamp}
        </div>
      </div>
    </div>
  `;
}

function showMessage(message, isError = false) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="${isError ? "error" : "loading"}">${message}</div>
  `;
}

function fetchTestResults(url, forceRefresh = false) {
  if (!url || !url.startsWith("http")) {
    showMessage("Invalid or missing URL.", true);
    return;
  }

  // If not forcing refresh, we just let the UI sit with cached data while we fetch in background
  if (forceRefresh) {
    showMessage("Loading test results...");
  }

  // Always prevent browser caching for status checks
  const fetchUrl = `${url}?_=${Date.now()}`;

  fetch(fetchUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch test results");
      return res.json();
    })
    .then((data) => {
      const newResults = calculateResults(data);
      const startTime = data.stats?.startTime || null;
      updateUI(newResults, startTime);

      // Opportunistically update cache
      if (startTime) {
        chrome.storage.local.set({
          lastResults: newResults,
          lastUpdated: startTime
        });
      }
    })
    .catch((err) => {
      console.error(err);
      // Only show error if we don't have cached data shown, or if user manually refreshed
      if (forceRefresh) {
        showMessage("Error loading test results.", true);
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("jsonUrl");
  const refreshBtn = document.getElementById("refresh");

  // 1. First, try to load from CACHE immediately for instant feedback
  chrome.storage.local.get(["lastResults", "lastUpdated"], (localData) => {
    if (localData.lastResults) {
      console.log("🚀 Loading from cache first...");
      updateUI(localData.lastResults, localData.lastUpdated);
    }
  });

  // 2. Then, check config and fetch fresh data
  chrome.storage.sync.get("testJsonUrl", (result) => {
    const savedUrl = result.testJsonUrl;
    if (savedUrl) {
      input.value = savedUrl;
      // Fetch fresh data (silently update UI if it changes)
      fetchTestResults(savedUrl);
    } else {
      showMessage("Please enter a GitHub raw JSON URL.");
    }
  });

  refreshBtn.addEventListener("click", () => {
    const url = document.getElementById("jsonUrl").value.trim();
    if (!url.startsWith("http")) {
      alert("Please enter a valid URL.");
      return;
    }
    fetchTestResults(url, true); // Force bypass cache and show loading state
    chrome.runtime.sendMessage({ type: "refreshBadge" });
  });
});

document.getElementById("save").addEventListener("click", () => {
  const input = document.getElementById("jsonUrl").value.trim();

  if (!input.startsWith("http")) {
    alert("Please enter a valid URL.");
    return;
  }

  chrome.storage.sync.set({ testJsonUrl: input }, () => {
    fetchTestResults(input, true); // Also refresh when saving
    chrome.runtime.sendMessage({ type: "refreshBadge" });
  });
});
