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

function formatTimeAgo(isoString) {
  if (!isoString) return "";
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  return `${mins} minutes ago`;
}

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
      <div class="results-header">Test Summary</div>
      <div class="results-body">
        <div class="stats">
          <div class="stat-box passed">${passed} Passed</div>
          <div class="stat-box failed">${failed} Failed</div>
          ${flaky > 0 ? `<div class="stat-box flaky">${flaky} Flaky</div>` : ""}
        </div>
        <div class="total">Total: ${total} tests</div>
        ${timestamp}
        <div class="badge-preview" style="background-color: ${badgeColor}; color: white;">
          ${passed}
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

  showMessage("Loading test results...");

  const fetchUrl = forceRefresh ? `${url}?_=${Date.now()}` : url;

  fetch(fetchUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch test results");
      return res.json();
    })
    .then((data) => {
      const newResults = calculateResults(data);
      const startTime = data.stats?.startTime || null;
      updateUI(newResults, startTime);
    })
    .catch((err) => {
      console.error(err);
      showMessage("Error loading test results.", true);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("jsonUrl");
  const refreshBtn = document.getElementById("refresh");

  chrome.storage.sync.get("testJsonUrl", (result) => {
    const savedUrl = result.testJsonUrl;
    if (savedUrl) {
      input.value = savedUrl;
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
    fetchTestResults(url, true); // Force bypass cache
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
