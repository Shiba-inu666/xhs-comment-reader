# 小红书评论读取器

[简体中文](README.md) · [English](README_EN.md)

一个轻量、无需后端的 Chrome / Edge 侧边栏扩展，用于抓取（读取）当前小红书笔记页面中**已经加载**的评论、复制评论文本，并统计评论区 IP 属地分布。还可以按需调用用户自己配置的 AI 接口，生成评论总结或舆情报告。

**核心能力：小红书评论区抓取 + IP 属地分布统计。** 扩展直接读取页面中已经显示的评论 DOM，不拦截网络请求，也不会自动滚动或采集账号信息。

当前版本：`v0.1.11`

> 适合谁：想快速整理评论、查看 IP 属地分布，或对评论做初步分析的个人用户。

## 功能一览

- 抓取（读取）当前页面已经加载的评论
- 一键复制全部评论
- 统计评论区 IP 属地并显示饼图
- 自动忽略相邻的重复评论
- 评论区 DOM 变化后可自动校准选择器
- 主动点击后，可调用用户自己配置的 DeepSeek 兼容接口
- 分别生成“评论区总结”和“六维舆情报告”

扩展不会抓包、自动滚动、自动点击、读取 Cookie 或收集账号信息。

## 5 分钟安装

### 方式一：加载源码

1. 下载或克隆本仓库。
2. 在 Chrome 打开 `chrome://extensions`，Edge 打开 `edge://extensions`。
3. 打开右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择本项目的根目录，也就是包含 `manifest.json` 的目录。

安装完成后，打开任意小红书笔记，点击浏览器工具栏中的扩展图标即可打开侧边栏。

### 方式二：加载打包目录

如果你是开发者并运行过 `npm run package`，也可以选择 `build/unpacked` 目录。这个目录每次打包时都会自动更新。

更详细的图文式步骤和常见问题见 [安装与使用指南](docs/INSTALLATION.md)。

## 基本使用

1. 打开一篇小红书笔记，并确认评论已经显示在页面上。
2. 打开扩展侧边栏。
3. 点击“开始检测并读取评论”。
4. 在侧边栏查看评论、IP 属地分布，或点击“一键复制全部评论”。

页面滚动后新加载出的评论会在下一次检测时出现。扩展本身不会替你自动滚动页面。

## AI 总结（可选）

AI 功能默认使用 DeepSeek Chat Completions 格式，只有在你主动点击生成按钮后才会发送评论正文。

1. 展开侧边栏底部的“设置与自动校准”。
2. 展开“外部 AI API 设置”。
3. 填写 API 地址、模型和 API Key。
4. 保存后选择“生成评论区总结”或“生成舆情报告”。

API Key 只保存在 `chrome.storage.session`，通常会在浏览器完全退出后清除。配置方法和数据发送范围见 [AI 配置指南](docs/AI_SETUP.md) 与 [隐私说明](docs/PRIVACY.md)。

## 项目结构

```text
xhs-comment-reader/
├── src/                 # 扩展运行代码和侧边栏页面
│   ├── background.js    # 打开侧边栏
│   ├── sidepanel.html   # 页面结构
│   ├── sidepanel.css    # 页面样式
│   ├── sidepanel.js     # 评论读取和交互逻辑
│   └── ai-utils.js      # AI 输入、输出与证据校验
├── tests/               # Node.js 自动化测试
├── scripts/             # 校验和打包脚本
├── docs/                # 面向用户和开发者的详细文档
├── manifest.json        # Chrome 扩展清单
├── package.json         # 开发命令和版本信息
├── VERSION              # 唯一版本号
└── README.md            # 项目入口说明
```

`build/` 和 `deliverables/` 是运行打包命令后生成的目录，不提交到 Git。

## 开发与测试

需要 Node.js 20 或更高版本。本项目运行时没有第三方依赖，因此无需执行 `npm install`。

```bash
npm test
npm run validate
npm run package
```

- `npm test`：运行自动化测试
- `npm run validate`：检查版本、权限、安全边界和语法，并运行测试
- `npm run package`：生成 `build/unpacked` 与可分发 ZIP

完整说明见 [开发指南](docs/DEVELOPMENT.md)。

## 文档导航

- [安装与使用指南](docs/INSTALLATION.md)
- [AI 配置指南](docs/AI_SETUP.md)
- [隐私与安全说明](docs/PRIVACY.md)
- [开发指南](docs/DEVELOPMENT.md)
- [版本记录](CHANGELOG.md)
- [第三方项目参考审计](docs/REFERENCE_AUDIT.md)

## 已知限制

- 只能读取页面当前已经加载的评论。
- 小红书页面结构变化后，默认选择器可能失效，需要重新校准。
- AI 服务的费用、可用性和数据处理规则由你选择的服务商决定。
- 当前代码仓库只保留了 `v0.1.11`，更早版本的源代码和变更记录不可用。

## 许可说明

这是个人本地原型。目前没有授予公开开源许可证，详见 [LICENSE-NOTICE.md](LICENSE-NOTICE.md)。
