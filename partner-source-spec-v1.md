> 日常入口：
> - [Docs Index](/Users/yangshu/.openclaw/workspace/docs/INDEX.md)

# 007 Partner Source 接入规范

## 目标
统一 7 家交易所 partner earnings 外部源接入方式，让 conversion / commission 可以进入自动化状态与 ROI 报表。

## 当前支持的 provider
- `generic`
- `csv-portal`
- `okx-broker`
- `gate-api4`

## 每家交易所最少需要什么
### 通用
- `ENABLED`
- `PROVIDER`
- `URL`（如果 provider 需要）
- `MODE`
- `FORMAT`
- `FALLBACK_LOCALE`
- `FALLBACK_PAGE_TYPE`

### 鉴权
根据 provider 选择：
- `TOKEN`
- `AUTH_HEADER`
- `KEY`
- `SECRET`
- `PASSPHRASE`
- `BODY_JSON`

## 推荐优先级
1. OKX
2. Gate
3. HTX
4. Bybit
5. Bitget
6. KuCoin
7. Binance

## 成功接入的最低标准
- `/api/stats/seo` 里该交易所 `partnerByExchange.reality` 不再是 `未接通`
- `externalSources.partners[]` 有 `configured=true`
- 至少有一项：
  - `conversionsWritten > 0`
  - `commissionsWritten > 0`
- 控制台对应交易所不再只显示模拟/估算

## 常见失败原因
- provider 选错
- URL 指向 portal 页面而不是可下载报表/API
- token/header 缺失
- OKX/Gate 签名参数不完整
- fallback page type 与 exchange/pageType 不匹配
