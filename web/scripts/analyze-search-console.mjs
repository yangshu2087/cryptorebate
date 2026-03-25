#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error(
    "Usage: npm run seo:search-console -- /absolute/path/to/search-console-export.csv"
  );
  process.exit(1);
}

const EXISTING_INTENTS = new Set([
  "referral-code",
  "signup-kyc",
  "fees-rebate",
  "official-site",
  "app-download",
  "safety-review",
]);

const FUTURE_INTENTS = [
  "login",
  "country-availability",
  "deposit-withdrawal",
  "copy-trading",
  "trading-bot",
  "proof-of-reserves",
  "verification-troubleshooting",
  "new-listings",
];

const EXCHANGE_PATTERNS = {
  binance: ["binance", "币安", "幣安", "バイナンス", "바이낸스", "бинанс"],
  okx: ["okx", "欧易", "歐易", "オーケーエックス", "오케이엑스", "окх"],
  bybit: ["bybit", "バイビット", "바이비트", "байбит"],
  bitget: ["bitget", "ビットゲット", "비트겟", "битгет"],
  gate: ["gate.io", "gate", "芝麻开门", "芝麻開門", "ゲート", "게이트", "гейт"],
  kucoin: ["kucoin", "クーコイン", "쿠코인", "кукоин"],
  huobi: ["htx", "huobi", "火币", "火幣", "フォビ", "후오비", "хуоби"],
};

const INTENT_PATTERNS = {
  "referral-code": [
    "referral",
    "invite code",
    "invite",
    "rebate",
    "邀请码",
    "邀請碼",
    "紹介コード",
    "招待コード",
    "추천코드",
    "추천 코드",
    "рефкод",
    "рефераль",
    "código de referido",
    "código de indicação",
  ],
  "signup-kyc": [
    "signup",
    "sign up",
    "register",
    "registration",
    "kyc",
    "verify",
    "verification",
    "注册",
    "註冊",
    "注册 kyc",
    "登録",
    "本人確認",
    "가입",
    "회원가입",
    "верифика",
    "регистрац",
    "registro",
    "cadastrar",
    "cadastro",
  ],
  "fees-rebate": [
    "fees",
    "fee",
    "trading fee",
    "commission",
    "手续费",
    "手續費",
    "手数料",
    "수수료",
    "комис",
    "comisiones",
    "taxas",
  ],
  "official-site": [
    "official site",
    "official website",
    "official",
    "official url",
    "official domain",
    "官网",
    "官網",
    "官方",
    "公式サイト",
    "公式url",
    "公式ドメイン",
    "공식 사이트",
    "공식 url",
    "официальный сайт",
    "официальный",
    "sitio oficial",
    "web oficial",
    "site oficial",
    "website oficial",
  ],
  "app-download": [
    "app download",
    "download app",
    "download",
    "apk",
    "app",
    "app下载",
    "app下載",
    "アプリ",
    "ダウンロード",
    "앱 다운로드",
    "앱",
    "скачать приложение",
    "приложение",
    "descargar app",
    "app oficial",
    "baixar app",
    "aplicativo",
  ],
  "safety-review": [
    "safe",
    "safety",
    "review",
    "legit",
    "scam",
    "trust",
    "security",
    "安全吗",
    "安全嗎",
    "正规吗",
    "正規",
    "安全性",
    "評判",
    "危険",
    "안전",
    "평판",
    "безопас",
    "надеж",
    "отзывы",
    "seguridad",
    "confiable",
    "reseña",
    "segurança",
    "confiável",
    "avaliação",
  ],
  login: [
    "login",
    "log in",
    "sign in",
    "登录",
    "登入",
    "ログイン",
    "로그인",
    "вход",
    "iniciar sesión",
    "entrar",
    "login",
  ],
  "country-availability": [
    "country",
    "region",
    "available in",
    "supported country",
    "地区",
    "地區",
    "国家",
    "地域",
    "국가",
    "지역",
    "страна",
    "регион",
    "país",
    "región",
    "país",
    "região",
  ],
  "deposit-withdrawal": [
    "deposit",
    "withdraw",
    "withdrawal",
    "充值",
    "提现",
    "提現",
    "入金",
    "出金",
    "입금",
    "출금",
    "депозит",
    "вывод",
    "depósito",
    "retiro",
    "saque",
  ],
  "copy-trading": [
    "copy trading",
    "copy trade",
    "跟单",
    "跟單",
    "コピートレード",
    "카피트레이딩",
    "копитрейдинг",
    "copy trading",
    "copytrade",
  ],
  "trading-bot": [
    "bot",
    "trading bot",
    "grid bot",
    "机器人",
    "機器人",
    "ボット",
    "봇",
    "бот",
    "bot de trading",
    "robô",
  ],
  "proof-of-reserves": [
    "proof of reserves",
    "reserves",
    "储备证明",
    "儲備證明",
    "準備金",
    "준비금",
    "резервы",
    "prueba de reservas",
    "prova de reservas",
  ],
  "verification-troubleshooting": [
    "kyc failed",
    "verification failed",
    "cannot verify",
    "认证失败",
    "認證失敗",
    "審査",
    "인증 실패",
    "верификация не проходит",
    "verificación fallida",
    "verificação falhou",
  ],
  "new-listings": [
    "new listing",
    "new coin",
    "listed coins",
    "上新",
    "新币",
    "新幣",
    "上場",
    "신규 상장",
    "новые листинги",
    "nuevo listado",
    "nova listagem",
  ],
};

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }

      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows.filter((item) => item.some((cell) => cell.trim() !== ""));
}

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function getField(row, headers, candidates) {
  for (const candidate of candidates) {
    const normalized = normalizeHeader(candidate);
    const index = headers.findIndex((header) => header === normalized);
    if (index >= 0) {
      return row[index] ?? "";
    }
  }

  return "";
}

function toNumber(value) {
  const normalized = value.replace(/[%,$\s]/g, "").replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function detectExchange(text) {
  const haystack = text.toLowerCase();

  for (const [slug, patterns] of Object.entries(EXCHANGE_PATTERNS)) {
    if (patterns.some((pattern) => haystack.includes(pattern.toLowerCase()))) {
      return slug;
    }
  }

  return null;
}

function detectLocale(query) {
  if (/[ぁ-んァ-ン]/u.test(query)) return "ja";
  if (/[가-힣]/u.test(query)) return "ko";
  if (/[а-яё]/iu.test(query)) return "ru";
  if (/[一-龯]/u.test(query)) return "zh";

  const lower = query.toLowerCase();
  if (/\b(descargar|reseña|seguridad|registro|comisiones)\b/u.test(lower)) return "es";
  if (/\b(baixar|avaliação|segurança|cadastro|taxas)\b/u.test(lower)) return "pt";
  return "en";
}

function detectIntents(query, page) {
  const pathname = extractPathname(page);
  const haystack = `${query} ${pathname}`.toLowerCase();
  const matches = [];

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (patterns.some((pattern) => haystack.includes(pattern.toLowerCase()))) {
      matches.push(intent);
    }
  }

  return matches.length > 0 ? matches : ["unclassified"];
}

function extractPathname(page) {
  if (!page) {
    return "";
  }

  try {
    return new URL(page).pathname;
  } catch {
    return page;
  }
}

function scoreEntry(entry) {
  return entry.clicks * 5 + entry.impressions * 0.1;
}

function pushTopQuery(target, query, clicks, impressions) {
  const existing = target.find((item) => item.query === query);

  if (existing) {
    existing.clicks += clicks;
    existing.impressions += impressions;
  } else {
    target.push({ query, clicks, impressions });
  }

  target.sort((a, b) => scoreEntry(b) - scoreEntry(a));

  if (target.length > 5) {
    target.length = 5;
  }
}

const csvText = fs.readFileSync(path.resolve(inputPath), "utf8");
const rows = parseCsv(csvText);

if (rows.length < 2) {
  console.error("The CSV file is empty or invalid.");
  process.exit(1);
}

const headers = rows[0].map(normalizeHeader);
const bodyRows = rows.slice(1);

const report = {
  analyzedRows: bodyRows.length,
  matchedRows: 0,
  exchanges: {},
};

for (const row of bodyRows) {
  const query = getField(row, headers, ["query", "top queries"]).trim();
  const page = getField(row, headers, ["page", "top pages"]).trim();
  const pathname = extractPathname(page);
  const clicks = toNumber(getField(row, headers, ["clicks"]));
  const impressions = toNumber(getField(row, headers, ["impressions"]));

  if (!query) {
    continue;
  }

  const exchange = detectExchange(`${query} ${pathname}`);
  if (!exchange) {
    continue;
  }

  report.matchedRows += 1;

  const locale = detectLocale(query);
  const intents = detectIntents(query, page);

  if (!report.exchanges[exchange]) {
    report.exchanges[exchange] = {
      locales: {},
      intents: {},
    };
  }

  if (!report.exchanges[exchange].locales[locale]) {
    report.exchanges[exchange].locales[locale] = {
      clicks: 0,
      impressions: 0,
      topQueries: [],
    };
  }

  report.exchanges[exchange].locales[locale].clicks += clicks;
  report.exchanges[exchange].locales[locale].impressions += impressions;
  pushTopQuery(report.exchanges[exchange].locales[locale].topQueries, query, clicks, impressions);

  for (const intent of intents) {
    if (!report.exchanges[exchange].intents[intent]) {
      report.exchanges[exchange].intents[intent] = {
        clicks: 0,
        impressions: 0,
        topQueries: [],
      };
    }

    report.exchanges[exchange].intents[intent].clicks += clicks;
    report.exchanges[exchange].intents[intent].impressions += impressions;
    pushTopQuery(report.exchanges[exchange].intents[intent].topQueries, query, clicks, impressions);
  }
}

console.log(`# Search Console Opportunity Report`);
console.log("");
console.log(`- Input: ${path.resolve(inputPath)}`);
console.log(`- Rows analyzed: ${report.analyzedRows}`);
console.log(`- Rows matched to 7 exchanges: ${report.matchedRows}`);
console.log("");

for (const [exchange, data] of Object.entries(report.exchanges)) {
  console.log(`## ${exchange}`);
  console.log("");

  const localeEntries = Object.entries(data.locales)
    .sort((a, b) => scoreEntry(b[1]) - scoreEntry(a[1]))
    .slice(0, 5);

  if (localeEntries.length > 0) {
    console.log(`Top locales:`);
    for (const [locale, stats] of localeEntries) {
      console.log(
        `- ${locale}: clicks ${stats.clicks.toFixed(0)}, impressions ${stats.impressions.toFixed(0)}`
      );
    }
    console.log("");
  }

  const sortedIntents = Object.entries(data.intents).sort(
    (a, b) => scoreEntry(b[1]) - scoreEntry(a[1])
  );

  console.log(`Current covered intents:`);
  for (const [intent, stats] of sortedIntents.filter(([intent]) => EXISTING_INTENTS.has(intent)).slice(0, 6)) {
    console.log(
      `- ${intent}: clicks ${stats.clicks.toFixed(0)}, impressions ${stats.impressions.toFixed(0)}`
    );
  }
  console.log("");

  console.log(`Recommended next long-tail pages:`);
  const futureCandidates = sortedIntents.filter(([intent]) => FUTURE_INTENTS.includes(intent)).slice(0, 4);

  if (futureCandidates.length === 0) {
    console.log(`- No uncovered intent cluster detected in this export.`);
  } else {
    for (const [intent, stats] of futureCandidates) {
      const samples = stats.topQueries.map((item) => item.query).slice(0, 3).join(" | ");
      console.log(
        `- ${intent}: clicks ${stats.clicks.toFixed(0)}, impressions ${stats.impressions.toFixed(0)}, sample queries: ${samples}`
      );
    }
  }
  console.log("");
}
