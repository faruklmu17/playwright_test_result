// Function to calculate the number of passed and failed tests
function calculateResults(data) {
  let passed = 0;
  let failed = 0;

  // Check if the 'rows' array exists and is an array
  if (data.rows && Array.isArray(data.rows)) {
    data.rows.forEach((suite) => {
      suite.subs.forEach((spec) => {
        spec.subs.forEach((test) => {
          // Count 'passed' and 'failed' results based on test status
          if (test.status === "passed") {
            passed++;
          } else if (test.status === "failed") {
            failed++;
          }
        });
      });
    });
  }

  return { passed, failed };
}

// When the popup is opened, fetch the test results from the GitHub URL
document.addEventListener('DOMContentLoaded', () => {
  // Define the raw URL of the JSON file in your GitHub repository
  const jsonUrl = 'https://raw.githubusercontent.com/faruklmu17/ci_testing/refs/heads/main/monocart-report/index.json';

  // Fetch the JSON data from GitHub
  fetch(jsonUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch test results from GitHub.');
      }
      return response.json();
    })
    .then(data => {
      // Calculate the passed and failed tests based on the fetched data
      const { passed, failed } = calculateResults(data);

      // Update the results on the popup
      document.getElementById('results').innerText = `Passed: ${passed}, Failed: ${failed}`;
    })
    .catch(error => {
      // Handle any errors during the fetch or result processing
      document.getElementById('results').innerText = `Error: ${error.message}`;
    });
});
