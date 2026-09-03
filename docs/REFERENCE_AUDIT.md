# Reference audit

Checked: 2026-09-02

This extension is an independent implementation. No source code, prompts, assets, sample data, browser profiles, cookies, or API credentials were copied from the repositories below.

| Repository | License observed | Concepts reviewed | Used in this extension |
|---|---|---|---|
| https://github.com/VladUZH/harken | MIT | Normalize → deduplicate → sentiment → themes → report pipeline; local-first boundaries | Independent text normalization, exact deduplication, separate sentiment and topic sections |
| https://github.com/WJS-WEB/xiaohongshu-sentiment-analysis | MIT file plus repository-specific research/non-commercial disclaimer | XiaoHongShu-oriented report dimensions and evidence-based presentation | Report dimensions only; its Selenium collection, browser profile, database and report code are not used |
| https://github.com/JAYDEN-LIAO/MediaRadar | README states MIT; no root LICENSE file was verified during this audit | Analyst → reviewer → director pipeline and risk evidence | Reduced independent two-stage design: batch analysis followed by final merge/review |
| https://github.com/pillar/trendradar | GPL-3.0 | Configurable LLM provider and analysis prompt concepts | Concepts only; no GPL source or prompt text copied |
| https://github.com/yichuanhu/xhs-skill/blob/main/references/browse.md | License not verified in this read-only review | Current semantic comment DOM names: `.comment-item`, `.content`, `.location` | Selector names only; the unified comment/location record algorithm and all implementation code are independent |

The extension continues to read only comments already present in the active page DOM. It does not incorporate the crawlers, automatic scrolling, login-session reuse, cookie pools, scheduled monitoring, alert delivery, or multi-account features found in some reference projects.
