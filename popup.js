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

// Update the popup UI with test results
function updateUI({ passed, failed }) {
  const total = passed + failed;
  const badgeColor = failed > 0 ? "#F44336" : "#4CAF50";

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="results-card">
      <div class="results-header">Test Summary</div>
      <div class="results-body">
        <div class="stats">
          <div class="stat-box passed">${passed} Passed</div>
          <div class="stat-box failed">${failed} Failed</div>
        </div>
        <div class="total">Total: ${total} tests</div>
        <div class="badge-preview" style="background-color: ${badgeColor}; color: white;">
          ${passed}
        </div>
      </div>
    </div>
  `;
}

// Show loading or error message
function showMessage(message, isError = false) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `
    <div class="${isError ? "error" : "loading"}">${message}</div>
  `;
}

// Fetch test results and display
function fetchTestResults(url) {
  if (!url || !url.startsWith("http")) {
    showMessage("Invalid or missing URL.", true);
    return;
  }

  showMessage("Loading test results...");
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch test results");
      return res.json();
    })
    .then((data) => {
      const { passed, failed } = calculateResults(data);
      updateUI({ passed, failed });
    })
    .catch((err) => {
      console.error(err);
      showMessage("Error loading test results.", true);
    });
}

// Load URL from storage on popup open
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("jsonUrl");

  chrome.storage.sync.get("testJsonUrl", (result) => {
    const savedUrl = result.testJsonUrl;
    if (savedUrl) {
      input.value = savedUrl;
      fetchTestResults(savedUrl);
    } else {
      showMessage("Please enter a GitHub raw JSON URL.");
    }
  });
});

// Save new URL on button click
document.getElementById("save").addEventListener("click", () => {
  const input = document.getElementById("jsonUrl").value.trim();

  if (!input.startsWith("http")) {
    alert("Please enter a valid URL.");
    return;
  }

  chrome.storage.sync.set({ testJsonUrl: input }, () => {
    // ✅ Refresh UI immediately
    fetchTestResults(input);
    // ✅ Also refresh the badge
    chrome.runtime.sendMessage({ type: "refreshBadge" });
  });
});
