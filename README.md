
# 🔍 Playwright Test Result Viewer – Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A Chrome extension that displays **Playwright test results** from a JSON file hosted on GitHub (or any public URL). The extension badge shows a fixed label ("Test"), and clicking the icon opens a popup that shows the actual pass/fail summary.

---

## 📦 Features

- ✅ Click the badge to view the number of **passed and failed** Playwright tests
- ✅ Fetches test results from a **raw JSON file** hosted on GitHub or any public URL
- ✅ User-configurable JSON URL (no code change required)
- ✅ Auto-refreshes every 5 minutes
- ✅ Visual badge with fixed label (text says `Test`, color reflects test status)

---

## 🚀 How to Use Locally

### 1. Clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/playwright-test-viewer-extension.git
cd playwright-test-viewer-extension
````

### 2. Open Chrome and go to:

```
chrome://extensions/
```

### 3. Enable **Developer mode** (top right)

### 4. Click **"Load unpacked"** and select the folder you just cloned

---

## 🔧 How to Configure It

### ✅ Step 1: Generate a Playwright JSON report

In your `playwright.config.ts`, add the following reporter setup:

```ts
reporter: [
  ['html'],
  ['json', { outputFile: 'tests/test-results.json' }]
]
```

### ✅ Step 2: Commit & Push to GitHub

Push your `test-results.json` file to your repo, e.g.:

```
https://raw.githubusercontent.com/your-username/your-repo/main/tests/test-results.json
```

> Make sure your repo (or just the file) is public so the extension can access it without authentication.

### ✅ Step 3: Set the URL in the extension

1. Click the extension icon (after installing)
2. Paste your raw JSON URL into the input field
3. Click **Save**
4. The popup will immediately fetch and display the test summary

---

## 📊 How It Works

- 🟪 The extension badge always shows the label `"Test"`
- 🟩 **Green badge** = all tests passed
- 🟥 **Red badge** = one or more tests failed (based on JSON contents)
- 🔁 Badge auto-refreshes every 5 minutes using your configured raw JSON URL

> ⚠️ **Note on failed tests:**  
If your CI/CD pipeline is set to **skip deployment when tests fail**, the `test-results.json` file will not be updated.  
As a result, the badge and popup will continue to reflect the **last successful test result** (usually all passed), not the failure.

To display failed tests in the extension:
- Either allow test-result reporting even on failures
- Or create a separate GitHub Action step that always commits the JSON regardless of test outcome


## 🔐 Security & Privacy Notes

* ✅ Your data stays local — the extension only fetches the JSON you configure
* ✅ Does **not** require access to tabs or page content
* ⚠️ Do **not** include sensitive data (like API keys or credentials) in your test-results.json
* ✅ MIT License protects you from liability (see below)

---

## 📄 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for full details.

> You're free to use, modify, and distribute it. The software is provided **as-is**, without warranty — meaning you're not responsible if something breaks or doesn't work for others.

---

## 🙌 Credits

Created by [Faruk Hasan](https://github.com/faruklmu17)
Powered by [Playwright](https://playwright.dev/)
Badge inspired by GitHub Actions, test dashboards, and everyday QA tooling.

---

## 💡 Future Improvements (Feel free to contribute!)

* Add notification when failures are detected
* Support for multiple URLs or environments
* Optional GitHub Pages hosting of test results
