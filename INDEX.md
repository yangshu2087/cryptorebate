# 007 cryptorebate / INDEX

## 建议阅读顺序
1. `README.md`（当前状态与上线口径）
2. `PRD-v1.md`（产品边界）
3. `web/README.md`（工程与部署）
4. 品牌封口文档（`brand-assets-usage.md`、`logo-redesign-brief.md`、`logo-wordmark-spec.md`）

## 核心产物
- `README.md`
- `PRD-v1.md`
- `information-architecture-v1.md`
- `growth-and-seo-v1.md`
- `seo-geo-automation-architecture-v1.md`
- `revenue-tracking-v1.md`
- `risk-guardrails-v1.md`
- `launch-plan-p0-v1.md`
- `brand-assets-usage.md`
- `logo-redesign-brief.md`
- `logo-generation-prompts.md`
- `logo-wordmark-spec.md`
- `web/README.md`

## 当前执行口径
- 站点默认语言：`en`（保留 `zh` 与其他多语言）
- 数据质量门禁：`npm run check` + GitHub Actions
- 域名策略：`www.cryptorebate.app` 永久 301 到 `cryptorebate.app`
- 生产项目：Vercel `cryptorebate`，Root Directory=`web`
- 推荐发布方式：仓库根目录 `npx vercel --prod`；`web/` 目录只通过 `npm run deploy:vercel` 间接发布
- GEO 路由：每个交易所有 6 类子页，当前线上共 462 个 GEO URL
- 分析策略：默认不采集，用户同意后才初始化 PostHog 并发送点击日志
- 自动化架构：repo-driven SEO/GEO loop，生成 opportunities / pages / ROI / earnings / control state

## 当前覆盖快照
- 交易所（7）：Binance、OKX、Bybit、Bitget、Gate.io、KuCoin、Huobi/HTX
- 语种（11）：en、zh、zh-tw、ja、ko、ru、es、pt、vi、th、hi
- 品牌资产主路径：`web/public/images/brand/*`
- 最小 API：`GET /api/exchanges`、`POST /api/clicks`
- 自动化 API：`/api/opportunities`、`/api/pages`、`/api/stats/seo`、`/api/earnings`、`/api/roi`
