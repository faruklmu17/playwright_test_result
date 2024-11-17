// popup.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded triggered.");

  const uploadElement = document.getElementById("upload");
  const passedElement = document.getElementById("passed");
  const failedElement = document.getElementById("failed");

  // Log to check if elements exist
  console.log("Upload element:", uploadElement);
  console.log("Passed element:", passedElement);
  console.log("Failed element:", failedElement);

  if (uploadElement && passedElement && failedElement) {
    uploadElement.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          try {
            const json = JSON.parse(e.target.result);

            // Validate the structure of the JSON file
            if (!json.suites || !Array.isArray(json.suites)) {
              throw new Error("Invalid JSON format: 'suites' array missing.");
            }

            // Calculate pass and fail counts
            const { passed, failed } = calculateResults(json);

            // Send results to background script
            chrome.runtime.sendMessage(
              {
                action: "updateResults",
                data: { passCount: passed, failCount: failed },
              },
              (response) => {
                if (response && response.success) {
                  console.log("Results sent successfully to background.");
                } else {
                  console.error("Failed to send results to background.");
                }
              }
            );

            // Update popup display
            passedElement.textContent = passed;
            failedElement.textContent = failed;
          } catch (error) {
            alert(`Invalid JSON file! Error: ${error.message}`);
          }
        };
        reader.readAsText(file);
      }
    });
  } else {
    console.error("One or more required elements not found.");
  }
});

// Function to calculate pass/fail counts
function calculateResults(data) {
  let passed = 0;
  let failed = 0;

  // Safely traverse JSON structure
  if (data.suites && Array.isArray(data.suites)) {
    data.suites.forEach((suite) => {
      if (suite.specs && Array.isArray(suite.specs)) {
        suite.specs.forEach((spec) => {
          if (spec.tests && Array.isArray(spec.tests)) {
            spec.tests.forEach((test) => {
              if (test.results && Array.isArray(test.results)) {
                test.results.forEach((result) => {
                  if (result.status === "passed") passed++;
                  if (result.status === "failed") failed++;
                });
              }
            });
          }
        });
      }
    });
  }
  return { passed, failed };
}

// Load and display existing results on popup open
chrome.runtime.sendMessage({ action: "getResults" }, (data) => {
  if (data) {
    const { passCount = 0, failCount = 0 } = data;
    const passedElement = document.getElementById("passed");
    const failedElement = document.getElementById("failed");
    
    if (passedElement && failedElement) {
      passedElement.textContent = passCount;
      failedElement.textContent = failCount;
    } else {
      console.error("Passed/Failed elements not found when loading results.");
    }
  }
});
