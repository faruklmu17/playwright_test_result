
# 📊 Playwright Test Results Chrome Extension

This Chrome extension displays the number of **passed Playwright tests** as a badge on your browser toolbar. It fetches test results from a GitHub-hosted JSON file and auto-updates every minute.

---

## ⚠️ Current Limitation

> 🟢 **This version only shows passed test results**.  
> It assumes that the `results.json` file is only updated when **all tests pass**.  
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
  ['list'],
  ['monocart-reporter', {
    name: "My Test Report",
    outputFile: './monocart-report/results.json'  // Must match your GitHub upload path
  }]
]
```

> ✅ This generates a `results.json` file after each test run, which the extension reads.

---

## 📁 Project Structure

```
extension/
│
├── icons/                  # Toolbar icons
│   └── icon128.png
├── background.js           # Auto-fetches JSON and updates badge
├── popup.html              # Optional popup UI
├── popup.js                # Optional: manual display of results
├── manifest.json           # Extension config
└── README.md               # You're here!
```

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

* The extension fetches your `results.json` file from GitHub every 1 minute.
* If new results are found (based on content changes):

  * The badge updates to show the number of passed tests.
  * A Chrome notification optionally alerts you.

> 📄 Note: The `results.json` must be publicly available on GitHub.

---

## 🔗 GitHub Raw File Configuration

In `background.js`, replace this line:

```js
fetch("https://raw.githubusercontent.com/your-username/your-repo/main/monocart-report/results.json")
```

with your actual public GitHub raw file URL.

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
