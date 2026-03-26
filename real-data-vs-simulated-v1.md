> 日常入口：
> - [Docs Index](/Users/yangshu/.openclaw/workspace/docs/INDEX.md)

# 007 真实数据 vs 估算/模拟数据说明

## 目的
这份文档用于统一解释 cryptorebate 后台控制台与 `/api/stats/seo` 里的四种数据标签，避免把模型值误读成真实经营结果。

## 四种标签
- **真实**：来自线上接口或已接入外部源，且当前快照里已经写入有效记录。
- **估算**：基于真实状态或真实部分输入做的模型推算，不等于已结算收入。
- **模拟**：来自 seed、规则生成或 synthetic 数据，只用于跑通自动化与验证展示结构。
- **未接通**：真实外部源尚未配置，或虽然框架在但生产配置仍为空。

## 当前默认判读
- **GSC**
  - 接口成功且 `signalsWritten > 0`：真实
  - 仅完成认证但没拉到 query：估算
  - 未配置：未接通
- **Partner Earnings**
  - partner source 成功写入 conversions/commissions：真实
  - 已配置但尚未成功写入：估算
  - 未配置：未接通
- **Signals / Opportunities**
  - 没有真实 GSC query 时：模拟
  - 有真实 query 后：机会仍按模型评分，通常属于估算
- **Projected revenue / ROI 排行**
  - 未接真实 partner 收益前：模拟
  - 接入部分真实收益后：估算或真实，取决于真实覆盖率

## 运营上怎么用
- 看“有没有数据源”：先看 **未接通**
- 看“有没有开始回流”：再看 **真实**
- 看“可不可以做经营判断”：最后才看 **估算/模拟**

## 不应该怎么用
- 不要把“月度预估收益”当作已结算佣金
- 不要把 synthetic ROI 当作真实利润
- 不要在 partner 还未接通时，用控制台收益排行做渠道预算决策
