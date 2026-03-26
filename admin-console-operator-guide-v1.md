> 日常入口：
> - [Docs Index](/Users/yangshu/.openclaw/workspace/docs/INDEX.md)

# 007 运营控制台使用说明

## 页面入口
- 线上页面：`/en/admin/seo`
- UI 文案固定为简体中文
- 页面 `noindex`，只用于内部运营查看

## 先看哪里
### 1. 顶部指标卡
优先判断：
- 信号数
- 机会数
- 已发布页面
- 月度预估收益
- 告警数

同时必须看每张卡片上的：
- 真实
- 估算
- 模拟
- 未接通

### 2. 三张状态卡
- **最近一次 CTA Live Audit**：确认线上 CTA 验收有没有失败
- **最近一次 GSC Sync**：确认 Search Console query 是否持续写入
- **最近一次 Partner Sync**：确认真实 registration / commission 是否在回流

### 3. 三张运营摘要卡
- **7 家交易所真实度分布**：看当前哪些交易所已进入真实、估算、模拟、未接通
- **最近 7 天变化**：看 clicks / registrations / commissions / 真实覆盖率
- **失败趋势**：看 critical alerts、warning alerts、partner failures、CTA 状态

## Partner 运营默认动作
- 当前默认不是 broker-first
- 当前默认是 **affiliate-first**
- 建议每个月初从 7 家交易所 affiliate / referral 后台导出 CSV
- 再导入系统，让 partner sync 从“未接通/估算”逐步转成“真实”

## 告警区怎么用
- CTA Live Audit 失败：优先检查 GitHub Actions 运行详情
- GSC Sync 失败：检查 Google 凭据、property、query rows
- Partner Sync 失败：检查对应交易所 provider、URL、token、签名参数
- 真实覆盖率过低：不要把 ROI 结果当成真实利润

## 什么时候能做经营判断
至少满足以下两条：
1. GSC 已持续拉出真实 query
2. 至少 1-2 家交易所的 partner earnings 已真实回流

在此之前，控制台更适合看：
- 架构是否跑通
- 哪些模块未接通
- 哪些页已经覆盖
