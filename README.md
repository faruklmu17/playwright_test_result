# 🔍 Playwright Test Result Viewer – Chrome Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A Chrome extension that displays **Playwright test results** from a lightweight summary JSON file hosted on GitHub Pages, AWS S3, or any public URL. Version 1.4 adds full support for AWS S3 deployment with detailed configuration instructions.

---

## 📦 Features (v1.4)

- ✅ **Smart Badge**: Shows passed/failed count (e.g., `42/1`) directly on the extension icon.
- ✅ **AWS S3 Support**: Deploy test results to AWS S3 with complete setup instructions.
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

## ☁️ AWS S3 Deployment (v1.4)

Want to host your test results on AWS S3 instead of GitHub? Here's how:

### Step 1: Create an S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Choose a unique name (e.g., `my-test-results-123`)
4. Select your preferred region (e.g., `us-east-2`)
5. Click **Create bucket**

### Step 2: Configure Bucket Permissions

1. Go to your bucket → **Permissions** tab
2. **Block public access** → Click **Edit**
   - Uncheck all 4 boxes
   - Click **Save changes**
   - Type `confirm` when prompted

3. **Bucket policy** → Click **Edit** → Paste this (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

4. **CORS configuration** → Click **Edit** → Paste this:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 3: Set Up GitHub Secrets

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `AWS_DEFAULT_REGION` - Your bucket region (e.g., `us-east-2`)

### Step 4: Create GitHub Actions Workflow

Create `.github/workflows/playwright-s3.yml`:

```yaml
name: Deploy Test Results to AWS S3
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test-and-deploy:
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
      
      - name: Upload results to AWS S3
        if: always()
        run: |
          aws s3 cp test-summary.json s3://YOUR-BUCKET-NAME/results.json --acl public-read --content-type application/json
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_DEFAULT_REGION }}
```

### Step 5: Use Your S3 URL

Your test results will be available at:
```
https://YOUR-BUCKET-NAME.s3.REGION.amazonaws.com/results.json
```

Example:
```
https://my-test-results-123.s3.us-east-2.amazonaws.com/results.json
```

Paste this URL into the extension and click **Save**! 🎉

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

## 📊 How It Works (v1.4)

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


