
# 📊 Playwright Test Results Chrome Extension

This Chrome extension displays the number of **passed Playwright tests** on your browser toolbar. It fetches test results from a GitHub-hosted JSON file and auto-updates every minute.

---

## ⚠️ Current Limitation

> 🟢 **This version only shows passed test results**.  
> It assumes that the `index.json` file is only updated when **all tests pass**.  
> If your Playwright run fails and does **not upload new results**, the badge will remain unchanged.

A future version will include support for tracking failed tests and showing a red badge.

---

## 🧩 Requirements (Monocart Reporter Setup)

To generate structured JSON test results for this extension, you'll need to install [Monocart Reporter](https://github.com/cenfun/monocart-reporter) and configure it in your Playwright project.

### 🛠 Step 1: Install Monocart

```bash
npm install -D monocart-reporter
````

### 🛠 Step 2: Update `playwright.config.js`

Add `monocart-reporter` alongside any other reporters you use (e.g., `list`, `html`):

```js
reporter: [
  ['HTML'],
  ['monocart-reporter', {
    name: "My Test Report",
    outputFile: './monocart-report/index.json'  // Must match your GitHub upload path
  }]
]
```

> ✅ This generates an `index.json` file after each test run, which the extension reads.

---

## 🔧 Setup Instructions (Chrome Extension)

1. Clone or download this repo.

2. Open Chrome and go to:

   ```
   chrome://extensions/
   ```

3. Enable **Developer Mode**.

4. Click **"Load unpacked"** and select the `extension` folder.

5. The extension icon will appear in the toolbar with a test badge.

---

## 🔁 How It Works

* The extension fetches your `index.json` file from GitHub every 1 minute.
* When you click the badge:

  * A popup shows the number of passed and failed tests.
  * A "Refresh" button lets you manually update.
  * The popup shows a timestamp of the last update.

> 📄 Note: The `index.json` must be publicly available on GitHub.

---

## 🔗 GitHub Raw File Configuration

In `background.js`, replace this line:

```js
fetch("https://raw.githubusercontent.com/your-username/your-repo/main/monocart-report/index.json")
```

with your actual public GitHub raw file URL.

---

## 🔄 Required GitHub Action (Auto-Publish `index.json`)

You must configure a GitHub Action to **run your Playwright tests** and **upload the Monocart report** (`index.json`) to the repository whenever there's a push or pull request.

Create a file at `.github/workflows/playwright.yml` with the following content:

```yaml
name: Playwright test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup node.js
        uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: 'true'

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload Monocart report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: monocart-report
          path: monocart-report/
          retention-days: 30
```

> 📝 **Important:**
> This setup uploads the test report as an artifact. If you want the extension to access it via GitHub raw URL, you'll need to push the file directly to the repo in a branch or in `gh-pages`.

---

## 📜 Manifest Permissions

Your `manifest.json` should include:

```json
"permissions": ["alarms", "notifications", "storage"],
"host_permissions": ["https://raw.githubusercontent.com/*"]
```

---

## 🧑‍💻 Author

Created by [Faruk Hasan](https://github.com/faruklmu17) — QA Engineer and Automation Enthusiast

---

## 📌 Roadmap

* ✅ Show passed test counts
* ❌ (Coming Soon) Red badge for failed tests
* 🔔 Auto notifications for new test runs
* 🖼️ Optional popup to show full result list

---
