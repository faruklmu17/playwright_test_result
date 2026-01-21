# 🔍 Playwright Test Result Viewer – Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A Chrome extension that displays **Playwright test results** from a lightweight summary JSON file hosted on GitHub (or any public URL). Version 1.3 adds support for private repositories via GitHub Pages and robust Manifest V3 architecture.

---

## 📦 Features (v1.3)

- ✅ **Smart Badge**: Shows passed/failed count (e.g., `42/1`) directly on the extension icon.
- ✅ **Private Repo Support**: Monitor private repositories by hosting your summary on GitHub Pages.
- ✅ **New Summary Format**: Supports a lightweight `test-summary.json` for lightning-fast updates.
- ✅ **Live Polling**: Auto-refreshes every **1 minute** to stay in sync with CI/CD.
- ✅ **Auto-Link Conversion**: Automatically converts GitHub UI links (`/blob/`) to raw links.
- ✅ **Error Awareness**: Shows a Gray `?` badge and a "No Tests Detected" warning if your test run crashes or has a syntax error.
- ✅ **Backward Compatible**: Still supports the full Playwright JSON report format.

---

## 🚀 How to Use Locally

### 1. Clone this repo

```bash
git clone https://github.com/faruklmu17/playwright-test-viewer-extension.git
cd playwright-test-viewer-extension
```

✅ All the latest code is available in the `main` branch.

### 2. Open Chrome and go to:

```
chrome://extensions/
```

### 3. Enable **Developer mode** (top right)

### 4. Click **"Load unpacked"** and select the folder you just cloned

---

## 🔧 How to Configure It

### ✅ Step 1: Generate a Summary File (Recommended)

To get the most out of version 1.3, generate a lightweight summary file in your CI/CD pipeline or local scripts. The extension expects this format:

```json
{
  "isSummary": true,
  "passed": 42,
  "failed": 1,
  "flaky": 0,
  "total": 43,
  "startTime": "2025-12-21T04:00:00.000Z"
}
```

> **Note:** If `isSummary` is not present, the extension will attempt to parse the full Playwright JSON report automatically.

### ✅ Step 2: Commit & Push to GitHub

Push your JSON file to your repo. You can use the GitHub UI link or the raw link:

```
https://github.com/your-username/your-repo/blob/main/test-summary.json
```

### ✅ Step 3: Set the URL in the extension

1. Click the extension icon 🧩
2. Paste your URL into the input field (GitHub UI links are automatically converted to Raw links).
3. Click **Save**.
4. The popup will immediately fetch and display the test summary.

---

## 🧪 Test Repo to Try This Extension

Want to see how the extension works?

👉 Use this test repo:
**[▶️ browser\_extension\_test (GitHub)](https://github.com/faruklmu17/browser_extension_test)**

It includes:
* A working Playwright setup.
* A summary file at: `test-summary.json`
* A GitHub Actions workflow that generates the summary on every push.

---

## 📊 How It Works (v1.3)

* 🟩 **Green badge** = All tests passed (e.g., `5/0`).
* 🟥 **Red badge** = One or more tests failed (e.g., `4/1`).
* ⬜ **Gray badge (?)** = No tests detected (Crash, syntax error, or empty file).
* 🔁 **Auto-Sync**: Opening the popup or clicking Refresh instantly syncs the badge.

---

## 🔐 Security & Privacy Notes

* ✅ Your data stays local — the extension only fetches the JSON you configure.
* ✅ Does **not** require access to tabs or page content.
* ⚠️ Do **not** include sensitive data (like API keys or credentials) in your test results.

---

## 📄 License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for full details.

---

## 🙌 Credits

Created by [Faruk Hasan](https://github.com/faruklmu17)
Powered by [Playwright](https://playwright.dev/)

---

## 🐛 Troubleshooting

### Extension not updating after code changes?

1. Go to `chrome://extensions/`
2. Click the **Reload** icon on the extension card.
3. If changing URL doesn't work, click **Save** in the popup to force a refresh.


