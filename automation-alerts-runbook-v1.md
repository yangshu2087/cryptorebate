> 日常入口：
> - [Docs Index](/Users/yangshu/.openclaw/workspace/docs/INDEX.md)

# 007 自动化异常处理手册

## 处理顺序
1. 先看 `/en/admin/seo` 的状态卡
2. 再看 alerts 区块
3. 再看 GitHub Actions / 对应 API

## 常见异常与动作
### CTA Live Audit 失败
- 打开告警卡里的 GitHub Actions 链接
- 看失败步骤是 build、route 还是线上 CTA 验收
- 若失败原因是线上旧部署，先确认 Vercel 是否 alias 到最新版本

### GSC Sync 失败
- 检查 `AUTOMATION_GSC_*` secrets
- 检查 Search Console property 是否正确
- 检查 Google service account 是否仍有 Search Console 权限

### Partner Sync 失败
- 看是哪个交易所失败
- 核对 provider / URL / token / key / secret
- 如果是 portal CSV，先确认月初导出的 CSV 格式和下载链接仍有效
- 如果当前业务身份只是 affiliate/referral，不要默认切去 broker
- 只有你后来真的拿到高级 API / broker 凭据时，才检查 OKX/Gate 签名参数

### 真实覆盖率过低
- 说明当前 ROI 仍混有大量模拟或估算数据
- 不要直接用作收入决策
- 优先补 partner source 接入与 click → conversion 对齐

### alerts 很多但没有真实数据
- 先处理“未接通”
- 再处理“真实覆盖率”
- 最后才优化机会分数与扩页逻辑
