"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const panel = fs.readFileSync(path.join(root, "src/sidepanel.js"), "utf8");

test("manifest is a minimal MV3 side-panel extension", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["sidePanel", "scripting", "storage"]);
  assert.deepEqual(manifest.host_permissions, [
    "https://xiaohongshu.com/*",
    "https://*.xiaohongshu.com/*"
  ]);
  assert.deepEqual(manifest.optional_host_permissions, [
    "https://*/*",
    "http://localhost/*",
    "http://127.0.0.1/*"
  ]);
  assert.equal(manifest.content_scripts, undefined);
});

test("reader uses the user-provided selector as its default", () => {
  assert.match(panel, /const DEFAULT_SELECTOR = "span\[data-v-6726628e\]"/);
  assert.match(panel, /document\.querySelectorAll\(selector\)/);
  assert.match(panel, /chrome\.scripting\.executeScript/);
});

test("reader removes only adjacent comments with identical trimmed text", () => {
  const functionSource = panel
    .slice(panel.indexOf("function readPage(selector)"), panel.indexOf("function findSelectorByText(sampleText)"))
    .trim();
  const texts = ["相同评论", "  相同评论  ", "", "另一条", "相同评论"];
  const readPage = vm.runInNewContext(`(${functionSource})`, {
    location: { hostname: "www.xiaohongshu.com", pathname: "/explore/note-1" },
    document: {
      querySelectorAll(selector) {
        if (selector === ".comment-item") return [];
        if (selector === "span.location[selected-disabled-search]") return [];
        return texts.map((text) => ({ textContent: text }));
      }
    }
  });
  const result = readPage("span[data-v-test]");
  assert.deepEqual(
    Array.from(result.comments, (item) => ({ index: item.index, text: item.text })),
    [
      { index: 1, text: "相同评论" },
      { index: 2, text: "另一条" },
      { index: 3, text: "相同评论" }
    ]
  );
});

test("reader does not stop collecting comments at 500", () => {
  const functionSource = panel
    .slice(panel.indexOf("function readPage(selector)"), panel.indexOf("function findSelectorByText(sampleText)"))
    .trim();
  const texts = Array.from({ length: 650 }, (_value, index) => `评论 ${index + 1}`);
  const readPage = vm.runInNewContext(`(${functionSource})`, {
    location: { hostname: "www.xiaohongshu.com", pathname: "/explore/note-many" },
    document: {
      querySelectorAll(selector) {
        if (selector === ".comment-item") return [];
        if (selector === "span.location[selected-disabled-search]") return [];
        return texts.map((text) => ({ textContent: text }));
      }
    }
  });
  const result = readPage("span[data-v-test]");
  assert.equal(result.comments.length, 650);
  assert.deepEqual(
    { index: result.comments[649].index, text: result.comments[649].text },
    { index: 650, text: "评论 650" }
  );
  assert.doesNotMatch(functionSource, /comments\.length\s*>=\s*500/);
});

test("reader aggregates visible comment location labels for the pie chart", () => {
  const functionSource = panel
    .slice(panel.indexOf("function readPage(selector)"), panel.indexOf("function findSelectorByText(sampleText)"))
    .trim();
  const readPage = vm.runInNewContext(`(${functionSource})`, {
    location: { hostname: "www.xiaohongshu.com", pathname: "/explore/note-2" },
    document: {
      querySelectorAll(selector) {
        if (selector === ".comment-item") {
          const entries = [
            ["评论一", "中国香港"],
            ["评论二", "广东"],
            ["评论三", " 中国香港 "],
            ["评论四", "上海"]
          ];
          return entries.map(([comment, region]) => ({
            querySelector(innerSelector) {
              if (innerSelector === ".content") return { textContent: comment };
              if (innerSelector.includes("span.location")) return { textContent: region };
              return null;
            }
          }));
        }
        return [];
      }
    }
  });
  const result = readPage("span[data-v-test]");
  assert.deepEqual(
    Array.from(result.locations, (item) => ({ name: item.name, count: item.count })),
    [
      { name: "中国香港", count: 2 },
      { name: "广东", count: 1 },
      { name: "上海", count: 1 }
    ]
  );
  assert.equal(result.comments.length, 4);
  assert.equal(result.locations.reduce((sum, item) => sum + item.count, 0), result.comments.length);
});

test("comment count and IP distribution use the same 600 comment records", () => {
  const functionSource = panel
    .slice(panel.indexOf("function readPage(selector)"), panel.indexOf("function findSelectorByText(sampleText)"))
    .trim();
  const items = Array.from({ length: 600 }, (_value, index) => ({
    querySelector(innerSelector) {
      if (innerSelector === ".content") return { textContent: `评论 ${index + 1}` };
      if (innerSelector.includes("span.location")) return { textContent: index % 2 ? "广东" : "广西" };
      return null;
    }
  }));
  const readPage = vm.runInNewContext(`(${functionSource})`, {
    location: { hostname: "www.xiaohongshu.com", pathname: "/explore/note-unified" },
    document: {
      querySelectorAll(selector) {
        if (selector === ".comment-item") return items;
        return [];
      }
    }
  });
  const result = readPage("span[data-v-test]");
  assert.equal(result.comments.length, 600);
  assert.equal(result.locations.reduce((sum, item) => sum + item.count, 0), 600);
  assert.equal(result.matchCount, 600);
});

test("calibration learns a nearby data-v selector and persists only that selector", () => {
  assert.match(panel, /findSelectorByText/);
  assert.match(panel, /\^data-v-/);
  assert.match(panel, /chrome\.storage\.local/);
  assert.match(panel, /\[STORAGE_KEY\]: \{ selector: currentSelector \}/);
  assert.doesNotMatch(panel, /\[STORAGE_KEY\]: \{[^}]*sample/i);
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  for (const id of ["settings", "sample-text", "calibrate", "reset-selector", "calibration-hint"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});

test("one-click copy is placed below the match count and copies every matched text line", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  assert.match(html, /id="match-count"[\s\S]*id="copy-comments"/);
  assert.match(panel, /function copyAllComments/);
  assert.match(panel, /lastComments\.map\(\(item\) => item\.text\)\.join\("\\n"\)/);
  assert.match(panel, /navigator\.clipboard\.writeText/);
});

test("compact labels omit build and network-capture descriptions", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  assert.match(html, /<span>评论数<\/span>[\s\S]*id="match-count"/);
  assert.doesNotMatch(html, /可折叠.*版|匹配元素|id="message"/);
  assert.doesNotMatch(panel, /不使用网络抓包|匹配元素 #/);
});

test("reader detects XiaoHongShu host and note paths", () => {
  assert.match(panel, /hostname === "xiaohongshu\.com"/);
  assert.match(panel, /hostname\.endsWith\("\.xiaohongshu\.com"\)/);
  assert.match(panel, /explore\|discovery/);
});

test("runtime has no network capture, comment persistence, or page automation", () => {
  const runtime = ["src/background.js", "src/sidepanel.js"].map((file) =>
    fs.readFileSync(path.join(root, file), "utf8")).join("\n");
  assert.doesNotMatch(runtime, /XMLHttpRequest|window\.fetch|indexedDB|webRequest|debugger/);
  assert.doesNotMatch(runtime, /scrollIntoView|\.click\(\)|document\.cookie|xsec_token|requestHeaders/);
});

test("DeepSeek integration is user-triggered and stores bearer token in session only", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  for (const id of ["comment-summary", "opinion-report", "cancel-summary", "api-endpoint", "api-token", "api-model", "ai-summary"]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(panel, /chrome\.permissions\.request/);
  assert.match(panel, /storageSet\("session", AI_TOKEN_KEY/);
  assert.doesNotMatch(panel, /storageSet\("local", AI_TOKEN_KEY/);
  assert.match(panel, /messages:[\s\S]*role: "system"[\s\S]*role: "user"[\s\S]*content: prompt/);
  assert.match(panel, /thinking: \{ type: "disabled" \}/);
  assert.match(panel, /response_format: \{ type: "json_object" \}/);
  assert.match(panel, /renderAnalysisReport/);
  assert.match(panel, /renderCommentSummary/);
  assert.match(panel, /generateAnalysis\("comment-summary"\)/);
  assert.match(panel, /generateAnalysis\("opinion-report"\)/);
});

test("analysis is collapsible and calibration settings are the final panel", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  assert.match(html, /<details class="card analysis-panel" id="analysis-panel">[\s\S]*<summary class="analysis-toggle">/);
  const commentsPosition = html.indexOf('id="comments"');
  const calibrationPosition = html.indexOf('id="settings"');
  assert.ok(commentsPosition >= 0 && calibrationPosition > commentsPosition);
  assert.ok(calibrationPosition < html.indexOf("</main>"));
});

test("external API settings are nested inside the final settings panel", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  assert.match(html, /<details class="card settings" id="settings">[\s\S]*<details class="settings-group" id="ai-settings">[\s\S]*外部 AI API 设置/);
});

test("current page comments are collapsible and open by default", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "src/sidepanel.css"), "utf8");
  assert.match(html, /<details class="card comments-card comments-panel" id="comments-panel" open>[\s\S]*<summary class="comments-toggle">/);
  assert.match(html, /<summary class="comments-toggle">[\s\S]*id="scanned-at"[\s\S]*id="comments"/);
  assert.match(css, /\.comments-panel\[open\] > \.comments-toggle::before/);
});

test("location distribution has a collapsible local pie chart", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "src/sidepanel.css"), "utf8");
  assert.match(html, /id="location-panel"[\s\S]*id="location-pie"[\s\S]*id="location-legend"/);
  assert.match(panel, /span\.location\[selected-disabled-search\]/);
  assert.match(panel, /function renderLocations\(locations\)/);
  assert.match(panel, /conic-gradient/);
  assert.match(css, /\.location-pie/);
});

test("fixed unpacked installation can reload itself after local files change", () => {
  const html = fs.readFileSync(path.join(root, "src/sidepanel.html"), "utf8");
  assert.match(html, /id="reload-extension"/);
  assert.match(panel, /reloadExtension\.addEventListener\("click", \(\) => chrome\.runtime\.reload\(\)\)/);
});

test("all manifest file references exist", () => {
  assert.ok(fs.existsSync(path.join(root, manifest.background.service_worker)));
  assert.ok(fs.existsSync(path.join(root, manifest.side_panel.default_path)));
  assert.ok(fs.existsSync(path.join(root, "src/sidepanel.js")));
  assert.ok(fs.existsSync(path.join(root, "src/sidepanel.css")));
  assert.ok(fs.existsSync(path.join(root, "src/ai-utils.js")));
});
