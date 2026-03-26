import { exchanges, getExchangeBySlug } from "@/data/exchanges";
import { SITE_NAME } from "@/lib/constants";
import type { AutomationState } from "./types";

export type BrandTopic =
  | "cryptorebate"
  | "cryptorebate-binance"
  | "cryptorebate-okx"
  | "cryptorebate-bybit"
  | "cryptorebate-bitget"
  | "cryptorebate-gate"
  | "cryptorebate-kucoin"
  | "cryptorebate-huobi";

export const BRAND_TOPICS: BrandTopic[] = [
  "cryptorebate",
  "cryptorebate-binance",
  "cryptorebate-okx",
  "cryptorebate-bybit",
  "cryptorebate-bitget",
  "cryptorebate-gate",
  "cryptorebate-kucoin",
  "cryptorebate-huobi",
];

type BrandLocaleCopy = {
  heroPrefix: string;
  heroDescription: string;
  compareHeading: string;
  compareBody: string;
  whyHeading: string;
  whyBody: string;
  faqHeading: string;
  ctaLabel: string;
  ctaHelper: string;
  reviewed: string;
};

const BRAND_LOCALE_COPY: Record<string, BrandLocaleCopy> = {
  en: {
    heroPrefix: "Compare smarter with",
    heroDescription: "A comparison-first hub for rebate links, fee context, KYC expectations, and signup decisions before you join an exchange.",
    compareHeading: "What to compare before signup",
    compareBody: "Use CryptoRebate to compare rebate rate, fee structure, KYC, and the best-fit exchange path instead of jumping to the first invite link you find.",
    whyHeading: "Why this brand page exists",
    whyBody: "Brand pages help capture branded search demand and route visitors into the best exchange-specific guide or official rebate path without spammy copy.",
    faqHeading: "Brand FAQ",
    ctaLabel: "Open comparison hub",
    ctaHelper: "Start from the best matching exchange hub or GEO page.",
    reviewed: "Last reviewed",
  },
  zh: {
    heroPrefix: "先比较，再通过",
    heroDescription: "这是一个以比较优先为核心的返佣决策入口，帮助你在注册交易所前先看返佣、费率、KYC 和适配场景。",
    compareHeading: "注册前应该先比较什么",
    compareBody: "不要只看邀请码。先比较返佣比例、手续费结构、KYC 门槛和适合谁，再决定走哪个注册入口。",
    whyHeading: "为什么要有品牌页",
    whyBody: "品牌页用于承接品牌词搜索，把用户稳定导向最合适的交易所详情页、长尾页和返佣入口，而不是做低质量广告页。",
    faqHeading: "品牌页 FAQ",
    ctaLabel: "打开比较入口",
    ctaHelper: "从最匹配的交易所 hub 或 GEO 页面开始。",
    reviewed: "最近复核",
  },
  "zh-tw": {
    heroPrefix: "先比較，再透過",
    heroDescription: "這是一個以比較優先為核心的返佣決策入口，幫助你在註冊交易所前先看返佣、費率、KYC 與適配場景。",
    compareHeading: "註冊前應先比較什麼",
    compareBody: "不要只看邀請碼。先比較返佣比例、手續費結構、KYC 門檻與適合誰，再決定走哪個註冊入口。",
    whyHeading: "為什麼需要品牌頁",
    whyBody: "品牌頁用來承接品牌詞搜尋，把使用者導向最合適的交易所詳情頁、長尾頁與返佣入口。",
    faqHeading: "品牌頁 FAQ",
    ctaLabel: "開啟比較入口",
    ctaHelper: "從最匹配的交易所 hub 或 GEO 頁開始。",
    reviewed: "最近覆核",
  },
  ja: {
    heroPrefix: "まず比較してから使う",
    heroDescription: "CryptoRebate は、取引所登録前にリベート、手数料、KYC、向いている用途を比較するための比較優先ハブです。",
    compareHeading: "登録前に比較すべきこと",
    compareBody: "紹介コードだけで判断せず、リベート率、手数料、KYC、用途の相性を見て最適な導線を選びます。",
    whyHeading: "このブランドページの役割",
    whyBody: "ブランド検索を受け止め、最適な取引所ガイドや紹介リンクへ自然に導くためのページです。",
    faqHeading: "ブランドFAQ",
    ctaLabel: "比較ハブを開く",
    ctaHelper: "最適な取引所ハブまたはGEOページから始めます。",
    reviewed: "最終確認",
  },
  ko: {
    heroPrefix: "먼저 비교한 뒤 이용하는",
    heroDescription: "CryptoRebate는 거래소 가입 전에 리베이트, 수수료, KYC, 적합한 사용 시나리오를 비교하도록 돕는 비교 우선 허브입니다.",
    compareHeading: "가입 전에 비교할 요소",
    compareBody: "초대 코드만 보지 말고 리베이트율, 수수료 구조, KYC 난이도, 적합한 사용자 유형을 먼저 비교하세요.",
    whyHeading: "브랜드 페이지가 필요한 이유",
    whyBody: "브랜드 검색 수요를 받아 가장 적합한 거래소 가이드와 리베이트 진입점으로 연결하기 위한 페이지입니다.",
    faqHeading: "브랜드 FAQ",
    ctaLabel: "비교 허브 열기",
    ctaHelper: "가장 적합한 거래소 허브 또는 GEO 페이지에서 시작하세요.",
    reviewed: "최근 검토",
  },
  ru: {
    heroPrefix: "Сначала сравните, затем используйте",
    heroDescription: "CryptoRebate — это comparison-first хаб, где до регистрации на бирже можно сравнить ребейт, комиссии, KYC и подходящий сценарий использования.",
    compareHeading: "Что сравнить до регистрации",
    compareBody: "Не выбирайте по одному invite-коду. Сначала сравните ребейт, комиссии, KYC и то, кому лучше подходит каждая биржа.",
    whyHeading: "Зачем нужна бренд-страница",
    whyBody: "Такие страницы собирают брендовый спрос и направляют пользователя к правильному гайду или партнерскому входу без спама.",
    faqHeading: "FAQ по бренду",
    ctaLabel: "Открыть центр сравнения",
    ctaHelper: "Начните с подходящего exchange hub или GEO-страницы.",
    reviewed: "Проверено",
  },
  es: {
    heroPrefix: "Primero compara y luego usa",
    heroDescription: "CryptoRebate es un hub comparison-first para revisar rebates, comisiones, KYC y la mejor ruta de registro antes de abrir cuenta en un exchange.",
    compareHeading: "Qué comparar antes de registrarte",
    compareBody: "No elijas solo por un código. Compara rebate, comisiones, KYC y el perfil ideal de cada exchange antes de registrarte.",
    whyHeading: "Por qué existe esta página de marca",
    whyBody: "Estas páginas capturan búsquedas de marca y llevan al usuario al mejor hub o guía GEO sin parecer una landing spam.",
    faqHeading: "FAQ de marca",
    ctaLabel: "Abrir hub comparativo",
    ctaHelper: "Empieza por el hub o la guía GEO que mejor encaje.",
    reviewed: "Última revisión",
  },
  pt: {
    heroPrefix: "Compare primeiro e só depois use",
    heroDescription: "CryptoRebate é um hub comparison-first para analisar rebate, taxas, KYC e a melhor rota de cadastro antes de abrir conta em uma exchange.",
    compareHeading: "O que comparar antes do cadastro",
    compareBody: "Não escolha só pelo código. Compare rebate, taxas, KYC e o perfil ideal de cada exchange antes de seguir para o cadastro.",
    whyHeading: "Por que esta página de marca existe",
    whyBody: "Essas páginas capturam demanda de marca e levam o usuário ao melhor hub ou guia GEO sem cair em copy spammy.",
    faqHeading: "FAQ da marca",
    ctaLabel: "Abrir hub comparativo",
    ctaHelper: "Comece pelo hub de exchange ou pela GEO page mais adequada.",
    reviewed: "Última revisão",
  },
  vi: {
    heroPrefix: "Hãy so sánh trước rồi mới dùng",
    heroDescription: "CryptoRebate là hub comparison-first giúp bạn so sánh rebate, phí, KYC và đường đăng ký phù hợp trước khi mở tài khoản sàn.",
    compareHeading: "Cần so sánh gì trước khi đăng ký",
    compareBody: "Đừng chỉ nhìn mã mời. Hãy so sánh rebate, cấu trúc phí, KYC và đối tượng phù hợp của từng sàn trước khi đăng ký.",
    whyHeading: "Vì sao cần trang thương hiệu này",
    whyBody: "Trang thương hiệu giúp đón nhu cầu tìm kiếm theo brand và dẫn người dùng đến đúng hub hoặc trang GEO phù hợp.",
    faqHeading: "FAQ thương hiệu",
    ctaLabel: "Mở hub so sánh",
    ctaHelper: "Bắt đầu từ hub sàn hoặc trang GEO phù hợp nhất.",
    reviewed: "Rà soát gần nhất",
  },
  th: {
    heroPrefix: "เปรียบเทียบก่อน แล้วค่อยใช้",
    heroDescription: "CryptoRebate คือ comparison-first hub ที่ช่วยเปรียบเทียบ rebate, ค่าธรรมเนียม, KYC และเส้นทางสมัครที่เหมาะสมก่อนเปิดบัญชีเทรด",
    compareHeading: "ควรเทียบอะไรบ้างก่อนสมัคร",
    compareBody: "อย่าดูแค่โค้ดเชิญ ควรเทียบ rebate, โครงสร้างค่าธรรมเนียม, KYC และความเหมาะสมของแต่ละแพลตฟอร์มก่อนสมัคร",
    whyHeading: "ทำไมต้องมีหน้าแบรนด์นี้",
    whyBody: "หน้าแบรนด์ช่วยรับทราฟฟิกคำค้นแบรนด์และพาไปยัง hub หรือ GEO page ที่เหมาะสมโดยไม่ดูสแปม",
    faqHeading: "คำถามพบบ่อยของแบรนด์",
    ctaLabel: "เปิดฮับเปรียบเทียบ",
    ctaHelper: "เริ่มจาก hub ของ exchange หรือ GEO page ที่เหมาะที่สุด",
    reviewed: "ตรวจล่าสุด",
  },
  hi: {
    heroPrefix: "पहले तुलना करें, फिर चुनें",
    heroDescription: "CryptoRebate एक comparison-first hub है जहाँ आप किसी exchange पर साइनअप करने से पहले rebate, fees, KYC और सही signup path की तुलना कर सकते हैं।",
    compareHeading: "साइनअप से पहले क्या तुलना करें",
    compareBody: "सिर्फ invite code देखकर निर्णय न लें। rebate, fee structure, KYC और किसके लिए कौन सा exchange बेहतर है—यह सब पहले देखें।",
    whyHeading: "यह brand page क्यों है",
    whyBody: "यह page brand search demand को capture करके user को सही hub या GEO page तक ले जाती है, बिना low-quality affiliate copy के।",
    faqHeading: "ब्रांड FAQ",
    ctaLabel: "comparison hub खोलें",
    ctaHelper: "सबसे उपयुक्त exchange hub या GEO page से शुरू करें।",
    reviewed: "अंतिम समीक्षा",
  },
};

export type BrandSeoPage = {
  id: string;
  pageKind: "brand";
  locale: string;
  topic: BrandTopic;
  routePath: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  heroTitle: string;
  heroDescription: string;
  sections: Array<{ title: string; body: string; bullets?: string[] }>;
  faq: Array<{ q: string; a: string }>;
  cta: {
    label: string;
    href: string;
    helperText: string;
  };
  lastReviewed: string;
  qualityScore: number;
  publishedAt: string;
};

function getCopy(locale: string) {
  return BRAND_LOCALE_COPY[locale] ?? BRAND_LOCALE_COPY.en;
}

function getExchangeRoute(slug: string, pageType = "official-site") {
  return `/exchanges/${slug}/${pageType}`;
}

function getTopicExchange(topic: BrandTopic) {
  const slug = topic.replace("cryptorebate-", "");
  return topic === "cryptorebate" ? null : getExchangeBySlug(slug === "gate" ? "gate" : slug);
}

export function buildBrandPages(state: AutomationState): BrandSeoPage[] {
  const now = new Date().toISOString();
  const pages: BrandSeoPage[] = [];

  for (const locale of state.pages.map((page) => page.locale).filter((value, index, arr) => arr.indexOf(value) === index)) {
    const copy = getCopy(locale);

    for (const topic of BRAND_TOPICS) {
      const exchange = getTopicExchange(topic);
      const relatedPages = state.pages
        .filter((page) => page.locale === locale)
        .filter((page) => (exchange ? page.exchangeSlug === exchange.slug : true))
        .sort((a, b) => b.qualityScore - a.qualityScore)
        .slice(0, 3);

      const fallbackExchanges = exchange ? [exchange] : exchanges.slice(0, 3);
      const bullets = relatedPages.length
        ? relatedPages.map((page) => `${page.heroTitle}`)
        : fallbackExchanges.map((item) => `${item.name} · ${item.spotRebate}`);

      const title = exchange
        ? `${SITE_NAME} · ${exchange.name} guide, rebate link, fees & signup path`
        : `${SITE_NAME} · compare rebate links, fees and signup paths before joining an exchange`;
      const description = exchange
        ? `${SITE_NAME} helps users compare ${exchange.name} rebate routes, fees, KYC, and the most suitable signup path before registration.`
        : `${SITE_NAME} helps users compare rebate links, fees, KYC, and signup paths across major exchanges before registration.`;

      pages.push({
        id: `brand-${locale}-${topic}`,
        pageKind: "brand",
        locale,
        topic,
        routePath: `/brand/${topic}`,
        metadata: {
          title,
          description,
          keywords: exchange
            ? [
                `${SITE_NAME} ${exchange.name}`,
                `${exchange.name} rebate`,
                `${exchange.name} referral code`,
                `${exchange.name} official site`,
              ]
            : [
                `${SITE_NAME}`,
                `${SITE_NAME} exchange rebates`,
                `${SITE_NAME} referral codes`,
              ],
        },
        heroTitle: exchange
          ? `${copy.heroPrefix} ${SITE_NAME}: ${exchange.name}`
          : `${copy.heroPrefix} ${SITE_NAME}`,
        heroDescription: copy.heroDescription,
        sections: [
          {
            title: copy.compareHeading,
            body: copy.compareBody,
            bullets,
          },
          {
            title: copy.whyHeading,
            body: copy.whyBody,
            bullets: (exchange ? [exchange] : fallbackExchanges).map((item) =>
              `${item.name} → ${getExchangeRoute(item.slug)}`
            ),
          },
        ],
        faq: [
          {
            q: `${SITE_NAME} ${exchange ? `and ${exchange.name}` : ""}`.trim(),
            a: exchange
              ? `${SITE_NAME} links branded search traffic to ${exchange.name} comparison content and the referral route configured for that exchange.`
              : `${SITE_NAME} is a comparison-first destination for exchange rebates, fees, KYC, and signup choices before registration.`,
          },
          {
            q: copy.faqHeading,
            a: exchange
              ? `Use this page to move into the ${exchange.name} exchange hub, referral-code guide, or official-site guide instead of relying on scattered invite links.`
              : `Use this page to move into the best exchange hub or branded guide for the exchange you are considering.`,
          },
        ],
        cta: {
          label: copy.ctaLabel,
          href: exchange ? getExchangeRoute(exchange.slug) : "/exchanges",
          helperText: copy.ctaHelper,
        },
        lastReviewed: now.slice(0, 10),
        qualityScore: exchange ? 81 : 78,
        publishedAt: now,
      });
    }
  }

  return pages;
}
