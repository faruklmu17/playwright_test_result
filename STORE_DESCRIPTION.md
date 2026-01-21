Overview
=======
Playwright Test Results Badge is a lightweight Chrome extension that helps you quickly see your Playwright test status directly from your browser toolbar. Version 1.3 introduces support for private repositories via GitHub Pages, allowing you to monitor secure projects safely.

Instead of opening CI dashboards or scrolling through logs, you get an instant visual summary of your test results that stays visible and automatically updated.

This extension is ideal for:

• 👨‍💻 Developers & QA engineers
• 🧪 Teams monitoring private CI/CD pipelines
• 🎓 Students learning testing or DevOps
• 📄 Anyone using Playwright with automated tests

Why install this extension?

• ✅ Instantly know if your tests passed or failed
• ⏱️ Saves time by avoiding CI dashboards and logs
• 🔄 Automatically refreshes every 1 minute
• 🔒 Private Repo Support: Monitor secure projects using GitHub Pages
• 🛡️ Privacy-first: no accounts, no tracking, no external servers

What the extension does

Live badge on the Chrome toolbar:

• 🟩 Green 42 / 0 means all tests passed
• 🟥 Red 41 / 1 means one or more tests failed
• ⬜ Gray ? means no tests detected (crash, sync error, or empty summary file)

This lets you see project health at a glance, even while browsing other sites.

Detailed popup view:

• 📊 Total number of tests executed
• ✅ Passed / ❌ Failed / ⚠️ Flaky counts
• 🕒 Last updated timestamp
• 🔄 Manual refresh button

Quick Setup Guide
==============================

Step 1: Create the Summary Reporter
------------------------------
Create "summary-reporter.js" in your project root:

const fs = require('fs');
class SummaryReporter {
  onBegin(config, suite) { this.rootSuite = suite; }
  onEnd(result) {
    const summary = {
      schemaVersion: 1, passed: 0, failed: 0, flaky: 0, total: 0,
      startTime: new Date().toISOString(), isSummary: true
    };
    if (this.rootSuite) {
      for (const test of this.rootSuite.allTests()) {
        const out = test.outcome();
        if (out === 'expected') summary.passed++;
        if (out === 'unexpected') summary.failed++;
        if (out === 'flaky') summary.flaky++;
      }
    }
    summary.total = summary.passed + summary.failed + summary.flaky;
    fs.writeFileSync('test-summary.json', JSON.stringify(summary, null, 2));
  }
}
module.exports = SummaryReporter;

Step 2: Configure Playwright
------------------------------
Update "playwright.config.ts" to include the reporter:

reporters: [
  ['./summary-reporter.js'],
  ['html'],
  ['list']
],

Step 3: Create CI Workflow (Supports Private Repos)
--------------------------------------------
Create ".github/workflows/playwright.yml" with this content:

name: Deploy results.json to GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - name: Commit updated results
        if: always()
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add test-summary.json
          git commit -m "Update test summary [skip ci]" || echo "No changes"
          git push
      - name: Prepare Pages artifact
        if: always()
        run: |
          mkdir -p public
          cp test-summary.json public/results.json
          touch public/.nojekyll
      - name: Upload artifact
        if: always()
        uses: actions/upload-pages-artifact@v3
        with:
          path: public
      - name: Deploy to Pages
        id: deployment
        if: always()
        uses: actions/deploy-pages@v4

Step 4: Connect & Monitor
----------------------
1. In your Repo Settings > Pages, set source to "Deploy from a branch" and select "main".
2. After the workflow runs, copy your Pages URL (e.g. https://user.github.io/repo/results.json).
3. Paste it into the extension and click Save!

Privacy and Security
===================
• 🔐 No accounts or tracking
• 🚫 No external analytics servers
• 🌍 Data stays in your browser
• 📁 Permissions: storage (save URL) and alarms (auto-refresh)

License: MIT
