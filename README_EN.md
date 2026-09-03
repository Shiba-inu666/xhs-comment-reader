# Xiaohongshu Comment Reader

[简体中文](README.md) · [English](README_EN.md)

Pull the comments already loaded under a Xiaohongshu (RedNote) post into a browser side panel, then get a quick view of the IP-region distribution shown by the platform.

I built this because sometimes I only want to copy the comments or see where the discussion is coming from. That should not require a crawler, cookies, or a backend service. This is a small Chrome / Edge extension: open a post, click one button, and the comments currently on the page appear in the side panel.

“Collect” has a narrow meaning here. The extension reads content already rendered on the page. It does not intercept Xiaohongshu traffic or scroll the page for you.

## What it does

- Reads comments already loaded on the current page
- Copies all collected comments, one per line
- Builds a pie chart from the IP-region labels shown on the page
- Updates the side panel as the page loads more comments
- Recalibrates its selector from one visible comment when the page structure changes
- Optionally sends comments to your own DeepSeek-compatible endpoint for a summary or opinion report

Current version: `v0.1.11`

## Install

1. Click `Code` → `Download ZIP` on GitHub, then extract the download.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project directory containing `manifest.json`.

Open a Xiaohongshu post and click the extension icon. The reader will open in the browser side panel.

## Use it

1. Open a Xiaohongshu post and make sure its comment section is visible.
2. Open the extension and click **开始检测并读取评论** (Start reading comments).
3. Manually scroll the comment section if you want Xiaohongshu to load more comments.
4. Copy the text or inspect the IP-region chart in the side panel.

The extension checks the page once per second. When Xiaohongshu renders more comments, they appear in the reader.

## Comment count

The reader only sees comments currently loaded into the page DOM. Its count may therefore be lower than the total shown by Xiaohongshu.

Adjacent comments with identical trimmed text are treated as duplicates. The same text appearing again later is kept, because it may be a separate real comment.

## IP-region labels

The chart uses the public “IP region” labels displayed by Xiaohongshu. It does **not** obtain anyone's actual IP address.

The count, comment list, copy output, and chart all use the same comment records. A missing label is grouped under “Not displayed,” and smaller groups beyond the largest eight are merged into “Other.” Region data stays in side-panel memory. It is not saved, tied to usernames, or sent to the AI endpoint.

## AI is optional

Reading, copying, and the region chart work without an API.

To generate a summary, open the settings at the bottom of the side panel and enter your own endpoint, model, and API key. The default request format is DeepSeek Chat Completions. You can generate either:

- a short summary of what people are discussing; or
- a six-part report covering sentiment, topics, requests, disputes, and quoted evidence.

Comments are sent only after you click a generation button. The request does not include the page URL, cookies, account details, page HTML, or IP-region labels.

The API key is stored in `chrome.storage.session`, not in source code or persistent local storage. See [AI setup](docs/AI_SETUP.md) and [privacy and security](docs/PRIVACY.md) for details.

## If the reader stops finding comments

The default selector may stop working after a Xiaohongshu redesign. When the reader gets no matches three times in a row, the calibration settings open automatically:

1. Copy one complete, visible comment from the page.
2. Paste it into the calibration box.
3. Click the calibration button.

The pasted text is used for that lookup only and is cleared immediately afterwards. Only the new selector is saved.

## Repository map

```text
xhs-comment-reader/
├── src/                 extension runtime and side-panel UI
│   ├── background.js    opens the side panel
│   ├── sidepanel.html   page structure
│   ├── sidepanel.css    page styles
│   ├── sidepanel.js     comment reading and interaction
│   └── ai-utils.js      AI input, output, and evidence checks
├── tests/               automated tests
├── scripts/             validation and packaging
├── docs/                usage, privacy, and development notes
├── manifest.json        browser extension manifest
└── VERSION              current version
```

Generated `build/` and `deliverables/` directories are excluded from Git.

## Development

Node.js 20 or later is required. There are no third-party runtime dependencies, so you do not need to run `npm install` first.

```bash
npm test           # run the test suite
npm run validate   # check versions, permissions, security boundaries, and syntax
npm run package    # build the unpacked extension and release ZIP
```

The repository currently has 30 automated tests. See the [development guide](docs/DEVELOPMENT.md) for more details.

## Current limits

- It can only read comments already loaded on the page.
- It does not auto-scroll or expand replies that are not visible.
- Page-structure changes may require recalibration.
- AI output is a reading aid and still needs human review.
- Complete source is available only for `v0.1.11`; earlier source and Git history are unavailable.

## License

This is a public source-visible personal project, but no open-source license is currently granted. See [LICENSE-NOTICE.md](LICENSE-NOTICE.md).
