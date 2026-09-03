# Xiaohongshu Comment Reader

[简体中文](README.md) · [English](README_EN.md)

A lightweight, backend-free Chrome / Edge side-panel extension for collecting comments that are **already loaded** on the current Xiaohongshu (RedNote) post, copying comment text, and visualizing the comment section's displayed IP-region distribution. It can also call a user-configured AI endpoint to generate an optional comment summary or public-opinion report.

**Core capabilities: Xiaohongshu comment collection + IP-region distribution.** The extension reads comment elements that are already present in the page DOM. It does not intercept network traffic, scroll or click automatically, read cookies, or collect account details.

Current version: `v0.1.11`

## Features

- Collect comments already loaded on the current page
- Copy all collected comments with one click
- Aggregate displayed IP-region labels and render a local pie chart
- Remove adjacent duplicate comments
- Recalibrate the DOM selector when Xiaohongshu changes its page structure
- Call a user-configured DeepSeek-compatible endpoint only after an explicit click
- Generate either a quick comment summary or a six-part public-opinion report

## Install in 5 Minutes

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository root—the directory containing `manifest.json`.

Open a Xiaohongshu post, click the extension icon, and then click **开始检测并读取评论** (Start detecting and reading comments) in the side panel.

For detailed steps and troubleshooting, see the [Chinese installation guide](docs/INSTALLATION.md).

## How It Works

The extension checks the current page once per second and reads comments that Xiaohongshu has already rendered. If you manually scroll down and the page loads more comments, the newly loaded comments appear in the side panel on the next scan.

It does not automatically scroll, click, paginate, or call hidden Xiaohongshu APIs. Therefore, the collected count may be lower than the post's total comment count until more comments are loaded on the page.

## IP-Region Distribution

For each visible `.comment-item`, the extension reads its comment text and displayed location label. The comment count, list, copy output, and pie chart all use the same comment records.

- Missing location labels are grouped under “Not displayed.”
- Regions beyond the eight largest groups are merged into “Other.”
- Region statistics stay in side-panel memory.
- Region labels are not linked to usernames, persisted, or sent to the external AI endpoint.

## Optional AI Summary

AI features are disabled until you configure an endpoint and explicitly click a generation button. The default request format is DeepSeek / OpenAI-compatible Chat Completions.

The extension sends only deduplicated comment text and analysis instructions. It does not send the page URL, cookies, Xiaohongshu account data, request headers, page HTML, or IP-region statistics.

The API bearer token is kept in `chrome.storage.session`, not in source code, release packages, logs, or persistent local storage. See [AI setup](docs/AI_SETUP.md) and [privacy and security](docs/PRIVACY.md) for details.

## Project Structure

```text
xhs-comment-reader/
├── src/                 # Extension runtime and side-panel UI
│   ├── background.js    # Opens the side panel
│   ├── sidepanel.html   # UI structure
│   ├── sidepanel.css    # UI styles
│   ├── sidepanel.js     # Comment reader and interactions
│   └── ai-utils.js      # AI input/output and evidence validation
├── tests/               # Node.js tests
├── scripts/             # Validation and packaging scripts
├── docs/                # User and developer documentation
├── manifest.json        # Chrome extension manifest
├── package.json         # Development commands and metadata
├── VERSION              # Canonical version number
└── README.md            # Chinese project guide
```

Generated `build/` and `deliverables/` directories are excluded from Git.

## Development

Node.js 20 or later is required. The extension has no third-party runtime dependencies, so `npm install` is not required.

```bash
npm test
npm run validate
npm run package
```

- `npm test`: run the automated test suite
- `npm run validate`: check versions, permissions, security boundaries, syntax, and tests
- `npm run package`: create the unpacked build and distributable ZIP

See the [development guide](docs/DEVELOPMENT.md) for more details.

## Known Limitations

- Only comments already loaded in the current page DOM can be collected.
- The default selector may require recalibration after Xiaohongshu changes its page structure.
- External AI availability, fees, and data handling depend on the service selected by the user.
- This repository contains complete source only for `v0.1.11`; earlier source and Git history are unavailable.

## License Notice

This is a personal local prototype. No public open-source license is currently granted. See [LICENSE-NOTICE.md](LICENSE-NOTICE.md).
