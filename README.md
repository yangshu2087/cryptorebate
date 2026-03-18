# 007 返佣导航平台 / cryptorebate

- 中文名：全球加密货币返佣平台
- 英文名：cryptorebate
- 类型：Web产品 / 增长 / 联盟返佣 / 商业化
- 当前状态：进行中
- 当前阶段：Web P0 + 数据持久化与同步已落地（待生产环境密钥后可上线）

## 命名建议
当前项目统一命名为 **cryptorebate**。

理由：
- `crypto` 直接锚定加密返佣场景
- `rebate` 直接点题：返佣
- `.app` 域名与产品名一致，利于记忆、搜索与传播

## 目标
一句话收口：先做一个**简洁、逻辑清晰、体验感强**的全球加密货币返佣 Web 平台，让用户通过你的链接注册交易所，从而形成持续返佣；同时用可读 API 和后台看板实时查看返佣和收益，后续再扩展 App 与更多分发渠道。

## 产品定位
这不是一个“堆满广告和交易所 banner 的返利站”，而是一个：
- 清晰比较不同交易所返佣/折扣方案
- 让用户快速理解为什么该走你的链接
- 让 Owner 实时看到返佣收益与转化表现
- 能持续通过 SEO / 内容 / 分享拿全球自然流量的产品

## 最近结果
已完成首轮可运行 Web P0，并新增生产化数据链路：Postgres 持久化点击归因、交易所同步任务（Binance/OKX/Bybit/Bitget/Gate）、dashboard 真数据聚合、每周实验种子任务（CTA/模板/排序）、72h 保守模式风险切换脚本、Vercel/Cloudflare 部署配置。

## 关键产物
- `projects/007-rebatepilot/PRD-v1.md`
- `projects/007-rebatepilot/information-architecture-v1.md`
- `projects/007-rebatepilot/growth-and-seo-v1.md`
- `projects/007-rebatepilot/revenue-tracking-v1.md`
- `projects/007-rebatepilot/risk-guardrails-v1.md`
- `projects/007-rebatepilot/launch-plan-p0-v1.md`
- `projects/007-rebatepilot/INDEX.md`
- `projects/007-rebatepilot/web/README.md`

## 下一步
进入上线前冲刺：补齐生产环境 `DATABASE_URL + 5 家真实 referral 链接`，执行 `db:migrate -> sync:exchanges -> sync:metrics -> seed:weekly-experiments`，先上 Vercel，再按周推进内容与转化实验，稳定后再评估 App 范围。

## 补充执行规则
- Owner 资料可陆续补；缺什么我主动索取，或在每日汇报提醒。
- 资料未完全齐备前，不停工，先按当前方案推进可落地部分。
- 若缺技能或行业信息，默认由我自行补齐。
- Owner 过程中新给的思路，默认由我先甄别，再决定是否纳入主方案。

## 反向风险
最容易犯的蠢错，是把这项目做成低质返利站：页面乱、信息杂、信任感差、SEO 内容水。那种站看似能上线，实际上很难做大，也留不住高质量用户。
