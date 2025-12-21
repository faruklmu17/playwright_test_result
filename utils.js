// Shared utility functions

/**
 * Calculates pass/fail/flaky counts from Playwright JSON report data.
 * Counts unique test specs (not per-browser runs).
 * @param {Object} data - The parsed JSON data from Playwright.
 * @returns {Object} { passed, failed, flaky }
 */
export function calculateResults(data) {
  // Check if this is the new summary format (v1.2+)
  if (data.isSummary) {
    return {
      passed: data.passed || 0,
      failed: data.failed || 0,
      flaky: data.flaky || 0
    };
  }

  // Fallback for original Playwright JSON format
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

/**
 * Formats a timestamp into a human-readable "time ago" string.
 * Handles minutes, hours, and days.
 * @param {string} isoString - The ISO date string.
 * @returns {string} Human readable string (e.g. "5 minutes ago", "2 hours ago").
 */
export function formatTimeAgo(isoString) {
  if (!isoString) return "";
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
