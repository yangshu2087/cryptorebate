# 007 全球加密货币返佣平台 / cryptorebate

- 中文名：全球加密货币返佣平台
- 英文名：cryptorebate
- 类型：Web 产品 / 增长 / 联盟返佣 / 商业化
- 当前状态：进行中（可构建、可部署、持续优化）

## 项目目标
做一个“先比较，再注册”的可信返佣决策站点：让用户在注册交易所前，先看清返佣比例、手续费、KYC 门槛和适配人群，再通过邀请链接行动。

## 最近进展（本轮）
- 交易所数据扩展到 7 家（含 KuCoin / Huobi）
- 多语言扩展到 11 语种（默认英语，保留简体中文）
- 品牌资产与页面接入完成（wordmark / mark / icon / OG 图）
- SEO/GEO 内容集群扩展到 6 类子页：`referral-code`、`signup-kyc`、`fees-rebate`、`official-site`、`app-download`、`safety-review`
- 线上 `sitemap.xml` 已纳入 462 个 GEO 路径，并已重新提交给 Google Search Console
- 最小后端闭环已补齐：`GET /api/exchanges` 与 `POST /api/clicks`
- 分析采集已加 consent gate：用户同意前不初始化 PostHog，也不发送点击日志
- 新增部署与质量门禁：
  - `web/vercel.json`：强制 `www -> apex` 301
  - `web/package.json`：新增 `npm run check` 与 Vercel 一键部署命令
  - `.github/workflows/quality-gates.yml`：PR / Push 自动跑 lint + test + build

## 当前覆盖
- 交易所（7）：Binance、OKX、Bybit、Bitget、Gate.io、KuCoin、Huobi/HTX
- 语言（11）：en、zh、zh-tw、ja、ko、ru、es、pt、vi、th、hi
- 主域名策略：`cryptorebate.app` 为主域，`www.cryptorebate.app` 永久 301 到主域
- GEO 子页规模：`7 exchanges × 6 page types × 11 locales = 462`

## 关键文档
- `INDEX.md`
- `PRD-v1.md`
- `information-architecture-v1.md`
- `growth-and-seo-v1.md`
- `revenue-tracking-v1.md`
- `risk-guardrails-v1.md`
- `launch-plan-p0-v1.md`
- `brand-assets-usage.md`
- `logo-redesign-brief.md`
- `logo-generation-prompts.md`
- `logo-wordmark-spec.md`
- `web/README.md`

## 代码入口
- `web/`（Next.js App Router）

## 快速命令
```bash
cd web
npm run check
npm run dev
npm run deploy:vercel
```

## 上线口径
- Vercel 项目 Root Directory 设为 `web`
- 当前正式生产项目名为 `cryptorebate`
- 发布前必须先通过 `npm run check`
- `www.cryptorebate.app` 通过 Vercel 永久重定向收口到 `https://cryptorebate.app`
