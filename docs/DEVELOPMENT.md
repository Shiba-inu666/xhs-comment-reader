# 开发指南

## 环境要求

- Node.js 20 或更高版本
- Chrome 116 或更高版本，或者兼容 Manifest V3 的 Edge
- 系统提供 `zip` 命令（仅打包时需要）

项目运行时没有第三方依赖，不需要执行 `npm install`。

## 本地开发

1. 在浏览器扩展管理页加载项目根目录。
2. 修改 `src/` 中的文件。
3. 在扩展管理页点击刷新。
4. 重新打开侧边栏验证变化。

主要文件：

- `src/background.js`：点击扩展图标时打开侧边栏。
- `src/sidepanel.html`：侧边栏 DOM 结构。
- `src/sidepanel.css`：界面样式。
- `src/sidepanel.js`：页面检测、评论读取、设置和 API 请求。
- `src/ai-utils.js`：评论预处理、Prompt、结果解析和证据校验。

## 自动化命令

```bash
npm test
```

运行 `tests/*.test.js`。

```bash
npm run validate
```

检查以下内容：

- `VERSION`、`manifest.json` 与 `package.json` 版本一致
- Manifest V3 与权限边界正确
- 没有疑似硬编码 API Key
- 没有网络拦截或凭据读取逻辑
- JavaScript 语法正确
- 全部自动化测试通过

```bash
npm run package
```

生成：

- `build/unpacked/`：浏览器可直接加载的固定目录
- `deliverables/xhs-comment-reader-minimal-v版本号.zip`：发布包
- `deliverables/SHA256SUMS.txt`：ZIP 的 SHA-256 校验值

生成目录已经加入 `.gitignore`。

## 修改版本号

发布新版本时，需要同步修改：

1. `VERSION`
2. `manifest.json` 中的 `version`
3. `package.json` 中的 `version`
4. `CHANGELOG.md`

然后运行 `npm run validate` 和 `npm run package`。

## 代码边界

- 只读取当前页面已经加载的评论 DOM。
- 不添加网络拦截、自动滚动、自动点击或账号数据采集。
- API Key 只能保存在 `chrome.storage.session`。
- 评论和 AI 输出不得写入持久化存储。
- 运行时保持零第三方依赖。
