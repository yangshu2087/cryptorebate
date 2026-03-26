> 日常入口：
> - [Docs Index](/Users/yangshu/.openclaw/workspace/docs/INDEX.md)

# 007 Partner Source 接入规范

## 目标
统一 7 家交易所 partner earnings 外部源接入方式，让 conversion / commission 可以进入自动化状态与 ROI 报表。

## 默认策略
本项目的默认接入原则是：
- **affiliate-first**
- **每月月初手工导出 CSV**
- **CSV 导入优先于 API / broker**

也就是说，007 当前默认假设你是：
- 内容导流 / referral / affiliate 站点
- 不是 broker、不是代客交易、也不是机构 API 经纪体系

## 当前支持的 provider
- `csv-portal`（默认推荐）
- `generic`
- `okx-broker`（高级可选）
- `gate-api4`（高级可选）

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

## 默认推荐口径
### 对 7 家交易所，默认都先按这个走
1. 登录交易所 affiliate / referral 后台
2. 月初导出佣金/邀请用户/返佣明细 CSV
3. 用 `csv-portal` 或 `generic` 方式导入
4. 只有在你真实拿到 partner API / broker API 凭据后，才改成高级 provider

### 月初 CSV 导入命令
```bash
cd /Users/yangshu/.openclaw/workspace/projects/007-cryptorebate-restored/web
npm run partner:import:csv -- --exchange okx --file /absolute/path/to/okx.csv
npm run partner:import:csv -- --exchange gate --file /absolute/path/to/gate.csv --mode commissions
npm run partner:import:csv:dry-run -- --exchange bybit --file /absolute/path/to/bybit.csv --locale en --pageType official-site
```

默认行为：
- 自动解析常见 CSV 字段名（registeredAt / commissionUsd / date / timestamp 等）
- 若 CSV 不含 `locale` / `pageType` / `queryClusterId`，会用 CLI fallback 生成 cluster id
- 默认去重，重复导入同一批 CSV 不会重复写入；只有显式传 `--allow-duplicates` 才会重复追加

### 7 家交易所当前默认建议
1. Binance → `csv-portal`
2. OKX → `csv-portal`
3. Bybit → `csv-portal`
4. Bitget → `csv-portal`
5. Gate → `csv-portal`
6. KuCoin → `csv-portal`
7. Huobi / HTX → `csv-portal`

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

## 为什么不是默认走 broker
- 007 项目的业务身份是 affiliate / referral，不是 broker
- broker 模式更适合机构、经纪商、交易 API 业务
- 对当前项目来说，**月初 CSV 导出 + 导入** 更符合真实运营流程，也更容易持续执行
