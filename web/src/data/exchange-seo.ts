import { exchanges, getExchangeBySlug, getAllExchangeSlugs } from "@/data/exchanges";
import { LOCALES, type Locale } from "@/lib/constants";
import type { Exchange } from "@/types/exchange";
import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";
import hiMessages from "../../messages/hi.json";
import jaMessages from "../../messages/ja.json";
import koMessages from "../../messages/ko.json";
import ptMessages from "../../messages/pt.json";
import ruMessages from "../../messages/ru.json";
import thMessages from "../../messages/th.json";
import viMessages from "../../messages/vi.json";
import zhMessages from "../../messages/zh.json";
import zhTwMessages from "../../messages/zh-tw.json";

export const SEO_CONTENT_LOCALES = LOCALES;
export type SeoContentLocale = Locale;

export const SEO_PAGE_TYPES = [
  "referral-code",
  "signup-kyc",
  "fees-rebate",
  "official-site",
  "app-download",
  "safety-review",
] as const;
export type ExchangeSeoPageType = (typeof SEO_PAGE_TYPES)[number];

type ExchangeSlug = Exchange["slug"];

type ExchangeSeoPageLabels = {
  short: string;
  nav: string;
  question: string;
};

type ExchangeSeoSection = {
  title: string;
  body: string;
  bullets?: string[];
};

type ExchangeSeoFaqItem = {
  q: string;
  a: string;
};

type ExchangeSeoFactItem = {
  label: string;
  value: string;
};

type ExchangeSeoAnswerBox = {
  title: string;
  body: string;
  bullets: string[];
};

type ExchangeSeoFit = {
  title: string;
  goodFor: string[];
  notIdealFor: string[];
};

type ExchangeSeoCta = {
  label: string;
  helperText: string;
  href?: string;
};

type ExchangeSeoNotes = {
  comparisonPeers: [ExchangeSlug, ExchangeSlug];
  en: {
    summary: string;
    referralAngle: string;
    referralRisks: string[];
    signupFlow: string;
    kycNote: string;
    feesAngle: string;
    comparisonAngle: string;
    goodFor: string[];
    notIdealFor: string[];
    answerHighlight: string;
  };
  zh: {
    summary: string;
    referralAngle: string;
    referralRisks: string[];
    signupFlow: string;
    kycNote: string;
    feesAngle: string;
    comparisonAngle: string;
    goodFor: string[];
    notIdealFor: string[];
    answerHighlight: string;
  };
};

export type ExchangeSeoContentEntry = {
  locale: SeoContentLocale;
  exchange: Exchange;
  pageType: ExchangeSeoPageType;
  comparisonPeers: [ExchangeSlug, ExchangeSlug];
  primaryQuery: string;
  secondaryQueries: string[];
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  heroTitle: string;
  heroDescription: string;
  answerBox: ExchangeSeoAnswerBox;
  factCard: ExchangeSeoFactItem[];
  fit: ExchangeSeoFit;
  sections: ExchangeSeoSection[];
  faq: ExchangeSeoFaqItem[];
  cta: ExchangeSeoCta;
  lastReviewed: string;
  howToSteps?: string[];
};

const SEO_PAGE_LABELS: Record<
  SeoContentLocale,
  Record<ExchangeSeoPageType, ExchangeSeoPageLabels>
> = {
  en: {
    "referral-code": {
      short: "Referral Code",
      nav: "Referral Code & Rebate",
      question: "Find the best referral-code guide",
    },
    "signup-kyc": {
      short: "Signup & KYC",
      nav: "Signup, KYC & Activation",
      question: "Find the right signup and KYC guide",
    },
    "fees-rebate": {
      short: "Fees & Rebate",
      nav: "Fees, Rebate & Comparison",
      question: "Compare effective trading costs",
    },
    "official-site": {
      short: "Official Site",
      nav: "Official Site & Signup Route",
      question: "Find the real official signup route",
    },
    "app-download": {
      short: "App Download",
      nav: "App Download & Safe Install",
      question: "Download the app from the right source",
    },
    "safety-review": {
      short: "Safety Review",
      nav: "Safety, Legitimacy & Risk Review",
      question: "Check whether the exchange is safe enough for your use",
    },
  },
  zh: {
    "referral-code": {
      short: "邀请码",
      nav: "邀请码与返佣",
      question: "先找对邀请码入口",
    },
    "signup-kyc": {
      short: "注册/KYC",
      nav: "注册、KYC 与返佣生效",
      question: "先确认注册和 KYC 路径",
    },
    "fees-rebate": {
      short: "费率对比",
      nav: "费率、返佣与对比",
      question: "比较真实成本后再注册",
    },
    "official-site": {
      short: "官网入口",
      nav: "官网入口与注册路径",
      question: "先确认真正的官网注册入口",
    },
    "app-download": {
      short: "App下载",
      nav: "App下载与安全安装",
      question: "先从正确来源下载 App",
    },
    "safety-review": {
      short: "安全评测",
      nav: "安全性、正规性与风险评测",
      question: "先判断这家交易所是否足够安全",
    },
  },
  "zh-tw": {
    "referral-code": {
      short: "邀請碼",
      nav: "邀請碼與返佣",
      question: "先找對邀請碼入口",
    },
    "signup-kyc": {
      short: "註冊/KYC",
      nav: "註冊、KYC 與返佣生效",
      question: "先確認註冊和 KYC 路徑",
    },
    "fees-rebate": {
      short: "費率比較",
      nav: "費率、返佣與對比",
      question: "比較真實成本後再註冊",
    },
    "official-site": {
      short: "官網入口",
      nav: "官網入口與註冊路徑",
      question: "先確認真正的官網註冊入口",
    },
    "app-download": {
      short: "App下載",
      nav: "App下載與安全安裝",
      question: "先從正確來源下載 App",
    },
    "safety-review": {
      short: "安全評測",
      nav: "安全性、正規性與風險評測",
      question: "先判斷這家交易所是否足夠安全",
    },
  },
  ja: {
    "referral-code": {
      short: "紹介コード",
      nav: "紹介コードとリベート",
      question: "まず紹介コード経由を確認する",
    },
    "signup-kyc": {
      short: "登録/KYC",
      nav: "登録・KYC・リベート反映",
      question: "登録とKYCの流れを先に確認する",
    },
    "fees-rebate": {
      short: "手数料比較",
      nav: "手数料・リベート・比較",
      question: "実質コストを比較してから登録する",
    },
    "official-site": {
      short: "公式サイト",
      nav: "公式サイトと登録ルート",
      question: "本物の公式登録ルートを確認する",
    },
    "app-download": {
      short: "アプリDL",
      nav: "アプリDLと安全な導入",
      question: "正しい配布元からアプリを入れる",
    },
    "safety-review": {
      short: "安全性",
      nav: "安全性・正当性・リスク確認",
      question: "その取引所が安全かどうかを確認する",
    },
  },
  ko: {
    "referral-code": {
      short: "추천코드",
      nav: "추천코드와 리베이트",
      question: "먼저 맞는 추천 경로를 확인하기",
    },
    "signup-kyc": {
      short: "가입/KYC",
      nav: "가입, KYC, 리베이트 적용",
      question: "가입과 KYC 흐름을 먼저 확인하기",
    },
    "fees-rebate": {
      short: "수수료 비교",
      nav: "수수료, 리베이트, 비교",
      question: "실질 비용을 비교한 뒤 가입하기",
    },
    "official-site": {
      short: "공식 사이트",
      nav: "공식 사이트와 가입 경로",
      question: "진짜 공식 가입 경로를 확인하기",
    },
    "app-download": {
      short: "앱 다운로드",
      nav: "앱 다운로드와 안전한 설치",
      question: "올바른 출처에서 앱을 받기",
    },
    "safety-review": {
      short: "안전성",
      nav: "안전성, 합법성, 리스크 검토",
      question: "이 거래소가 충분히 안전한지 확인하기",
    },
  },
  ru: {
    "referral-code": {
      short: "Рефкод",
      nav: "Рефкод и ребейт",
      question: "Сначала выбрать правильный реферальный вход",
    },
    "signup-kyc": {
      short: "Регистрация/KYC",
      nav: "Регистрация, KYC и активация ребейта",
      question: "Сначала понять путь регистрации и KYC",
    },
    "fees-rebate": {
      short: "Сравнение комиссий",
      nav: "Комиссии, ребейт и сравнение",
      question: "Сравнить реальную стоимость до регистрации",
    },
    "official-site": {
      short: "Офиц. сайт",
      nav: "Официальный сайт и путь регистрации",
      question: "Найти настоящий официальный путь регистрации",
    },
    "app-download": {
      short: "Скачать app",
      nav: "Скачивание приложения и безопасная установка",
      question: "Скачать приложение из правильного источника",
    },
    "safety-review": {
      short: "Безопасность",
      nav: "Безопасность, легитимность и риски",
      question: "Понять, достаточно ли безопасна биржа",
    },
  },
  es: {
    "referral-code": {
      short: "Código",
      nav: "Código y rebate",
      question: "Encuentra primero la ruta correcta del código",
    },
    "signup-kyc": {
      short: "Registro/KYC",
      nav: "Registro, KYC y activación",
      question: "Aclara primero el flujo de registro y KYC",
    },
    "fees-rebate": {
      short: "Comisiones",
      nav: "Comisiones, rebate y comparación",
      question: "Compara el costo real antes de registrarte",
    },
    "official-site": {
      short: "Sitio oficial",
      nav: "Sitio oficial y ruta de registro",
      question: "Encuentra la ruta oficial real de registro",
    },
    "app-download": {
      short: "Descargar app",
      nav: "Descarga de app e instalación segura",
      question: "Descarga la app desde la fuente correcta",
    },
    "safety-review": {
      short: "Seguridad",
      nav: "Seguridad, legitimidad y riesgos",
      question: "Comprueba si el exchange es lo bastante seguro",
    },
  },
  pt: {
    "referral-code": {
      short: "Código",
      nav: "Código e rebate",
      question: "Encontre primeiro a rota certa do código",
    },
    "signup-kyc": {
      short: "Cadastro/KYC",
      nav: "Cadastro, KYC e ativação",
      question: "Confirme antes o fluxo de cadastro e KYC",
    },
    "fees-rebate": {
      short: "Taxas",
      nav: "Taxas, rebate e comparação",
      question: "Compare o custo real antes de se cadastrar",
    },
    "official-site": {
      short: "Site oficial",
      nav: "Site oficial e rota de cadastro",
      question: "Encontre a rota oficial real de cadastro",
    },
    "app-download": {
      short: "Baixar app",
      nav: "Download do app e instalação segura",
      question: "Baixe o app da fonte correta",
    },
    "safety-review": {
      short: "Segurança",
      nav: "Segurança, legitimidade e riscos",
      question: "Verifique se a exchange é segura o suficiente",
    },
  },
  vi: {
    "referral-code": {
      short: "Mã giới thiệu",
      nav: "Mã giới thiệu và hoàn phí",
      question: "Chọn đúng đường dẫn mã giới thiệu trước",
    },
    "signup-kyc": {
      short: "Đăng ký/KYC",
      nav: "Đăng ký, KYC và kích hoạt hoàn phí",
      question: "Xác nhận luồng đăng ký và KYC trước",
    },
    "fees-rebate": {
      short: "So sánh phí",
      nav: "Phí, hoàn phí và so sánh",
      question: "So sánh chi phí thực trước khi đăng ký",
    },
    "official-site": {
      short: "Trang chính thức",
      nav: "Trang chính thức và đường dẫn đăng ký",
      question: "Tìm đúng đường dẫn đăng ký chính thức",
    },
    "app-download": {
      short: "Tải app",
      nav: "Tải app và cài đặt an toàn",
      question: "Tải app từ đúng nguồn",
    },
    "safety-review": {
      short: "Độ an toàn",
      nav: "Độ an toàn, tính hợp lệ và rủi ro",
      question: "Kiểm tra sàn có đủ an toàn cho bạn hay không",
    },
  },
  th: {
    "referral-code": {
      short: "โค้ดแนะนำ",
      nav: "โค้ดแนะนำและรีเบต",
      question: "เริ่มจากเส้นทางโค้ดแนะนำที่ถูกต้อง",
    },
    "signup-kyc": {
      short: "สมัคร/KYC",
      nav: "สมัคร, KYC และการเปิดใช้รีเบต",
      question: "ตรวจสอบขั้นตอนสมัครและ KYC ก่อน",
    },
    "fees-rebate": {
      short: "เทียบค่าธรรมเนียม",
      nav: "ค่าธรรมเนียม รีเบต และการเปรียบเทียบ",
      question: "เทียบต้นทุนจริงก่อนสมัคร",
    },
    "official-site": {
      short: "เว็บทางการ",
      nav: "เว็บทางการและเส้นทางสมัคร",
      question: "หาเส้นทางสมัครทางการที่แท้จริง",
    },
    "app-download": {
      short: "ดาวน์โหลดแอป",
      nav: "ดาวน์โหลดแอปและติดตั้งอย่างปลอดภัย",
      question: "ดาวน์โหลดแอปจากแหล่งที่ถูกต้อง",
    },
    "safety-review": {
      short: "ความปลอดภัย",
      nav: "ความปลอดภัย ความน่าเชื่อถือ และความเสี่ยง",
      question: "เช็กว่าเว็บเทรดปลอดภัยพอสำหรับคุณหรือไม่",
    },
  },
  hi: {
    "referral-code": {
      short: "रेफरल कोड",
      nav: "रेफरल कोड और रिबेट",
      question: "पहले सही रेफरल एंट्री चुनें",
    },
    "signup-kyc": {
      short: "साइनअप/KYC",
      nav: "साइनअप, KYC और रिबेट सक्रियता",
      question: "पहले साइनअप और KYC का रास्ता समझें",
    },
    "fees-rebate": {
      short: "फीस तुलना",
      nav: "फीस, रिबेट और तुलना",
      question: "रजिस्टर करने से पहले असली लागत तुलना करें",
    },
    "official-site": {
      short: "ऑफिशियल साइट",
      nav: "ऑफिशियल साइट और साइनअप रूट",
      question: "सही ऑफिशियल साइनअप रूट खोजें",
    },
    "app-download": {
      short: "ऐप डाउनलोड",
      nav: "ऐप डाउनलोड और सुरक्षित इंस्टॉल",
      question: "सही स्रोत से ऐप डाउनलोड करें",
    },
    "safety-review": {
      short: "सुरक्षा समीक्षा",
      nav: "सुरक्षा, वैधता और जोखिम समीक्षा",
      question: "देखें कि यह एक्सचेंज आपके लिए कितना सुरक्षित है",
    },
  },
};

const SEO_CLUSTER_LABELS = {
  en: {
    answerTitle: "If you only need the short answer",
    fitTitle: "Who this path fits",
    goodFor: "Good for",
    notIdealFor: "Less ideal for",
    factCardTitle: "Decision facts",
    moreGuidesTitle: "Continue with the next question",
    backToHub: "Back to exchange hub",
    viewHub: "View exchange hub",
    faqTitle: "Common questions",
    reviewed: "Last reviewed",
    comparePeers: "Often compared with",
    geoHubTitle: "Top Exchange Guides",
    geoHubSubtitle:
      "Start with the question you actually have, then drill into the exchange that fits.",
    browseByQuestionTitle: "Browse by question",
    browseByQuestionSubtitle:
      "Use the shortest path: rebate code, signup and KYC, or fees and effective cost.",
    listHubTitle: "Find the right exchange guide first",
    listHubSubtitle:
      "Each exchange now has dedicated guides for referral codes, signup and KYC, and fees versus rebate.",
    detailHubTitle: "Most searched questions about this exchange",
    detailHubSubtitle:
      "Use these pages when you need an answer-first landing page instead of a full product overview.",
  },
  zh: {
    answerTitle: "如果你只关心答案",
    fitTitle: "适合谁，不适合谁",
    goodFor: "更适合",
    notIdealFor: "不太适合",
    factCardTitle: "先看这些关键事实",
    moreGuidesTitle: "继续看这个交易所的高意图问题页",
    backToHub: "返回交易所总览页",
    viewHub: "查看交易所总览",
    faqTitle: "常见问题",
    reviewed: "最近复核",
    comparePeers: "常被一起比较",
    geoHubTitle: "交易所高意图指南",
    geoHubSubtitle: "先按你要解决的问题进入，再决定注册哪一家交易所。",
    browseByQuestionTitle: "按问题找入口",
    browseByQuestionSubtitle: "返佣邀请码、注册/KYC、真实费率与返佣后成本，各走最短路径。",
    listHubTitle: "先找对问题页，再决定注册入口",
    listHubSubtitle: "每家交易所都补了三个高意图入口页，方便搜索和站内继续阅读。",
    detailHubTitle: "这个交易所最常被搜索的三个问题",
    detailHubSubtitle: "如果你不需要完整介绍页，可以直接进入答案优先的落地页。",
  },
  "zh-tw": {
    answerTitle: "如果你只想先看答案",
    fitTitle: "適合誰，不適合誰",
    goodFor: "更適合",
    notIdealFor: "不太適合",
    factCardTitle: "先看這些關鍵事實",
    moreGuidesTitle: "繼續看這個交易所的高意圖問題頁",
    backToHub: "返回交易所總覽頁",
    viewHub: "查看交易所總覽",
    faqTitle: "常見問題",
    reviewed: "最近複核",
    comparePeers: "常被一起比較",
    geoHubTitle: "交易所高意圖指南",
    geoHubSubtitle: "先按你要解決的問題進入，再決定註冊哪一家交易所。",
    browseByQuestionTitle: "按問題找入口",
    browseByQuestionSubtitle: "邀請碼、註冊/KYC、真實費率與返佣後成本，各走最短路徑。",
    listHubTitle: "先找對問題頁，再決定註冊入口",
    listHubSubtitle: "每家交易所都補了三個高意圖入口頁，方便搜尋和站內繼續閱讀。",
    detailHubTitle: "這個交易所最常被搜尋的三個問題",
    detailHubSubtitle: "如果你不需要完整介紹頁，可以直接進入答案優先的落地頁。",
  },
  ja: {
    answerTitle: "要点だけ先に知りたい場合",
    fitTitle: "向いている人、向いていない人",
    goodFor: "向いている人",
    notIdealFor: "あまり向かない人",
    factCardTitle: "先に押さえるべき事実",
    moreGuidesTitle: "この取引所の次の高意図ガイド",
    backToHub: "取引所ハブに戻る",
    viewHub: "取引所ハブを見る",
    faqTitle: "よくある質問",
    reviewed: "最終確認日",
    comparePeers: "よく比較される取引所",
    geoHubTitle: "取引所ガイド",
    geoHubSubtitle: "最初に知りたい質問から入り、その後で合う取引所を選びます。",
    browseByQuestionTitle: "質問別に探す",
    browseByQuestionSubtitle: "紹介コード、登録/KYC、手数料と実質コストの順に最短で確認できます。",
    listHubTitle: "まず正しい取引所ガイドを選ぶ",
    listHubSubtitle: "各取引所に、紹介コード、登録/KYC、手数料比較の専用ページを用意しました。",
    detailHubTitle: "この取引所でよく検索される3つのテーマ",
    detailHubSubtitle: "長い紹介ページではなく、答え優先の着地ページを使いたいときに役立ちます。",
  },
  ko: {
    answerTitle: "핵심 답만 먼저 보면",
    fitTitle: "이 경로가 맞는 사람과 아닌 사람",
    goodFor: "잘 맞는 경우",
    notIdealFor: "덜 맞는 경우",
    factCardTitle: "먼저 봐야 할 핵심 사실",
    moreGuidesTitle: "이 거래소의 다음 고의도 가이드",
    backToHub: "거래소 허브로 돌아가기",
    viewHub: "거래소 허브 보기",
    faqTitle: "자주 묻는 질문",
    reviewed: "최근 검토일",
    comparePeers: "자주 비교되는 거래소",
    geoHubTitle: "거래소 GEO 가이드",
    geoHubSubtitle: "궁금한 질문부터 들어가고, 그다음에 맞는 거래소를 고르세요.",
    browseByQuestionTitle: "질문별로 찾기",
    browseByQuestionSubtitle: "추천코드, 가입/KYC, 수수료와 실질 비용을 가장 짧은 경로로 확인할 수 있습니다.",
    listHubTitle: "먼저 맞는 거래소 가이드를 찾기",
    listHubSubtitle: "각 거래소마다 추천코드, 가입/KYC, 수수료 비교 전용 페이지를 만들었습니다.",
    detailHubTitle: "이 거래소에서 많이 검색되는 3가지 질문",
    detailHubSubtitle: "긴 소개 페이지보다 답변 우선 랜딩 페이지가 필요할 때 사용하세요.",
  },
  ru: {
    answerTitle: "Если нужен только короткий ответ",
    fitTitle: "Кому подходит и кому не подходит",
    goodFor: "Подходит для",
    notIdealFor: "Менее подходит для",
    factCardTitle: "Факты, которые стоит проверить сразу",
    moreGuidesTitle: "Следующие страницы по этому биржевому кластеру",
    backToHub: "Назад к хабу биржи",
    viewHub: "Открыть хаб биржи",
    faqTitle: "Частые вопросы",
    reviewed: "Последняя проверка",
    comparePeers: "Чаще всего сравнивают с",
    geoHubTitle: "GEO-гайды по биржам",
    geoHubSubtitle: "Сначала выберите нужный вопрос, а уже потом решайте, где регистрироваться.",
    browseByQuestionTitle: "Искать по вопросу",
    browseByQuestionSubtitle: "Рефкод, регистрация/KYC и реальные комиссии доступны как отдельные быстрые входы.",
    listHubTitle: "Сначала выберите правильный гайд по бирже",
    listHubSubtitle: "Для каждой биржи есть отдельные страницы по рефкоду, регистрации/KYC и сравнению комиссий.",
    detailHubTitle: "Три самых частых вопроса по этой бирже",
    detailHubSubtitle: "Если нужен не общий обзор, а страница с быстрым ответом, начинайте отсюда.",
  },
  es: {
    answerTitle: "Si solo quieres la respuesta corta",
    fitTitle: "Para quién encaja y para quién no",
    goodFor: "Encaja mejor con",
    notIdealFor: "Encaja menos con",
    factCardTitle: "Datos clave para decidir",
    moreGuidesTitle: "Sigue con la siguiente pregunta",
    backToHub: "Volver al hub del exchange",
    viewHub: "Ver hub del exchange",
    faqTitle: "Preguntas frecuentes",
    reviewed: "Última revisión",
    comparePeers: "Se compara con frecuencia con",
    geoHubTitle: "Guías GEO de exchanges",
    geoHubSubtitle: "Empieza por la pregunta correcta y después elige el exchange que mejor encaje.",
    browseByQuestionTitle: "Buscar por pregunta",
    browseByQuestionSubtitle: "Código, registro/KYC y costo real se organizan como entradas directas.",
    listHubTitle: "Encuentra primero la guía correcta del exchange",
    listHubSubtitle: "Cada exchange tiene páginas específicas para código de referido, registro/KYC y comparación de comisiones.",
    detailHubTitle: "Las tres preguntas más buscadas sobre este exchange",
    detailHubSubtitle: "Úsalo cuando necesites una landing page de respuesta rápida en lugar de un perfil largo.",
  },
  pt: {
    answerTitle: "Se você só quer a resposta curta",
    fitTitle: "Para quem faz sentido e para quem não",
    goodFor: "Mais indicado para",
    notIdealFor: "Menos indicado para",
    factCardTitle: "Fatos-chave para decidir",
    moreGuidesTitle: "Continue pela próxima pergunta",
    backToHub: "Voltar ao hub da exchange",
    viewHub: "Ver hub da exchange",
    faqTitle: "Perguntas frequentes",
    reviewed: "Última revisão",
    comparePeers: "Comparada com frequência com",
    geoHubTitle: "Guias GEO de exchanges",
    geoHubSubtitle: "Comece pela pergunta certa e depois escolha a exchange mais adequada.",
    browseByQuestionTitle: "Buscar por pergunta",
    browseByQuestionSubtitle: "Código, cadastro/KYC e custo real aparecem como entradas diretas.",
    listHubTitle: "Encontre primeiro o guia certo da exchange",
    listHubSubtitle: "Cada exchange agora tem páginas dedicadas para código, cadastro/KYC e comparação de taxas.",
    detailHubTitle: "As três perguntas mais buscadas sobre esta exchange",
    detailHubSubtitle: "Use estas páginas quando precisar de uma landing page com resposta direta, não de um perfil longo.",
  },
  vi: {
    answerTitle: "Nếu bạn chỉ cần câu trả lời ngắn",
    fitTitle: "Phù hợp với ai và không phù hợp với ai",
    goodFor: "Phù hợp hơn với",
    notIdealFor: "Ít phù hợp với",
    factCardTitle: "Những dữ kiện cần xem trước",
    moreGuidesTitle: "Xem tiếp câu hỏi tiếp theo",
    backToHub: "Quay lại trang hub của sàn",
    viewHub: "Xem hub của sàn",
    faqTitle: "Câu hỏi thường gặp",
    reviewed: "Ngày rà soát gần nhất",
    comparePeers: "Thường được so sánh với",
    geoHubTitle: "Hướng dẫn GEO cho sàn",
    geoHubSubtitle: "Bắt đầu từ câu hỏi đúng rồi mới chọn sàn phù hợp để đăng ký.",
    browseByQuestionTitle: "Tìm theo câu hỏi",
    browseByQuestionSubtitle: "Mã giới thiệu, đăng ký/KYC và chi phí thực đều có lối vào riêng.",
    listHubTitle: "Hãy chọn đúng hướng dẫn về sàn trước",
    listHubSubtitle: "Mỗi sàn đều có trang riêng cho mã giới thiệu, đăng ký/KYC và so sánh phí.",
    detailHubTitle: "Ba câu hỏi được tìm nhiều nhất về sàn này",
    detailHubSubtitle: "Dùng các trang này khi bạn cần landing page trả lời nhanh thay vì một hồ sơ dài.",
  },
  th: {
    answerTitle: "ถ้าคุณต้องการคำตอบสั้น ๆ ก่อน",
    fitTitle: "เหมาะกับใคร และไม่เหมาะกับใคร",
    goodFor: "เหมาะกว่า",
    notIdealFor: "เหมาะน้อยกว่า",
    factCardTitle: "ข้อเท็จจริงสำคัญที่ควรดูก่อน",
    moreGuidesTitle: "ไปต่อด้วยคำถามถัดไป",
    backToHub: "กลับไปหน้า hub ของเว็บเทรด",
    viewHub: "ดูหน้า hub ของเว็บเทรด",
    faqTitle: "คำถามที่พบบ่อย",
    reviewed: "ตรวจทานล่าสุด",
    comparePeers: "มักถูกเปรียบเทียบกับ",
    geoHubTitle: "คู่มือ GEO ของเว็บเทรด",
    geoHubSubtitle: "เริ่มจากคำถามที่คุณมี แล้วค่อยเลือกเว็บเทรดที่เหมาะที่สุด",
    browseByQuestionTitle: "ค้นหาตามคำถาม",
    browseByQuestionSubtitle: "โค้ดแนะนำ สมัคร/KYC และต้นทุนจริงถูกแยกเป็นเส้นทางตรงทั้งหมด",
    listHubTitle: "เลือกคู่มือของเว็บเทรดให้ถูกก่อน",
    listHubSubtitle: "แต่ละเว็บเทรดมีหน้าสำหรับโค้ดแนะนำ สมัคร/KYC และเปรียบเทียบค่าธรรมเนียมโดยเฉพาะ",
    detailHubTitle: "3 คำถามที่ถูกค้นหามากที่สุดเกี่ยวกับเว็บเทรดนี้",
    detailHubSubtitle: "ใช้หน้านี้เมื่อคุณต้องการ landing page แบบตอบตรง ไม่ใช่หน้าภาพรวมยาว ๆ",
  },
  hi: {
    answerTitle: "अगर आपको सिर्फ छोटा जवाब चाहिए",
    fitTitle: "किसके लिए सही है और किसके लिए नहीं",
    goodFor: "ज्यादा उपयुक्त",
    notIdealFor: "कम उपयुक्त",
    factCardTitle: "पहले देखने लायक मुख्य तथ्य",
    moreGuidesTitle: "अगला सवाल यहीं से देखें",
    backToHub: "एक्सचेंज हब पर वापस जाएँ",
    viewHub: "एक्सचेंज हब देखें",
    faqTitle: "अक्सर पूछे जाने वाले सवाल",
    reviewed: "आखिरी समीक्षा",
    comparePeers: "अक्सर जिनसे तुलना होती है",
    geoHubTitle: "एक्सचेंज GEO गाइड",
    geoHubSubtitle: "पहले सही सवाल से शुरू करें, फिर तय करें कि किस एक्सचेंज पर साइनअप करना है।",
    browseByQuestionTitle: "सवाल के आधार पर खोजें",
    browseByQuestionSubtitle: "रेफरल कोड, साइनअप/KYC और असली लागत के लिए अलग सीधा रास्ता उपलब्ध है।",
    listHubTitle: "पहले सही एक्सचेंज गाइड चुनें",
    listHubSubtitle: "हर एक्सचेंज के लिए रेफरल कोड, साइनअप/KYC और फीस तुलना के अलग पेज हैं।",
    detailHubTitle: "इस एक्सचेंज पर सबसे ज्यादा खोजे जाने वाले 3 सवाल",
    detailHubSubtitle: "जब आपको लंबी प्रोफ़ाइल नहीं बल्कि सीधा जवाब देने वाली लैंडिंग पेज चाहिए, तब इन्हें इस्तेमाल करें।",
  },
} as const;

type ExchangeMessageEntry = {
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  tutorial: string[];
  faq: { q: string; a: string }[];
};

const SEO_MESSAGE_SOURCES = {
  en: enMessages,
  zh: zhMessages,
  "zh-tw": zhTwMessages,
  ja: jaMessages,
  ko: koMessages,
  ru: ruMessages,
  es: esMessages,
  pt: ptMessages,
  vi: viMessages,
  th: thMessages,
  hi: hiMessages,
} as const;

type GeneratedLocaleCopy = {
  factLabels: {
    rebate: string;
    inviteCode: string;
    spotBaseFees: string;
    futuresBaseFees: string;
    kyc: string;
    settlement: string;
    comparedWith: string;
    lastReviewed: string;
  };
  kycLabels: {
    required: string;
    optional: string;
    none: string;
  };
  settlementLabels: {
    daily: string;
    instant: string;
  };
  primaryQueries: Partial<Record<ExchangeSeoPageType, (exchangeName: string) => string>>;
  secondaryQueries: Partial<Record<
    ExchangeSeoPageType,
    (exchangeName: string, peers: [string, string]) => string[]
  >>;
  referralHeroDescription: (exchangeName: string, peers: [string, string]) => string;
  signupHeroDescription: (exchangeName: string, peers: [string, string]) => string;
  feesHeroDescription: (exchangeName: string, peers: [string, string]) => string;
  currentInviteCode: (code: string) => string;
  currentRebate: (spot: string, futures: string) => string;
  autoActivateYes: string;
  autoActivateNo: string;
  referralWorthTitle: (exchangeName: string) => string;
  referralFailureTitle: string;
  referralFailureBody: string;
  referralRiskBullets: string[];
  signupIntroTitle: (exchangeName: string) => string;
  signupKycTitle: string;
  signupKycBody: (exchangeName: string) => string;
  feesBaseTitle: (exchangeName: string) => string;
  feesImpactTitle: string;
  feesImpactBody: string;
  compareTitle: (peerA: string, peerB: string) => string;
  compareBody: (exchangeName: string, peerA: string, peerB: string) => string;
  compareBullets: (peerA: string, peerB: string) => [string, string];
  tokenDiscountYes: (token: string, discount: string) => string;
  tokenDiscountNo: string;
  ctaReferral: (exchangeName: string) => string;
  ctaSignup: (exchangeName: string) => string;
  ctaFees: (exchangeName: string) => string;
  ctaReferralHelper: string;
  ctaSignupHelper: string;
  ctaFeesHelper: string;
  howToSteps: (exchangeName: string) => string[];
};

const GENERATED_LOCALE_COPY: Record<
  Exclude<SeoContentLocale, "en" | "zh">,
  GeneratedLocaleCopy
> = {
  "zh-tw": {
    factLabels: {
      rebate: "返佣比例",
      inviteCode: "邀請碼",
      spotBaseFees: "現貨基礎費率",
      futuresBaseFees: "合約基礎費率",
      kyc: "KYC",
      settlement: "返佣結算",
      comparedWith: "常見對比",
      lastReviewed: "最近複核",
    },
    kycLabels: { required: "必須", optional: "可選", none: "無需" },
    settlementLabels: { daily: "按日", instant: "即時" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} 邀請碼返佣`,
      "signup-kyc": (exchangeName) => `${exchangeName} 官網註冊 KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} 手續費返佣比較`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} 邀請碼怎麼填`,
        `${exchangeName} 官網註冊入口`,
        `${exchangeName} 和 ${peers[0]} ${peers[1]} 哪個更划算`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} APP 下載`,
        `${exchangeName} 需要 KYC 嗎`,
        `${exchangeName} 註冊後返佣自動生效嗎`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} 現貨手續費`,
        `${exchangeName} 合約手續費`,
        `${exchangeName} 與 ${peers[0]} ${peers[1]} 費率比較`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `查看 ${exchangeName} 目前邀請碼、官方註冊路徑、返佣生效邏輯，以及和 ${peers[0]}、${peers[1]} 相比應該怎麼選。`,
    signupHeroDescription: (exchangeName, peers) =>
      `如果你準備註冊 ${exchangeName}，先確認官網入口、APP 下載、KYC 要求與返佣綁定方式，並和 ${peers[0]}、${peers[1]} 一起比較。`,
    feesHeroDescription: (exchangeName, peers) =>
      `查看 ${exchangeName} 的現貨/合約費率、平台幣折扣與返佣後成本，並對照 ${peers[0]}、${peers[1]}。`,
    currentInviteCode: (code) => `目前邀請碼：${code}`,
    currentRebate: (spot, futures) => `目前返佣：現貨 ${spot} / 合約 ${futures}`,
    autoActivateYes: "通常沿正確連結完成註冊後，返佣關係會自動帶上。",
    autoActivateNo: "不要預設返佣會自動綁定，首次交易前要再次確認。",
    referralWorthTitle: (exchangeName) => `${exchangeName} 的邀請碼入口值得先看嗎？`,
    referralFailureTitle: "哪些情況容易讓返佣路徑失效？",
    referralFailureBody: "常見問題不是活動突然消失，而是註冊路徑走錯、先開戶後補碼，或地區與產品權限判斷錯誤。",
    referralRiskBullets: [
      "沒有從官方帶碼連結進入",
      "先註冊帳號，之後才補填邀請碼",
      "沒有先確認所在地區與目標產品是否適用",
    ],
    signupIntroTitle: (exchangeName) => `${exchangeName} 官網入口、APP 下載與註冊流程`,
    signupKycTitle: "KYC、地區限制與返佣綁定要怎麼一起看？",
    signupKycBody: (exchangeName) =>
      `註冊 ${exchangeName} 時，官網入口、APP 下載、身份驗證與可用產品要一起確認，不能只看返佣比例。`,
    feesBaseTitle: (exchangeName) => `${exchangeName} 基礎費率應該怎麼看？`,
    feesImpactTitle: "返佣會怎麼改變你的實際成本？",
    feesImpactBody:
      "返佣只有在你真的會持續交易時才會放大價值，低頻使用者更應先看底層費率與平台適配性。",
    compareTitle: (peerA, peerB) => `什麼時候該改看 ${peerA} 或 ${peerB}？`,
    compareBody: (exchangeName, peerA, peerB) =>
      `${exchangeName} 應該放在 ${peerA}、${peerB} 的比較清單裡一起看，而不是單靠返佣數字就直接做決定。`,
    compareBullets: (peerA, peerB) => [
      `${peerA} 更適合作為主流路線對照組`,
      `${peerB} 更適合比較產品偏好與交易風格`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} 可再疊加約 ${discount} 的平台幣折扣`,
    tokenDiscountNo: "這家平台沒有可明確疊加的平台幣折扣",
    ctaReferral: (exchangeName) => `查看 ${exchangeName} 官方返佣入口`,
    ctaSignup: (exchangeName) => `從 ${exchangeName} 官方連結開始註冊`,
    ctaFees: (exchangeName) => `查看 ${exchangeName} 費率與返佣入口`,
    ctaReferralHelper: "註冊前再確認邀請碼、官網路徑與地區適配性。",
    ctaSignupHelper: "先看官網入口、APP 下載與 KYC，再決定是否註冊。",
    ctaFeesHelper: "適合在準備長期交易前，用實際成本視角做最後篩選。",
    howToSteps: (exchangeName) => [
      `從 ${exchangeName} 的官方返佣連結開始，不要先走普通首頁。`,
      "先確認 APP 或官網入口是否正確，再完成郵箱或手機註冊。",
      "依提示完成身份驗證與安全設定，再確認可用產品權限。",
      "首次入金前，再核對邀請碼、返佣狀態與費率規則是否一致。",
    ],
  },
  ja: {
    factLabels: {
      rebate: "リベート",
      inviteCode: "紹介コード",
      spotBaseFees: "現物基本手数料",
      futuresBaseFees: "先物基本手数料",
      kyc: "KYC",
      settlement: "還元タイミング",
      comparedWith: "比較対象",
      lastReviewed: "最終確認日",
    },
    kycLabels: { required: "必須", optional: "任意", none: "不要" },
    settlementLabels: { daily: "日次", instant: "即時" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} 紹介コード`,
      "signup-kyc": (exchangeName) => `${exchangeName} 登録 KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} 手数料 リベート 比較`,
      "official-site": (exchangeName) => `${exchangeName} 公式サイト`,
      "app-download": (exchangeName) => `${exchangeName} アプリ ダウンロード`,
      "safety-review": (exchangeName) => `${exchangeName} 安全性 評判`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} 紹介コード 使い方`,
        `${exchangeName} 公式サイト 登録`,
        `${exchangeName} ${peers[0]} ${peers[1]} 比較`,
        `${exchangeName} 招待コード 手数料割引`,
        `${exchangeName} リベート`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} アプリ ダウンロード`,
        `${exchangeName} KYC 必要`,
        `${exchangeName} 登録 手順`,
        `${exchangeName} 本人確認`,
        `${exchangeName} 口座開設`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} 現物 手数料`,
        `${exchangeName} 先物 手数料`,
        `${exchangeName} ${peers[0]} ${peers[1]} 手数料 比較`,
        `${exchangeName} 手数料 割引`,
        `${exchangeName} 手数料 安い`,
      ],
      "official-site": (exchangeName) => [
        `${exchangeName} 公式URL`,
        `${exchangeName} 公式ドメイン`,
        `${exchangeName} ログイン`,
        `${exchangeName} 本物 サイト`,
        `${exchangeName} 公式 登録`,
      ],
      "app-download": (exchangeName) => [
        `${exchangeName} 公式アプリ`,
        `${exchangeName} アプリ インストール`,
        `${exchangeName} ダウンロード 方法`,
        `${exchangeName} APK`,
        `${exchangeName} アプリ 安全`,
      ],
      "safety-review": (exchangeName) => [
        `${exchangeName} 安全性`,
        `${exchangeName} 評判`,
        `${exchangeName} 信頼性`,
        `${exchangeName} 危険性`,
        `${exchangeName} 安全 か`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `${exchangeName} の現在の紹介コード、公式登録ルート、還元の反映条件、そして ${peers[0]}・${peers[1]} と比べた判断ポイントを確認できます。`,
    signupHeroDescription: (exchangeName, peers) =>
      `${exchangeName} に登録する前に、公式サイト、アプリ導線、KYC 条件、リベートの紐付け方を確認し、${peers[0]} と ${peers[1]} とも比較できます。`,
    feesHeroDescription: (exchangeName, peers) =>
      `${exchangeName} の現物/先物手数料、トークン割引、リベート後の実質コストを ${peers[0]}・${peers[1]} と比較します。`,
    currentInviteCode: (code) => `現在の紹介コード: ${code}`,
    currentRebate: (spot, futures) => `現在のリベート: 現物 ${spot} / 先物 ${futures}`,
    autoActivateYes: "正しいリンクから登録を完了すると、紹介関係が維持されやすくなります。",
    autoActivateNo: "自動で紐付くとは限りません。初回入金前に必ず確認してください。",
    referralWorthTitle: (exchangeName) => `${exchangeName} の紹介ルートは先に確認する価値があるか`,
    referralFailureTitle: "紹介ルートが失敗しやすい場面",
    referralFailureBody: "多くの失敗はコード消失ではなく、登録経路、アカウント作成の順番、地域や商品権限の前提ミスから起こります。",
    referralRiskBullets: [
      "公式の紹介リンクを使わず通常トップから登録した",
      "先に口座を作成し、その後でコードを入れようとした",
      "地域や商品ごとの条件を確認しなかった",
    ],
    signupIntroTitle: (exchangeName) => `${exchangeName} の公式導線、アプリ、登録手順`,
    signupKycTitle: "KYC、地域制限、リベート反映をどう確認するか",
    signupKycBody: (exchangeName) =>
      `${exchangeName} では、公式登録導線、アプリ導線、本人確認、使いたい商品が同時に噛み合っているかを確認する必要があります。`,
    feesBaseTitle: (exchangeName) => `${exchangeName} の基本手数料をどう見るべきか`,
    feesImpactTitle: "リベートは実質コストをどう変えるか",
    feesImpactBody:
      "リベートの価値が大きくなるのは継続的に取引する場合です。低頻度ユーザーは土台の手数料と使い勝手を優先して見るべきです。",
    compareTitle: (peerA, peerB) => `${peerA} と ${peerB} を見るべき場面`,
    compareBody: (exchangeName, peerA, peerB) =>
      `${exchangeName} は ${peerA} と ${peerB} と並べて比較して初めて判断しやすくなります。リベートの数字だけで決めるべきではありません。`,
    compareBullets: (peerA, peerB) => [
      `${peerA} は主流ルートの比較対象として有効です`,
      `${peerB} は取引スタイルや商品選好の比較に向いています`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} による約 ${discount} の割引を追加で考慮できます`,
    tokenDiscountNo: "明確に積み上がるトークン割引はありません",
    ctaReferral: (exchangeName) => `${exchangeName} の公式リベート登録を開く`,
    ctaSignup: (exchangeName) => `${exchangeName} の公式リンクから登録する`,
    ctaFees: (exchangeName) => `${exchangeName} の手数料とリベートを見る`,
    ctaReferralHelper: "登録前にコード表示、公式導線、地域適合を再確認してください。",
    ctaSignupHelper: "公式サイト、アプリ導線、KYC 条件を確認してから登録判断を行います。",
    ctaFeesHelper: "長期的に取引する前に、実質コスト視点で最終比較するための入口です。",
    howToSteps: (exchangeName) => [
      `${exchangeName} の公式リベートリンクから開始し、通常トップページを経由しないでください。`,
      "アプリ導線または公式サイト導線が正しいことを確認してから登録します。",
      "本人確認と基本セキュリティ設定を完了し、利用したい商品の権限を確認します。",
      "初回入金前に、紹介コード、リベート状態、手数料前提をもう一度確認します。",
    ],
  },
  ko: {
    factLabels: {
      rebate: "리베이트",
      inviteCode: "추천코드",
      spotBaseFees: "현물 기본 수수료",
      futuresBaseFees: "선물 기본 수수료",
      kyc: "KYC",
      settlement: "정산 주기",
      comparedWith: "주요 비교 대상",
      lastReviewed: "최근 검토일",
    },
    kycLabels: { required: "필수", optional: "선택", none: "불필요" },
    settlementLabels: { daily: "일별", instant: "즉시" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} 추천코드`,
      "signup-kyc": (exchangeName) => `${exchangeName} 가입 KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} 수수료 리베이트 비교`,
      "official-site": (exchangeName) => `${exchangeName} 공식 사이트`,
      "app-download": (exchangeName) => `${exchangeName} 앱 다운로드`,
      "safety-review": (exchangeName) => `${exchangeName} 안전성 리뷰`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} 추천코드 입력`,
        `${exchangeName} 공식 사이트 가입`,
        `${exchangeName} ${peers[0]} ${peers[1]} 비교`,
        `${exchangeName} 수수료 할인`,
        `${exchangeName} 리베이트`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} 앱 다운로드`,
        `${exchangeName} KYC 필요`,
        `${exchangeName} 가입 방법`,
        `${exchangeName} 본인인증`,
        `${exchangeName} 회원가입`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} 현물 수수료`,
        `${exchangeName} 선물 수수료`,
        `${exchangeName} ${peers[0]} ${peers[1]} 수수료 비교`,
        `${exchangeName} 거래 수수료`,
        `${exchangeName} 수수료 할인`,
      ],
      "official-site": (exchangeName) => [
        `${exchangeName} 공식 URL`,
        `${exchangeName} 공식 도메인`,
        `${exchangeName} 로그인`,
        `${exchangeName} 진짜 사이트`,
        `${exchangeName} 공식 가입`,
      ],
      "app-download": (exchangeName) => [
        `${exchangeName} 공식 앱`,
        `${exchangeName} 앱 설치`,
        `${exchangeName} APK`,
        `${exchangeName} 다운로드 방법`,
        `${exchangeName} 앱 안전`,
      ],
      "safety-review": (exchangeName) => [
        `${exchangeName} 안전한가`,
        `${exchangeName} 평판`,
        `${exchangeName} 신뢰성`,
        `${exchangeName} 위험성`,
        `${exchangeName} 리뷰`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `${exchangeName}의 현재 추천코드, 공식 가입 경로, 리베이트 적용 방식, 그리고 ${peers[0]}, ${peers[1]}와 비교할 때 무엇을 봐야 하는지 정리했습니다.`,
    signupHeroDescription: (exchangeName, peers) =>
      `${exchangeName}에 가입하기 전에 공식 사이트, 앱 경로, KYC 조건, 리베이트 연결 방식을 확인하고 ${peers[0]}, ${peers[1]}와 함께 비교할 수 있습니다.`,
    feesHeroDescription: (exchangeName, peers) =>
      `${exchangeName}의 현물/선물 수수료, 플랫폼 토큰 할인, 리베이트 적용 후 실제 비용을 ${peers[0]}, ${peers[1]}와 비교합니다.`,
    currentInviteCode: (code) => `현재 추천코드: ${code}`,
    currentRebate: (spot, futures) => `현재 리베이트: 현물 ${spot} / 선물 ${futures}`,
    autoActivateYes: "올바른 링크에서 가입을 끝내면 추천 관계가 유지되기 쉽습니다.",
    autoActivateNo: "자동 적용을 전제로 두지 마세요. 첫 입금 전 다시 확인해야 합니다.",
    referralWorthTitle: (exchangeName) => `${exchangeName} 추천 경로를 먼저 봐야 하는 이유`,
    referralFailureTitle: "추천 경로가 끊기는 대표적인 경우",
    referralFailureBody: "대부분의 실패는 코드가 사라져서가 아니라 가입 경로, 계정 생성 순서, 지역/상품 조건을 잘못 본 데서 발생합니다.",
    referralRiskBullets: [
      "공식 추천 링크가 아닌 일반 홈페이지에서 가입함",
      "먼저 계정을 만든 뒤 나중에 코드를 넣으려 함",
      "거주 지역과 사용 상품의 제한을 확인하지 않음",
    ],
    signupIntroTitle: (exchangeName) => `${exchangeName} 공식 경로, 앱, 가입 절차`,
    signupKycTitle: "KYC, 지역 제한, 리베이트 연결을 함께 보는 방법",
    signupKycBody: (exchangeName) =>
      `${exchangeName}에서는 공식 가입 경로, 앱 경로, 본인 인증, 사용하려는 상품 권한을 함께 확인해야 합니다.`,
    feesBaseTitle: (exchangeName) => `${exchangeName} 기본 수수료를 어떻게 볼까`,
    feesImpactTitle: "리베이트가 실제 비용에 주는 영향",
    feesImpactBody:
      "리베이트 가치는 실제로 거래를 계속할 때 커집니다. 저빈도 사용자는 기본 수수료와 플랫폼 적합성을 먼저 봐야 합니다.",
    compareTitle: (peerA, peerB) => `${peerA} 또는 ${peerB}와 비교해야 하는 경우`,
    compareBody: (exchangeName, peerA, peerB) =>
      `${exchangeName}는 ${peerA}, ${peerB}와 나란히 비교해야 판단이 쉬워집니다. 리베이트 숫자만 보고 결정하면 안 됩니다.`,
    compareBullets: (peerA, peerB) => [
      `${peerA}는 메이저 기준 비교용으로 좋습니다`,
      `${peerB}는 거래 스타일과 상품 선호 비교에 적합합니다`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} 보유 시 약 ${discount} 추가 할인까지 고려할 수 있습니다`,
    tokenDiscountNo: "명확하게 중첩되는 플랫폼 토큰 할인 정보는 없습니다",
    ctaReferral: (exchangeName) => `${exchangeName} 공식 리베이트 가입 열기`,
    ctaSignup: (exchangeName) => `${exchangeName} 공식 링크로 가입 시작`,
    ctaFees: (exchangeName) => `${exchangeName} 수수료와 리베이트 보기`,
    ctaReferralHelper: "가입 전에 코드 표시, 공식 경로, 지역 적합성을 다시 확인하세요.",
    ctaSignupHelper: "공식 사이트, 앱 경로, KYC 조건을 먼저 확인한 뒤 가입 여부를 결정하세요.",
    ctaFeesHelper: "장기 거래 전 실제 비용 기준으로 마지막 비교를 할 때 유용합니다.",
    howToSteps: (exchangeName) => [
      `${exchangeName} 공식 리베이트 링크에서 시작하고 일반 홈페이지를 먼저 거치지 마세요.`,
      "앱 또는 공식 사이트 경로가 맞는지 확인한 뒤 가입을 진행합니다.",
      "본인 인증과 기본 보안 설정을 마치고 원하는 상품 권한을 확인합니다.",
      "첫 입금 전에 추천코드, 리베이트 상태, 수수료 전제를 다시 확인합니다.",
    ],
  },
  ru: {
    factLabels: {
      rebate: "Ребейт",
      inviteCode: "Рефкод",
      spotBaseFees: "Базовые комиссии спота",
      futuresBaseFees: "Базовые комиссии фьючерсов",
      kyc: "KYC",
      settlement: "Начисление",
      comparedWith: "С кем сравнивают",
      lastReviewed: "Последняя проверка",
    },
    kycLabels: { required: "Обязателен", optional: "Опционально", none: "Не требуется" },
    settlementLabels: { daily: "Ежедневно", instant: "Мгновенно" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} рефкод`,
      "signup-kyc": (exchangeName) => `${exchangeName} регистрация KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} комиссии ребейт сравнение`,
      "official-site": (exchangeName) => `${exchangeName} официальный сайт`,
      "app-download": (exchangeName) => `${exchangeName} скачать приложение`,
      "safety-review": (exchangeName) => `${exchangeName} безопасность обзор`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} как ввести рефкод`,
        `${exchangeName} официальный сайт регистрация`,
        `${exchangeName} ${peers[0]} ${peers[1]} сравнение`,
        `${exchangeName} скидка на комиссии`,
        `${exchangeName} ребейт`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} скачать приложение`,
        `${exchangeName} нужен KYC`,
        `${exchangeName} как зарегистрироваться`,
        `${exchangeName} верификация`,
        `${exchangeName} открыть аккаунт`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} комиссии спот`,
        `${exchangeName} комиссии фьючерсы`,
        `${exchangeName} ${peers[0]} ${peers[1]} комиссии`,
        `${exchangeName} торговые комиссии`,
        `${exchangeName} скидка на комиссии`,
      ],
      "official-site": (exchangeName) => [
        `${exchangeName} официальный URL`,
        `${exchangeName} официальный домен`,
        `${exchangeName} вход`,
        `${exchangeName} настоящий сайт`,
        `${exchangeName} официальный вход`,
      ],
      "app-download": (exchangeName) => [
        `${exchangeName} официальное приложение`,
        `${exchangeName} установить приложение`,
        `${exchangeName} APK`,
        `${exchangeName} приложение безопасно`,
        `${exchangeName} как скачать приложение`,
      ],
      "safety-review": (exchangeName) => [
        `${exchangeName} безопасно ли`,
        `${exchangeName} отзывы`,
        `${exchangeName} надежность`,
        `${exchangeName} риски`,
        `${exchangeName} обзор биржи`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `Здесь собраны текущий рефкод ${exchangeName}, официальный путь регистрации, логика активации ребейта и то, как эту биржу сравнивать с ${peers[0]} и ${peers[1]}.`,
    signupHeroDescription: (exchangeName, peers) =>
      `Перед регистрацией на ${exchangeName} проверьте официальный сайт, путь через приложение, требования KYC и привязку ребейта, а затем сравните с ${peers[0]} и ${peers[1]}.`,
    feesHeroDescription: (exchangeName, peers) =>
      `Сравните комиссии спота и фьючерсов ${exchangeName}, скидку по токену платформы и реальную стоимость после ребейта с ${peers[0]} и ${peers[1]}.`,
    currentInviteCode: (code) => `Текущий рефкод: ${code}`,
    currentRebate: (spot, futures) => `Текущий ребейт: спот ${spot} / фьючерсы ${futures}`,
    autoActivateYes: "Если начать регистрацию по правильной ссылке, реферальная привязка обычно сохраняется.",
    autoActivateNo: "Не считайте активацию автоматической. Проверьте статус до первого депозита.",
    referralWorthTitle: (exchangeName) => `Стоит ли сначала открыть реферальный путь ${exchangeName}?`,
    referralFailureTitle: "Почему реферальный путь может не сработать",
    referralFailureBody: "Обычно проблема не в исчезновении кода, а в неверном пути регистрации, порядке создания аккаунта или в региональных и продуктовых ограничениях.",
    referralRiskBullets: [
      "регистрация не через официальный реферальный линк",
      "аккаунт создан раньше, чем введен код",
      "не проверены региональные ограничения и доступность нужного продукта",
    ],
    signupIntroTitle: (exchangeName) => `Официальный путь, приложение и регистрация ${exchangeName}`,
    signupKycTitle: "Как вместе проверить KYC, региональные ограничения и ребейт",
    signupKycBody: (exchangeName) =>
      `Для ${exchangeName} важно смотреть на официальный путь регистрации, приложение, верификацию личности и доступность нужных продуктов как на одну связку.`,
    feesBaseTitle: (exchangeName) => `Как оценивать базовые комиссии ${exchangeName}`,
    feesImpactTitle: "Как ребейт меняет реальную стоимость",
    feesImpactBody:
      "Ребейт раскрывается только при регулярной торговле. Для редкого использования важнее базовые комиссии и общая пригодность площадки.",
    compareTitle: (peerA, peerB) => `Когда смотреть на ${peerA} или ${peerB}`,
    compareBody: (exchangeName, peerA, peerB) =>
      `${exchangeName} стоит сравнивать с ${peerA} и ${peerB} в одном наборе, а не принимать решение только по цифре ребейта.`,
    compareBullets: (peerA, peerB) => [
      `${peerA} подходит как более близкий мейнстримный ориентир`,
      `${peerB} полезен для сравнения стиля торговли и продуктовых предпочтений`,
    ],
    tokenDiscountYes: (token, discount) =>
      `Токен ${token} может дать еще около ${discount} скидки поверх базовой ставки`,
    tokenDiscountNo: "Отдельной накапливаемой скидки по токену платформы здесь нет",
    ctaReferral: (exchangeName) => `Открыть официальный ребейт-вход ${exchangeName}`,
    ctaSignup: (exchangeName) => `Начать регистрацию ${exchangeName} по официальной ссылке`,
    ctaFees: (exchangeName) => `Посмотреть комиссии и ребейт ${exchangeName}`,
    ctaReferralHelper: "Перед регистрацией перепроверьте код, официальный путь и региональную применимость.",
    ctaSignupHelper: "Сначала проверьте официальный сайт, приложение и KYC, а затем решайте, стоит ли регистрироваться.",
    ctaFeesHelper: "Полезно перед долгосрочной торговлей, когда вы хотите финально сравнить реальную стоимость.",
    howToSteps: (exchangeName) => [
      `Начинайте с официальной ребейт-ссылки ${exchangeName}, а не с обычной главной страницы.`,
      "Проверьте, что сайт или путь через приложение корректны, и только потом регистрируйтесь.",
      "Завершите KYC и базовые настройки безопасности, затем проверьте доступ к нужным продуктам.",
      "До первого депозита еще раз подтвердите рефкод, состояние ребейта и предпосылки по комиссиям.",
    ],
  },
  es: {
    factLabels: {
      rebate: "Rebate",
      inviteCode: "Código",
      spotBaseFees: "Comisiones base spot",
      futuresBaseFees: "Comisiones base futures",
      kyc: "KYC",
      settlement: "Liquidación",
      comparedWith: "Comparado con",
      lastReviewed: "Última revisión",
    },
    kycLabels: { required: "Obligatorio", optional: "Opcional", none: "No requerido" },
    settlementLabels: { daily: "Diario", instant: "Instantáneo" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} código de referido`,
      "signup-kyc": (exchangeName) => `${exchangeName} registro KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} comisiones rebate comparación`,
      "official-site": (exchangeName) => `${exchangeName} sitio oficial`,
      "app-download": (exchangeName) => `${exchangeName} descargar app`,
      "safety-review": (exchangeName) => `${exchangeName} seguridad reseña`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} cómo usar código`,
        `${exchangeName} sitio oficial registro`,
        `${exchangeName} ${peers[0]} ${peers[1]} comparación`,
        `${exchangeName} descuento comisiones`,
        `${exchangeName} rebate`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} descargar app`,
        `${exchangeName} KYC obligatorio`,
        `${exchangeName} cómo registrarse`,
        `${exchangeName} verificación`,
        `${exchangeName} abrir cuenta`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} comisiones spot`,
        `${exchangeName} comisiones futuros`,
        `${exchangeName} ${peers[0]} ${peers[1]} comisiones`,
        `${exchangeName} tarifas trading`,
        `${exchangeName} descuento comisiones`,
      ],
      "official-site": (exchangeName) => [
        `${exchangeName} web oficial`,
        `${exchangeName} dominio oficial`,
        `${exchangeName} iniciar sesión`,
        `${exchangeName} sitio real`,
        `${exchangeName} registro oficial`,
      ],
      "app-download": (exchangeName) => [
        `${exchangeName} app oficial`,
        `${exchangeName} instalar app`,
        `${exchangeName} APK`,
        `${exchangeName} app segura`,
        `${exchangeName} cómo descargar app`,
      ],
      "safety-review": (exchangeName) => [
        `${exchangeName} es seguro`,
        `${exchangeName} opiniones`,
        `${exchangeName} confiable`,
        `${exchangeName} riesgos`,
        `${exchangeName} reseña exchange`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `Consulta el código actual de ${exchangeName}, la ruta oficial de registro, la activación del rebate y cómo compararlo con ${peers[0]} y ${peers[1]}.`,
    signupHeroDescription: (exchangeName, peers) =>
      `Antes de registrarte en ${exchangeName}, revisa el sitio oficial, la ruta de la app, el KYC y la vinculación del rebate, y compáralo con ${peers[0]} y ${peers[1]}.`,
    feesHeroDescription: (exchangeName, peers) =>
      `Compara las comisiones spot y futures de ${exchangeName}, el descuento del token y el coste efectivo tras rebate frente a ${peers[0]} y ${peers[1]}.`,
    currentInviteCode: (code) => `Código actual: ${code}`,
    currentRebate: (spot, futures) => `Rebate actual: spot ${spot} / futures ${futures}`,
    autoActivateYes: "Si empiezas desde el enlace correcto, la relación de referido suele mantenerse.",
    autoActivateNo: "No asumas activación automática. Revísalo antes del primer depósito.",
    referralWorthTitle: (exchangeName) => `¿Vale la pena revisar primero la ruta de referido de ${exchangeName}?`,
    referralFailureTitle: "Qué puede romper la ruta de referido",
    referralFailureBody: "La mayoría de fallos no viene por la desaparición del código, sino por la ruta de alta, el orden de creación de cuenta o las restricciones regionales y de producto.",
    referralRiskBullets: [
      "registrarte fuera del enlace oficial con código",
      "crear la cuenta primero e intentar añadir el código después",
      "no revisar región y acceso al producto que quieres usar",
    ],
    signupIntroTitle: (exchangeName) => `Sitio oficial, app y registro de ${exchangeName}`,
    signupKycTitle: "Cómo revisar KYC, región y activación del rebate",
    signupKycBody: (exchangeName) =>
      `En ${exchangeName} conviene revisar como un solo paquete la ruta oficial, la app, la verificación y el acceso real a los productos.`,
    feesBaseTitle: (exchangeName) => `Cómo leer las comisiones base de ${exchangeName}`,
    feesImpactTitle: "Cómo cambia el rebate tu coste real",
    feesImpactBody:
      "El rebate solo gana peso si vas a operar de forma constante. Si operas poco, importan más las comisiones base y el encaje general de la plataforma.",
    compareTitle: (peerA, peerB) => `Cuándo conviene mirar ${peerA} o ${peerB}`,
    compareBody: (exchangeName, peerA, peerB) =>
      `La mejor forma de evaluar ${exchangeName} es compararlo junto con ${peerA} y ${peerB}, no decidir solo por el porcentaje de rebate.`,
    compareBullets: (peerA, peerB) => [
      `${peerA} sirve como referencia más cercana del camino principal`,
      `${peerB} ayuda a comparar estilo de trading y preferencias de producto`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} puede añadir alrededor de ${discount} de descuento adicional`,
    tokenDiscountNo: "No hay un descuento acumulable claro por token de plataforma",
    ctaReferral: (exchangeName) => `Abrir el registro oficial con rebate de ${exchangeName}`,
    ctaSignup: (exchangeName) => `Empezar el registro oficial de ${exchangeName}`,
    ctaFees: (exchangeName) => `Ver comisiones y rebate de ${exchangeName}`,
    ctaReferralHelper: "Antes de registrarte, vuelve a comprobar código, sitio oficial y encaje regional.",
    ctaSignupHelper: "Revisa sitio oficial, app y KYC antes de decidir si te registras.",
    ctaFeesHelper: "Úsalo antes de operar a largo plazo si quieres comparar el coste efectivo real.",
    howToSteps: (exchangeName) => [
      `Empieza desde el enlace oficial con rebate de ${exchangeName}, no desde la portada genérica.`,
      "Confirma que el sitio o la ruta de la app son correctos antes de crear la cuenta.",
      "Completa KYC y la seguridad básica, y luego revisa el acceso al producto que necesitas.",
      "Antes del primer depósito, confirma otra vez el código, el estado del rebate y la tabla de comisiones.",
    ],
  },
  pt: {
    factLabels: {
      rebate: "Rebate",
      inviteCode: "Código",
      spotBaseFees: "Taxas base spot",
      futuresBaseFees: "Taxas base futures",
      kyc: "KYC",
      settlement: "Liquidação",
      comparedWith: "Comparado com",
      lastReviewed: "Última revisão",
    },
    kycLabels: { required: "Obrigatório", optional: "Opcional", none: "Não exigido" },
    settlementLabels: { daily: "Diário", instant: "Instantâneo" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} código de indicação`,
      "signup-kyc": (exchangeName) => `${exchangeName} cadastro KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} taxas rebate comparação`,
      "official-site": (exchangeName) => `${exchangeName} site oficial`,
      "app-download": (exchangeName) => `${exchangeName} baixar app`,
      "safety-review": (exchangeName) => `${exchangeName} segurança avaliação`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} como usar código`,
        `${exchangeName} site oficial cadastro`,
        `${exchangeName} ${peers[0]} ${peers[1]} comparação`,
        `${exchangeName} desconto taxas`,
        `${exchangeName} rebate`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} baixar app`,
        `${exchangeName} KYC obrigatório`,
        `${exchangeName} como se cadastrar`,
        `${exchangeName} verificação`,
        `${exchangeName} abrir conta`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} taxas spot`,
        `${exchangeName} taxas futuros`,
        `${exchangeName} ${peers[0]} ${peers[1]} taxas`,
        `${exchangeName} taxas trading`,
        `${exchangeName} desconto taxas`,
      ],
      "official-site": (exchangeName) => [
        `${exchangeName} website oficial`,
        `${exchangeName} domínio oficial`,
        `${exchangeName} login`,
        `${exchangeName} site verdadeiro`,
        `${exchangeName} cadastro oficial`,
      ],
      "app-download": (exchangeName) => [
        `${exchangeName} aplicativo oficial`,
        `${exchangeName} instalar app`,
        `${exchangeName} APK`,
        `${exchangeName} app seguro`,
        `${exchangeName} como baixar app`,
      ],
      "safety-review": (exchangeName) => [
        `${exchangeName} é seguro`,
        `${exchangeName} opiniões`,
        `${exchangeName} confiável`,
        `${exchangeName} riscos`,
        `${exchangeName} avaliação exchange`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `Veja o código atual de ${exchangeName}, o caminho oficial de cadastro, a lógica de ativação do rebate e como comparar com ${peers[0]} e ${peers[1]}.`,
    signupHeroDescription: (exchangeName, peers) =>
      `Antes de se cadastrar na ${exchangeName}, confirme o site oficial, o caminho do app, o KYC e a vinculação do rebate, comparando também com ${peers[0]} e ${peers[1]}.`,
    feesHeroDescription: (exchangeName, peers) =>
      `Compare as taxas spot e futures da ${exchangeName}, o desconto via token e o custo efetivo após rebate com ${peers[0]} e ${peers[1]}.`,
    currentInviteCode: (code) => `Código atual: ${code}`,
    currentRebate: (spot, futures) => `Rebate atual: spot ${spot} / futures ${futures}`,
    autoActivateYes: "Ao começar pelo link certo, a relação de indicação normalmente é preservada.",
    autoActivateNo: "Não assuma ativação automática. Confirme antes do primeiro depósito.",
    referralWorthTitle: (exchangeName) => `Vale a pena ver primeiro a rota de indicação da ${exchangeName}?`,
    referralFailureTitle: "O que faz a rota de indicação falhar",
    referralFailureBody: "Os problemas mais comuns não surgem porque o código sumiu, mas porque o cadastro foi feito pela rota errada, em ordem errada, ou sem revisar restrições de região e produto.",
    referralRiskBullets: [
      "cadastrar-se fora do link oficial com código",
      "criar a conta antes e tentar inserir o código depois",
      "não revisar região e acesso ao produto desejado",
    ],
    signupIntroTitle: (exchangeName) => `Site oficial, app e cadastro da ${exchangeName}`,
    signupKycTitle: "Como revisar KYC, região e ativação do rebate",
    signupKycBody: (exchangeName) =>
      `Na ${exchangeName}, o ideal é validar como um conjunto único o site oficial, o app, a verificação e o acesso real aos produtos que você quer usar.`,
    feesBaseTitle: (exchangeName) => `Como ler as taxas base da ${exchangeName}`,
    feesImpactTitle: "Como o rebate muda o custo real",
    feesImpactBody:
      "O rebate só ganha peso para quem vai negociar com frequência. Para uso ocasional, as taxas base e o encaixe da plataforma importam mais.",
    compareTitle: (peerA, peerB) => `Quando faz sentido olhar ${peerA} ou ${peerB}`,
    compareBody: (exchangeName, peerA, peerB) =>
      `A forma correta de avaliar ${exchangeName} é compará-la junto com ${peerA} e ${peerB}, e não decidir apenas pelo percentual de rebate.`,
    compareBullets: (peerA, peerB) => [
      `${peerA} funciona como referência mais próxima da rota principal`,
      `${peerB} ajuda a comparar estilo de trading e preferência de produto`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} pode acrescentar cerca de ${discount} de desconto adicional`,
    tokenDiscountNo: "Não há um desconto claro de token de plataforma para acumular",
    ctaReferral: (exchangeName) => `Abrir o cadastro oficial com rebate da ${exchangeName}`,
    ctaSignup: (exchangeName) => `Começar o cadastro oficial da ${exchangeName}`,
    ctaFees: (exchangeName) => `Ver taxas e rebate da ${exchangeName}`,
    ctaReferralHelper: "Antes de se cadastrar, confirme novamente o código, o site oficial e o encaixe regional.",
    ctaSignupHelper: "Revise site oficial, app e KYC antes de decidir pelo cadastro.",
    ctaFeesHelper: "Use isto antes de operar no longo prazo se quiser comparar o custo efetivo real.",
    howToSteps: (exchangeName) => [
      `Comece pelo link oficial com rebate da ${exchangeName}, e não pela homepage genérica.`,
      "Confirme se o site ou o caminho do app estão corretos antes de criar a conta.",
      "Conclua o KYC e a segurança básica, depois confira o acesso ao produto de que precisa.",
      "Antes do primeiro depósito, valide novamente o código, o estado do rebate e a estrutura de taxas.",
    ],
  },
  vi: {
    factLabels: {
      rebate: "Hoàn phí",
      inviteCode: "Mã giới thiệu",
      spotBaseFees: "Phí cơ bản spot",
      futuresBaseFees: "Phí cơ bản futures",
      kyc: "KYC",
      settlement: "Chu kỳ trả hoàn",
      comparedWith: "Hay so với",
      lastReviewed: "Rà soát gần nhất",
    },
    kycLabels: { required: "Bắt buộc", optional: "Tùy chọn", none: "Không cần" },
    settlementLabels: { daily: "Hàng ngày", instant: "Tức thì" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} mã giới thiệu`,
      "signup-kyc": (exchangeName) => `${exchangeName} đăng ký KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} phí hoàn phí so sánh`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} nhập mã giới thiệu`,
        `${exchangeName} trang chính thức đăng ký`,
        `${exchangeName} ${peers[0]} ${peers[1]} so sánh`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} tải app`,
        `${exchangeName} cần KYC không`,
        `${exchangeName} cách đăng ký`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} phí spot`,
        `${exchangeName} phí futures`,
        `${exchangeName} ${peers[0]} ${peers[1]} phí`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `Trang này giúp bạn kiểm tra mã giới thiệu hiện tại của ${exchangeName}, đường dẫn đăng ký chính thức, cách kích hoạt hoàn phí và cách so với ${peers[0]} cùng ${peers[1]}.`,
    signupHeroDescription: (exchangeName, peers) =>
      `Trước khi đăng ký ${exchangeName}, hãy kiểm tra website chính thức, đường dẫn app, yêu cầu KYC và cách gắn hoàn phí, rồi đối chiếu với ${peers[0]} và ${peers[1]}.`,
    feesHeroDescription: (exchangeName, peers) =>
      `So sánh phí spot/futures của ${exchangeName}, ưu đãi token nền tảng và chi phí thực sau hoàn phí với ${peers[0]} và ${peers[1]}.`,
    currentInviteCode: (code) => `Mã hiện tại: ${code}`,
    currentRebate: (spot, futures) => `Hoàn phí hiện tại: spot ${spot} / futures ${futures}`,
    autoActivateYes: "Nếu bắt đầu từ đúng liên kết, quan hệ giới thiệu thường được giữ nguyên.",
    autoActivateNo: "Đừng mặc định tự động kích hoạt. Hãy kiểm tra trước lần nạp đầu tiên.",
    referralWorthTitle: (exchangeName) => `Có nên xem trước đường dẫn giới thiệu của ${exchangeName}?`,
    referralFailureTitle: "Điều gì làm đường dẫn giới thiệu bị lỗi",
    referralFailureBody: "Phần lớn lỗi không phải do mã biến mất mà do đăng ký sai đường dẫn, sai thứ tự hoặc chưa kiểm tra hạn chế khu vực và sản phẩm.",
    referralRiskBullets: [
      "đăng ký ngoài liên kết chính thức có mã",
      "tạo tài khoản trước rồi mới cố thêm mã",
      "không kiểm tra khu vực và quyền truy cập sản phẩm",
    ],
    signupIntroTitle: (exchangeName) => `Website chính thức, app và đăng ký của ${exchangeName}`,
    signupKycTitle: "Cách xem chung KYC, khu vực và kích hoạt hoàn phí",
    signupKycBody: (exchangeName) =>
      `Với ${exchangeName}, bạn nên kiểm tra website chính thức, app, xác minh danh tính và quyền truy cập sản phẩm như một gói thống nhất.`,
    feesBaseTitle: (exchangeName) => `Cách đọc phí cơ bản của ${exchangeName}`,
    feesImpactTitle: "Hoàn phí thay đổi chi phí thực như thế nào",
    feesImpactBody:
      "Giá trị hoàn phí chỉ thực sự lớn nếu bạn giao dịch đều. Nếu giao dịch ít, nên ưu tiên nhìn phí nền và độ phù hợp của sàn.",
    compareTitle: (peerA, peerB) => `Khi nào nên xem ${peerA} hoặc ${peerB}`,
    compareBody: (exchangeName, peerA, peerB) =>
      `Cách tốt nhất để đánh giá ${exchangeName} là đặt cạnh ${peerA} và ${peerB}, thay vì chỉ quyết định theo con số hoàn phí.`,
    compareBullets: (peerA, peerB) => [
      `${peerA} phù hợp làm mốc so sánh chính`,
      `${peerB} hữu ích khi so kiểu giao dịch và nhu cầu sản phẩm`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} có thể cộng thêm khoảng ${discount} giảm phí`,
    tokenDiscountNo: "Không có ưu đãi token nền tảng cộng dồn rõ ràng",
    ctaReferral: (exchangeName) => `Mở đăng ký hoàn phí chính thức của ${exchangeName}`,
    ctaSignup: (exchangeName) => `Bắt đầu đăng ký chính thức của ${exchangeName}`,
    ctaFees: (exchangeName) => `Xem phí và hoàn phí của ${exchangeName}`,
    ctaReferralHelper: "Trước khi đăng ký, hãy kiểm tra lại mã, website chính thức và độ phù hợp theo khu vực.",
    ctaSignupHelper: "Kiểm tra website chính thức, app và KYC trước khi quyết định đăng ký.",
    ctaFeesHelper: "Dùng trước khi giao dịch dài hạn nếu bạn muốn so chi phí thực tế.",
    howToSteps: (exchangeName) => [
      `Bắt đầu từ liên kết hoàn phí chính thức của ${exchangeName}, đừng đi từ trang chủ chung.`,
      "Xác nhận website hoặc đường dẫn app là đúng trước khi tạo tài khoản.",
      "Hoàn tất KYC và thiết lập bảo mật cơ bản, rồi kiểm tra quyền dùng sản phẩm cần thiết.",
      "Trước lần nạp đầu tiên, xác nhận lại mã, trạng thái hoàn phí và giả định về phí.",
    ],
  },
  th: {
    factLabels: {
      rebate: "รีเบต",
      inviteCode: "โค้ดแนะนำ",
      spotBaseFees: "ค่าธรรมเนียมพื้นฐานสปอต",
      futuresBaseFees: "ค่าธรรมเนียมพื้นฐานฟิวเจอร์ส",
      kyc: "KYC",
      settlement: "รอบจ่ายรีเบต",
      comparedWith: "มักเทียบกับ",
      lastReviewed: "ตรวจทานล่าสุด",
    },
    kycLabels: { required: "บังคับ", optional: "ทางเลือก", none: "ไม่จำเป็น" },
    settlementLabels: { daily: "รายวัน", instant: "ทันที" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} โค้ดแนะนำ`,
      "signup-kyc": (exchangeName) => `${exchangeName} สมัคร KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} ค่าธรรมเนียม รีเบต เปรียบเทียบ`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} ใส่โค้ดแนะนำ`,
        `${exchangeName} เว็บไซต์ทางการ สมัคร`,
        `${exchangeName} ${peers[0]} ${peers[1]} เปรียบเทียบ`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} ดาวน์โหลดแอป`,
        `${exchangeName} ต้อง KYC ไหม`,
        `${exchangeName} วิธีสมัคร`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} ค่าธรรมเนียมสปอต`,
        `${exchangeName} ค่าธรรมเนียมฟิวเจอร์ส`,
        `${exchangeName} ${peers[0]} ${peers[1]} ค่าธรรมเนียม`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `ตรวจสอบโค้ดแนะนำปัจจุบันของ ${exchangeName} เส้นทางสมัครอย่างเป็นทางการ วิธีที่รีเบตเริ่มทำงาน และวิธีเปรียบเทียบกับ ${peers[0]} และ ${peers[1]}`,
    signupHeroDescription: (exchangeName, peers) =>
      `ก่อนสมัคร ${exchangeName} ให้เช็กเว็บไซต์ทางการ เส้นทางแอป KYC และการผูกรีเบต แล้วค่อยเทียบกับ ${peers[0]} และ ${peers[1]}`,
    feesHeroDescription: (exchangeName, peers) =>
      `เปรียบเทียบค่าธรรมเนียมสปอต/ฟิวเจอร์สของ ${exchangeName} ส่วนลดจากโทเคน และต้นทุนจริงหลังรีเบตกับ ${peers[0]} และ ${peers[1]}`,
    currentInviteCode: (code) => `โค้ดปัจจุบัน: ${code}`,
    currentRebate: (spot, futures) => `รีเบตปัจจุบัน: สปอต ${spot} / ฟิวเจอร์ส ${futures}`,
    autoActivateYes: "ถ้าเริ่มจากลิงก์ที่ถูกต้อง ความสัมพันธ์แบบแนะนำมักจะติดมาด้วย",
    autoActivateNo: "อย่าคิดว่าเปิดอัตโนมัติ ให้ตรวจสอบก่อนฝากครั้งแรก",
    referralWorthTitle: (exchangeName) => `ควรเช็กเส้นทางโค้ดแนะนำของ ${exchangeName} ก่อนหรือไม่`,
    referralFailureTitle: "อะไรทำให้เส้นทางโค้ดแนะนำหลุดได้",
    referralFailureBody: "ปัญหาส่วนใหญ่ไม่ได้เกิดจากโค้ดหาย แต่เกิดจากเส้นทางสมัครไม่ถูก ลำดับการเปิดบัญชีผิด หรือไม่เช็กข้อจำกัดตามภูมิภาคและสินค้า",
    referralRiskBullets: [
      "สมัครนอกลิงก์ทางการที่มีโค้ด",
      "สร้างบัญชีก่อนแล้วค่อยพยายามใส่โค้ดทีหลัง",
      "ไม่เช็กภูมิภาคและสิทธิ์ใช้สินค้าที่ต้องการ",
    ],
    signupIntroTitle: (exchangeName) => `เว็บไซต์ทางการ แอป และการสมัครของ ${exchangeName}`,
    signupKycTitle: "จะดู KYC ภูมิภาค และการเปิดใช้รีเบตร่วมกันอย่างไร",
    signupKycBody: (exchangeName) =>
      `สำหรับ ${exchangeName} ควรตรวจสอบเว็บไซต์ทางการ แอป การยืนยันตัวตน และสิทธิ์ใช้สินค้าที่ต้องการเป็นชุดเดียวกัน`,
    feesBaseTitle: (exchangeName) => `ควรอ่านค่าธรรมเนียมพื้นฐานของ ${exchangeName} อย่างไร`,
    feesImpactTitle: "รีเบตเปลี่ยนต้นทุนจริงอย่างไร",
    feesImpactBody:
      "มูลค่าของรีเบตจะชัดเมื่อคุณมีการเทรดต่อเนื่อง ถ้าเทรดไม่บ่อย ควรดูค่าธรรมเนียมพื้นฐานและความเหมาะสมของแพลตฟอร์มก่อน",
    compareTitle: (peerA, peerB) => `เมื่อไรควรดู ${peerA} หรือ ${peerB}`,
    compareBody: (exchangeName, peerA, peerB) =>
      `วิธีที่ถูกต้องในการประเมิน ${exchangeName} คือวางเทียบกับ ${peerA} และ ${peerB} ไม่ใช่ตัดสินจากตัวเลขรีเบตอย่างเดียว`,
    compareBullets: (peerA, peerB) => [
      `${peerA} เหมาะเป็นตัวเทียบหลักในสายเมนสตรีม`,
      `${peerB} เหมาะสำหรับเทียบสไตล์การเทรดและความชอบด้านสินค้า`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} อาจช่วยลดเพิ่มได้ราว ${discount}`,
    tokenDiscountNo: "ไม่มีส่วนลดจากโทเคนแพลตฟอร์มที่ชัดเจนให้ทบเพิ่ม",
    ctaReferral: (exchangeName) => `เปิดทางสมัครรีเบตทางการของ ${exchangeName}`,
    ctaSignup: (exchangeName) => `เริ่มสมัคร ${exchangeName} ผ่านลิงก์ทางการ`,
    ctaFees: (exchangeName) => `ดูค่าธรรมเนียมและรีเบตของ ${exchangeName}`,
    ctaReferralHelper: "ก่อนสมัครให้ตรวจโค้ด เว็บไซต์ทางการ และความเหมาะสมตามภูมิภาคอีกครั้ง",
    ctaSignupHelper: "เช็กเว็บไซต์ทางการ แอป และ KYC ก่อนตัดสินใจสมัคร",
    ctaFeesHelper: "เหมาะสำหรับใช้ก่อนเทรดระยะยาว หากต้องการเทียบต้นทุนจริง",
    howToSteps: (exchangeName) => [
      `เริ่มจากลิงก์รีเบตทางการของ ${exchangeName} ไม่ใช่หน้าโฮมทั่วไป`,
      "ตรวจสอบว่าเว็บไซต์หรือเส้นทางแอปถูกต้องก่อนสร้างบัญชี",
      "ทำ KYC และตั้งค่าความปลอดภัยพื้นฐานให้เสร็จ จากนั้นเช็กสิทธิ์ใช้สินค้าที่ต้องการ",
      "ก่อนฝากครั้งแรก ให้ยืนยันโค้ด สถานะรีเบต และโครงสร้างค่าธรรมเนียมอีกครั้ง",
    ],
  },
  hi: {
    factLabels: {
      rebate: "रिबेट",
      inviteCode: "रेफरल कोड",
      spotBaseFees: "स्पॉट बेस फीस",
      futuresBaseFees: "फ्यूचर्स बेस फीस",
      kyc: "KYC",
      settlement: "सेटलमेंट",
      comparedWith: "अक्सर तुलना",
      lastReviewed: "आखिरी समीक्षा",
    },
    kycLabels: { required: "अनिवार्य", optional: "वैकल्पिक", none: "ज़रूरी नहीं" },
    settlementLabels: { daily: "दैनिक", instant: "तुरंत" },
    primaryQueries: {
      "referral-code": (exchangeName) => `${exchangeName} रेफरल कोड`,
      "signup-kyc": (exchangeName) => `${exchangeName} साइनअप KYC`,
      "fees-rebate": (exchangeName) => `${exchangeName} फीस रिबेट तुलना`,
    },
    secondaryQueries: {
      "referral-code": (exchangeName, peers) => [
        `${exchangeName} रेफरल कोड कैसे लगाएँ`,
        `${exchangeName} ऑफिशियल साइट रजिस्ट्रेशन`,
        `${exchangeName} ${peers[0]} ${peers[1]} तुलना`,
      ],
      "signup-kyc": (exchangeName) => [
        `${exchangeName} ऐप डाउनलोड`,
        `${exchangeName} KYC जरूरी है`,
        `${exchangeName} कैसे साइनअप करें`,
      ],
      "fees-rebate": (exchangeName, peers) => [
        `${exchangeName} स्पॉट फीस`,
        `${exchangeName} फ्यूचर्स फीस`,
        `${exchangeName} ${peers[0]} ${peers[1]} फीस तुलना`,
      ],
    },
    referralHeroDescription: (exchangeName, peers) =>
      `यह पेज ${exchangeName} का मौजूदा रेफरल कोड, आधिकारिक साइनअप रास्ता, रिबेट एक्टिवेशन लॉजिक और ${peers[0]} व ${peers[1]} के साथ तुलना को एक जगह देता है।`,
    signupHeroDescription: (exchangeName, peers) =>
      `${exchangeName} पर साइनअप करने से पहले ऑफिशियल साइट, ऐप रूट, KYC और रिबेट लिंकिंग को जाँचें, फिर ${peers[0]} और ${peers[1]} से तुलना करें।`,
    feesHeroDescription: (exchangeName, peers) =>
      `${exchangeName} की स्पॉट/फ्यूचर्स फीस, प्लेटफॉर्म टोकन डिस्काउंट और रिबेट के बाद वास्तविक लागत को ${peers[0]} और ${peers[1]} के मुकाबले देखें।`,
    currentInviteCode: (code) => `मौजूदा कोड: ${code}`,
    currentRebate: (spot, futures) => `मौजूदा रिबेट: स्पॉट ${spot} / फ्यूचर्स ${futures}`,
    autoActivateYes: "सही लिंक से शुरू करने पर रेफरल संबंध आमतौर पर बना रहता है।",
    autoActivateNo: "इसे ऑटोमैटिक मत मानिए। पहले डिपॉज़िट से पहले फिर से जाँचें।",
    referralWorthTitle: (exchangeName) => `क्या ${exchangeName} का रेफरल रास्ता पहले देखना चाहिए?`,
    referralFailureTitle: "रेफरल रास्ता किन वजहों से टूटता है",
    referralFailureBody: "ज्यादातर समस्याएँ कोड गायब होने से नहीं, बल्कि गलत साइनअप रूट, गलत क्रम या क्षेत्र/प्रोडक्ट की शर्तें न देखने से होती हैं।",
    referralRiskBullets: [
      "ऑफिशियल रेफरल लिंक के बाहर से साइनअप करना",
      "पहले अकाउंट बनाना और बाद में कोड जोड़ने की कोशिश करना",
      "क्षेत्र और प्रोडक्ट एक्सेस की जाँच न करना",
    ],
    signupIntroTitle: (exchangeName) => `${exchangeName} की ऑफिशियल साइट, ऐप और साइनअप फ्लो`,
    signupKycTitle: "KYC, रीजन और रिबेट एक्टिवेशन को साथ में कैसे देखें",
    signupKycBody: (exchangeName) =>
      `${exchangeName} के लिए ऑफिशियल साइट, ऐप, पहचान सत्यापन और जिन प्रोडक्ट्स को आप इस्तेमाल करना चाहते हैं, उन्हें एक साथ देखना चाहिए।`,
    feesBaseTitle: (exchangeName) => `${exchangeName} की बेस फीस को कैसे पढ़ें`,
    feesImpactTitle: "रिबेट आपकी असली लागत को कैसे बदलता है",
    feesImpactBody:
      "रिबेट की असली वैल्यू तभी बनती है जब आप लगातार ट्रेड करते हैं। कम आवृत्ति वाले उपयोगकर्ता पहले बेस फीस और प्लेटफॉर्म फिट देखें।",
    compareTitle: (peerA, peerB) => `कब ${peerA} या ${peerB} को देखना चाहिए`,
    compareBody: (exchangeName, peerA, peerB) =>
      `${exchangeName} का सही मूल्यांकन तब होता है जब इसे ${peerA} और ${peerB} के साथ रखा जाए, सिर्फ रिबेट प्रतिशत देखकर नहीं।`,
    compareBullets: (peerA, peerB) => [
      `${peerA} मेनस्ट्रीम बेंचमार्क तुलना के लिए उपयोगी है`,
      `${peerB} ट्रेडिंग स्टाइल और प्रोडक्ट पसंद की तुलना में मदद करता है`,
    ],
    tokenDiscountYes: (token, discount) =>
      `${token} लगभग ${discount} का अतिरिक्त डिस्काउंट जोड़ सकता है`,
    tokenDiscountNo: "स्पष्ट प्लेटफॉर्म टोकन डिस्काउंट यहाँ नहीं है जिसे अलग से जोड़ा जा सके",
    ctaReferral: (exchangeName) => `${exchangeName} का ऑफिशियल रिबेट साइनअप खोलें`,
    ctaSignup: (exchangeName) => `${exchangeName} की ऑफिशियल लिंक से साइनअप शुरू करें`,
    ctaFees: (exchangeName) => `${exchangeName} की फीस और रिबेट देखें`,
    ctaReferralHelper: "साइनअप से पहले कोड, ऑफिशियल साइट और रीजन फिट को फिर से जाँचें।",
    ctaSignupHelper: "ऑफिशियल साइट, ऐप और KYC देखने के बाद ही साइनअप का फैसला लें।",
    ctaFeesHelper: "अगर आप लंबी अवधि के लिए ट्रेड करेंगे तो यह वास्तविक लागत तुलना के लिए सही प्रवेश है।",
    howToSteps: (exchangeName) => [
      `${exchangeName} की ऑफिशियल रिबेट लिंक से शुरू करें, सामान्य होमपेज से नहीं।`,
      "अकाउंट बनाने से पहले यह जाँचें कि वेबसाइट या ऐप का रास्ता सही है।",
      "KYC और बेसिक सिक्योरिटी सेटअप पूरा करें, फिर अपने ज़रूरी प्रोडक्ट का एक्सेस देखें।",
      "पहले डिपॉज़िट से पहले कोड, रिबेट स्टेटस और फीस स्ट्रक्चर फिर से कन्फर्म करें।",
    ],
  },
};

const SEO_KEYWORD_ALIASES: Partial<
  Record<SeoContentLocale, Partial<Record<ExchangeSlug, string[]>>>
> = {
  zh: {
    binance: ["币安", "安币", "毕安", "比安", "必安", "bnb", "币安官网", "币安app下载"],
    okx: ["欧易", "OKX", "欧易官网", "欧易app下载"],
    bybit: ["Bybit", "Bybit官网", "Bybit下载", "Bybit注册"],
    bitget: ["Bitget", "Bitget官网", "Bitget下载", "Bitget返佣"],
    gate: ["Gate", "Gate.io", "芝麻开门", "Gate官网", "Gate下载"],
    kucoin: ["KuCoin", "KuCoin官网", "KuCoin下载", "KuCoin邀请码"],
    huobi: ["火币", "HTX", "Huobi", "火币官网", "火币下载"],
  },
  "zh-tw": {
    binance: ["幣安", "幣安官網", "幣安下載", "BNB"],
    okx: ["歐易", "OKX", "歐易官網", "歐易下載"],
    bybit: ["Bybit", "Bybit 官網", "Bybit 下載", "Bybit 註冊"],
    bitget: ["Bitget", "Bitget 官網", "Bitget 下載", "Bitget 返佣"],
    gate: ["Gate", "Gate.io", "芝麻開門", "Gate 官網", "Gate 下載"],
    kucoin: ["KuCoin", "KuCoin 官網", "KuCoin 下載", "KuCoin 邀請碼"],
    huobi: ["火幣", "HTX", "Huobi", "火幣官網", "火幣下載"],
  },
  ja: {
    binance: ["Binance", "バイナンス", "バイナンス 公式", "バイナンス アプリ", "BNB", "バイナンス 登録"],
    okx: ["OKX", "オーケーエックス", "OKX 公式", "OKX アプリ", "OKX 登録"],
    bybit: ["Bybit", "バイビット", "Bybit 公式", "Bybit アプリ", "Bybit 登録"],
    bitget: ["Bitget", "ビットゲット", "Bitget 公式", "Bitget アプリ", "Bitget 手数料"],
    gate: ["Gate", "Gate.io", "ゲート", "Gate.io 公式", "Gate.io アプリ", "Gate.io 登録"],
    kucoin: ["KuCoin", "クーコイン", "KuCoin 公式", "KuCoin アプリ", "KuCoin 招待コード"],
    huobi: ["HTX", "Huobi", "フォビ", "HTX 公式", "HTX アプリ", "Huobi 登録"],
  },
  ko: {
    binance: ["Binance", "바이낸스", "바이낸스 공식", "바이낸스 앱", "BNB", "바이낸스 가입"],
    okx: ["OKX", "오케이엑스", "OKX 공식", "OKX 앱", "OKX 가입"],
    bybit: ["Bybit", "바이비트", "Bybit 공식", "Bybit 앱", "Bybit 가입"],
    bitget: ["Bitget", "비트겟", "Bitget 공식", "Bitget 앱", "Bitget 수수료"],
    gate: ["Gate", "Gate.io", "게이트", "Gate.io 공식", "Gate.io 앱", "Gate.io 가입"],
    kucoin: ["KuCoin", "쿠코인", "KuCoin 공식", "KuCoin 앱", "KuCoin 추천코드"],
    huobi: ["HTX", "Huobi", "후오비", "HTX 공식", "HTX 앱", "Huobi 가입"],
  },
  ru: {
    binance: ["Binance", "Бинанс", "Binance официальный сайт", "Binance приложение", "BNB"],
    okx: ["OKX", "ОКХ", "OKX официальный сайт", "OKX приложение", "OKX регистрация"],
    bybit: ["Bybit", "Байбит", "Bybit официальный сайт", "Bybit приложение", "Bybit регистрация"],
    bitget: ["Bitget", "Битгет", "Bitget официальный сайт", "Bitget приложение", "Bitget комиссии"],
    gate: ["Gate", "Gate.io", "Гейт", "Gate.io официальный сайт", "Gate.io приложение"],
    kucoin: ["KuCoin", "Кукоин", "KuCoin официальный сайт", "KuCoin приложение", "KuCoin рефкод"],
    huobi: ["HTX", "Huobi", "Хуоби", "HTX официальный сайт", "HTX приложение"],
  },
  es: {
    binance: ["Binance", "Binance oficial", "Binance app", "Binance registro", "BNB"],
    okx: ["OKX", "OKX oficial", "OKX app", "OKX registro"],
    bybit: ["Bybit", "Bybit oficial", "Bybit app", "Bybit registro"],
    bitget: ["Bitget", "Bitget oficial", "Bitget app", "Bitget comisiones"],
    gate: ["Gate", "Gate.io", "Gate.io oficial", "Gate.io app", "Gate.io registro"],
    kucoin: ["KuCoin", "KuCoin oficial", "KuCoin app", "KuCoin código"],
    huobi: ["HTX", "Huobi", "HTX oficial", "HTX app", "Huobi registro"],
  },
  pt: {
    binance: ["Binance", "Binance oficial", "Binance app", "Binance cadastro", "BNB"],
    okx: ["OKX", "OKX oficial", "OKX app", "OKX cadastro"],
    bybit: ["Bybit", "Bybit oficial", "Bybit app", "Bybit cadastro"],
    bitget: ["Bitget", "Bitget oficial", "Bitget app", "Bitget taxas"],
    gate: ["Gate", "Gate.io", "Gate.io oficial", "Gate.io app", "Gate.io cadastro"],
    kucoin: ["KuCoin", "KuCoin oficial", "KuCoin app", "KuCoin código"],
    huobi: ["HTX", "Huobi", "HTX oficial", "HTX app", "Huobi cadastro"],
  },
};

const SEO_NOTES: Record<ExchangeSlug, ExchangeSeoNotes> = {
  binance: {
    comparisonPeers: ["okx", "bybit"],
    en: {
      summary:
        "Binance is usually the benchmark choice when you want high liquidity, familiar fee tiers, and a referral flow that most traders already understand.",
      referralAngle:
        "The current Binance campaign is straightforward: use the cryptore code on the official signup flow and the 20% rebate is easier to verify than many rotating bonus pages.",
      referralRisks: [
        "opening the account from a generic homepage instead of the referral URL",
        "creating the account first and trying to add a code later",
        "assuming all regional entities support the same rebate terms",
      ],
      signupFlow:
        "Signup is simple, but Binance tends to ask for full identity verification earlier than smaller exchanges, especially if you want funding, derivatives, or higher transfer limits.",
      kycNote:
        "KYC is required and regional restrictions matter. If your region is restricted or under a local Binance entity, always confirm product access before registering just for the rebate.",
      feesAngle:
        "Base spot fees are standard at 0.10% / 0.10%, while BNB discounts can reduce effective cost further for users who are active enough to keep BNB on hand.",
      comparisonAngle:
        "Compared with OKX and Bybit, Binance usually wins on breadth and liquidity, but not always on the simplest KYC path or the most aggressive campaign copy.",
      goodFor: [
        "users who want the most familiar global venue",
        "spot traders who value liquidity depth more than niche token discovery",
        "traders willing to complete full KYC for long-term use",
      ],
      notIdealFor: [
        "users in restricted regions looking for flexible product access",
        "people who want the lightest onboarding possible",
        "users only chasing the highest headline rebate number",
      ],
      answerHighlight:
        "If you want the safest default among the major exchanges, Binance remains one of the cleanest starting points for a rebate-first signup.",
    },
    zh: {
      summary:
        "如果你想先选一个流动性深、规则成熟、注册链接也相对稳定的大所，Binance 仍然是很多人的默认基准。",
      referralAngle:
        "当前 Binance 的 cryptore 邀请码路径比较直接，20% 返佣口径清晰，通常比临时活动页更容易确认是否带上返佣关系。",
      referralRisks: [
        "从普通官网入口注册，没有走带邀请码的落地链接",
        "先注册账号，之后再尝试补填邀请码",
        "默认不同地区实体的返佣和产品权限完全一致",
      ],
      signupFlow:
        "注册流程本身不复杂，但 Binance 往往会更早要求完整身份验证，尤其是你要充值、开合约或提高额度时。",
      kycNote:
        "KYC 为必做项，且地区限制要单独确认。如果你所在地区产品权限受限，不要只看返佣比例就直接注册。",
      feesAngle:
        "现货基础费率 0.10% / 0.10%，如果你本来就愿意持有 BNB，叠加平台币折扣后的有效成本会更低。",
      comparisonAngle:
        "和 OKX、Bybit 相比，Binance 通常赢在深度、品牌和产品完整度，但未必是 KYC 最轻或活动文案最激进的选择。",
      goodFor: [
        "想先用主流大所作为长期主账户的人",
        "更看重成交深度和稳定性，而不是只看返佣百分比的人",
        "愿意完成完整 KYC 的现货或合约交易者",
      ],
      notIdealFor: [
        "所在地区限制较多、希望产品权限更灵活的用户",
        "只想用最轻量注册路径快速开小号的人",
        "只追求最高名义返佣数字的人",
      ],
      answerHighlight:
        "如果你要的是“主流、稳定、长期可用”的返佣入口，Binance 依然是最容易先纳入比较清单的一家。",
    },
  },
  okx: {
    comparisonPeers: ["binance", "bybit"],
    en: {
      summary:
        "OKX is usually the choice for traders who want a mainstream exchange with solid derivatives, a strong Web3 product layer, and a cleaner professional feel than many bonus-heavy pages.",
      referralAngle:
        "The current cryptore path is simple: the rebate is easier to treat as a cost-reduction decision than as a one-off signup promotion, which fits OKX better than hype-driven bonus framing.",
      referralRisks: [
        "assuming wallet campaigns and exchange signup offers are the same thing",
        "registering through a generic landing page and missing the referral chain",
        "ignoring local product restrictions for derivatives and Earn products",
      ],
      signupFlow:
        "OKX signup is usually smooth, but it becomes more document-heavy once you want broader account permissions, derivatives access, or larger funding flows.",
      kycNote:
        "KYC is required, but the process tends to feel structured rather than confusing. The bigger risk is regional product availability, not form complexity alone.",
      feesAngle:
        "OKX base fees are competitive for a major venue, and OKB discounts can matter if you already intend to keep balances on-platform.",
      comparisonAngle:
        "Against Binance and Bybit, OKX often sits in the middle: more institutional than Bybit in feel, less default-global than Binance, and attractive if you value exchange plus wallet under one brand.",
      goodFor: [
        "derivatives users who also care about on-platform tools and wallet adjacency",
        "traders who want a major exchange without overly promotional signup pages",
        "users comparing fee discipline, not just rebate headlines",
      ],
      notIdealFor: [
        "users who need the broadest possible global liquidity benchmark",
        "traders who want the most aggressive marketing-style rebate campaigns",
        "people who dislike verifying regional product access in advance",
      ],
      answerHighlight:
        "OKX makes the most sense when you want a serious trading venue and the rebate is part of the cost structure, not the whole story.",
    },
    zh: {
      summary:
        "OKX 更适合把返佣当作成本优化工具，而不是把它看成一次性羊毛的人。",
      referralAngle:
        "当前 cryptore 邀请路径比较清晰，20% 返佣更像是长期费率优化，而不是那种短期冲量活动页面。",
      referralRisks: [
        "把钱包活动和交易所注册返佣混为一谈",
        "从普通活动页进入，遗漏邀请码关系",
        "没有先确认所在地区的合约或 Earn 权限",
      ],
      signupFlow:
        "OKX 注册通常比较顺，但只要你要更完整的账户权限、合约能力或更大额资金流，就会进入更正式的验证路径。",
      kycNote:
        "KYC 是必须的，不过整体流程通常比“复杂”更像“规范”。真正要先确认的是地区功能是否可用。",
      feesAngle:
        "OKX 的基础费率在主流大所里有竞争力，如果你本来就愿意持有 OKB，实际成本还能再往下压。",
      comparisonAngle:
        "和 Binance、Bybit 相比，OKX 往往处在中间位置：专业感强于 Bybit，全球默认认知不如 Binance，但对“交易+钱包”一体化用户更有吸引力。",
      goodFor: [
        "想把返佣、费率和工具体验一起比较的人",
        "重视合约、专业交易和 Web3 钱包联动的人",
        "不喜欢过度营销注册页的用户",
      ],
      notIdealFor: [
        "只想找最主流默认选项、不想多做比较的人",
        "追求活动感最强、宣传最猛返佣页的人",
        "不愿提前确认地区权限的用户",
      ],
      answerHighlight:
        "如果你关心的是长期成本和专业交易体验，OKX 的返佣入口往往比“短期活动页”更值得先看。",
    },
  },
  bybit: {
    comparisonPeers: ["binance", "okx"],
    en: {
      summary:
        "Bybit stands out when you want derivatives-first positioning, faster product iteration, and a referral path that still feels meaningful for active traders.",
      referralAngle:
        "The current CRYPTOREBA partner link is one of the stronger headline offers in this set, but it makes the most sense if you genuinely plan to trade rather than simply chase a signup number.",
      referralRisks: [
        "treating the 33% number as universal without checking product scope",
        "opening a normal account first and later trying to retrofit the referral",
        "ignoring regional limitations for derivatives access",
      ],
      signupFlow:
        "Bybit signup is usually quick, and the interface is friendly, but users planning to scale into derivatives still need to handle KYC properly before expecting the full account experience.",
      kycNote:
        "KYC is required, yet the flow tends to feel lighter than Binance for many users. The bigger gating factor is where you live and which products are allowed there.",
      feesAngle:
        "Base costs are competitive for active derivatives use. The rebate matters most when turnover is high enough for fee savings to compound.",
      comparisonAngle:
        "Compared with Binance and OKX, Bybit often feels faster and more campaign-driven. That can be a plus for active traders, but less appealing if you prefer the most conservative default venue.",
      goodFor: [
        "active derivatives traders",
        "users who want strong headline rebate value with a credible major venue",
        "traders who like faster product listing cycles and copy-trading features",
      ],
      notIdealFor: [
        "users who only want the most conservative, most globally familiar exchange",
        "people who rarely trade and will not realize much fee savings",
        "users in regions with restrictive derivatives rules",
      ],
      answerHighlight:
        "Bybit is strongest when you are actually going to trade enough for the rebate and fee difference to matter, especially on derivatives.",
    },
    zh: {
      summary:
        "如果你更偏合约、交易频次更高，Bybit 往往比“泛用型大所”更值得优先比较。",
      referralAngle:
        "当前 CRYPTOREBA 合作链接的名义返佣在这 7 家里比较有竞争力，但前提是你确实会持续交易，而不是只看注册时的数字。",
      referralRisks: [
        "把 33% 当成所有产品、所有场景都一样生效",
        "先正常注册，再回头补邀请码",
        "忽略所在地对合约产品的限制",
      ],
      signupFlow:
        "Bybit 注册流程通常较快，界面也更容易上手；但如果你准备长期做合约，KYC 仍然要按规则完成，不能只看开户链接。",
      kycNote:
        "KYC 为必须项，但很多用户体感会比 Binance 更轻一些。真正影响体验的，往往是你所在地区能否开通目标产品。",
      feesAngle:
        "对于高频或合约用户，Bybit 的基础成本和返佣更容易拉开实际差距；交易量越高，返佣价值越明显。",
      comparisonAngle:
        "和 Binance、OKX 相比，Bybit 更像是“交易导向、节奏更快”的选择。优点是活动感和执行效率强，代价是稳健感不如最保守的大所路线。",
      goodFor: [
        "高频合约用户",
        "希望返佣比例和交易体验同时在线的人",
        "喜欢上新速度快、跟单工具成熟的平台用户",
      ],
      notIdealFor: [
        "更想选最稳妥、最保守默认选项的人",
        "交易频次很低、返佣价值发挥不出来的人",
        "地区对衍生品权限限制较强的用户",
      ],
      answerHighlight:
        "如果你本来就会高频做单，Bybit 的返佣和费率优势比很多“注册福利页”更有实际意义。",
    },
  },
  bitget: {
    comparisonPeers: ["bybit", "binance"],
    en: {
      summary:
        "Bitget is often the practical choice when you want a mainstream exchange with approachable onboarding, copy-trading visibility, and a rebate path that is easy to understand.",
      referralAngle:
        "The current Bitget partner path is not the flashiest offer in the market, but it is simple, official, and easier to explain to newer users who care about predictable activation.",
      referralRisks: [
        "focusing only on the rebate rate and not on the product set you actually need",
        "missing the partner URL during signup",
        "assuming copy trading access removes the need for full KYC",
      ],
      signupFlow:
        "Bitget signup tends to be approachable for new users, with less friction in the interface than some larger exchanges. That does not remove the need to verify identity for sustained usage.",
      kycNote:
        "KYC is required, but the flow is generally manageable. The bigger decision is whether you value Bitget’s product mix enough to make it your primary venue.",
      feesAngle:
        "Base fees are standard rather than ultra-low, so the rebate matters mainly if Bitget’s copy trading and beginner-friendly flows are already attractive to you.",
      comparisonAngle:
        "Against Bybit and Binance, Bitget usually wins on approachable positioning and copy-trading familiarity, not on being the universal first-choice for every serious trader.",
      goodFor: [
        "newer traders who want a simpler first exchange",
        "users exploring copy trading and community-led flows",
        "traders who value straightforward signup copy over complex campaign stacks",
      ],
      notIdealFor: [
        "users seeking the deepest liquidity benchmark",
        "traders who want the highest headline rebate alone",
        "users looking for the strongest options or advanced product depth",
      ],
      answerHighlight:
        "Bitget is usually worth shortlisting when simplicity and copy-trading relevance matter as much as the raw rebate headline.",
    },
    zh: {
      summary:
        "Bitget 更像是一家“好上手、路径清楚、适合先入门再升级”的主流平台。",
      referralAngle:
        "当前 Bitget 的合作入口不算最夸张，但胜在官方、清楚、容易理解，尤其适合不想被复杂活动页绕晕的新用户。",
      referralRisks: [
        "只看返佣比例，不看自己到底需不需要它的产品组合",
        "注册时没有走 partner 链接",
        "误以为能跟单就不需要完整 KYC",
      ],
      signupFlow:
        "Bitget 的注册界面和流程对新手比较友好，但如果你准备长期使用，身份验证还是要老老实实做完。",
      kycNote:
        "KYC 是必须的，不过整体流程可控。真正需要想清楚的是，你是否真的需要 Bitget 这套产品和生态。",
      feesAngle:
        "Bitget 的基础费率属于主流水平，并非极低费平台，所以返佣价值通常要结合它的新手体验和跟单能力一起看。",
      comparisonAngle:
        "和 Bybit、Binance 相比，Bitget 的优势更多在好上手和跟单认知，而不是成为所有重度交易者的通用第一选择。",
      goodFor: [
        "刚开始接触交易、想先找易用平台的人",
        "对跟单或社区交易感兴趣的人",
        "更看重注册清晰度，而不是花哨活动页的人",
      ],
      notIdealFor: [
        "只想选流动性最深的大所的人",
        "只盯着最高返佣数字的人",
        "需要更强期权或更深专业产品线的用户",
      ],
      answerHighlight:
        "如果你更重视易上手和流程清晰，Bitget 往往比“返佣最高”这类单一指标更值得参考。",
    },
  },
  gate: {
    comparisonPeers: ["kucoin", "binance"],
    en: {
      summary:
        "Gate.io is usually shortlisted by users who care about token breadth first and are willing to accept a more operational signup path in exchange for that access.",
      referralAngle:
        "The current Gate.io code is only worth using if you already know you want Gate’s long-tail market access. The rebate itself is not the whole argument here.",
      referralRisks: [
        "ignoring the fact that KYC is required before treating it as a quick backup account",
        "assuming all long-tail token venues offer the same fee behavior",
        "choosing Gate only for the code without needing its token breadth",
      ],
      signupFlow:
        "Signup is not especially hard, but it is less “default global mainstream” than Binance or OKX. Users should expect to verify identity and confirm product access before moving funds in size.",
      kycNote:
        "KYC is required. That matters because many users still think of Gate as a flexible token-access venue first, when in practice compliance and account setup still need to be handled carefully.",
      feesAngle:
        "Base fees are standard on spot and competitive on futures for a venue with very broad listings. GT discounts can help if you already intend to stay active on the platform.",
      comparisonAngle:
        "Compared with KuCoin and Binance, Gate is less about being the safest default and more about getting access to a larger token universe without giving up a full trading stack.",
      goodFor: [
        "users who prioritize listed-token breadth",
        "traders looking beyond the biggest mainstream pairs",
        "users willing to complete KYC for access to a broader market menu",
      ],
      notIdealFor: [
        "people expecting a no-friction backup account",
        "users who only trade a few large-cap pairs",
        "traders who want the cleanest mainstream default experience",
      ],
      answerHighlight:
        "Gate.io only makes sense if you value token coverage enough to justify the extra operational caution around signup and KYC.",
    },
    zh: {
      summary:
        "Gate.io 更适合“先看币种覆盖，再看返佣”的用户，而不是把它当成随手开的备用号。",
      referralAngle:
        "当前 Gate.io 邀请码真正有价值的前提，是你本来就想用它的长尾币覆盖；返佣本身不是唯一决策理由。",
      referralRisks: [
        "忽略 Gate 现在 KYC 为必须项，还把它当成轻量备用账户",
        "默认所有长尾币平台的费率和规则都差不多",
        "只因为邀请码就注册，却并不需要它的币种广度",
      ],
      signupFlow:
        "注册本身不算难，但它不是 Binance/OKX 那种“默认主流全球站”的心智，入金和使用前更要先确认账户和产品权限。",
      kycNote:
        "KYC 是必须的。这一点很关键，因为很多人仍然把 Gate 视为“币多、随手开”的平台，但实际合规和账户流程不能省。",
      feesAngle:
        "现货费率属于主流水平，合约费率有竞争力；如果你本来就会长期用 Gate，GT 折扣能进一步降低有效成本。",
      comparisonAngle:
        "和 KuCoin、Binance 相比，Gate 更像是为了更广的币种宇宙而选，而不是为了最稳妥的大所默认路线。",
      goodFor: [
        "非常重视币种覆盖和上新广度的人",
        "愿意为更广交易菜单完成 KYC 的用户",
        "不仅交易主流币，也关注更多中小币对的人",
      ],
      notIdealFor: [
        "想零门槛快速开一个备用号的人",
        "只交易少数头部币种的人",
        "更偏好最主流、最保守默认体验的用户",
      ],
      answerHighlight:
        "如果你真正在意的是“可交易币种更多”，Gate.io 的邀请码和返佣才值得进入你的比较清单。",
    },
  },
  kucoin: {
    comparisonPeers: ["gate", "binance"],
    en: {
      summary:
        "KuCoin is the most obvious high-rebate outlier in this set, but the right decision is not just about the 60% headline. It is about whether KuCoin’s market coverage and workflow fit you.",
      referralAngle:
        "The current cryptore code is unusually strong on headline rebate. That makes KuCoin attractive immediately, but it should still be judged with account setup, liquidity, and product priorities in mind.",
      referralRisks: [
        "joining only for the 60% number and ignoring whether KuCoin fits your trading style",
        "assuming the rebate overrides all other fee and execution considerations",
        "skipping a review of regional and compliance limitations",
      ],
      signupFlow:
        "KuCoin signup is approachable, but it is no longer the kind of venue you should treat as a no-rules side account. Plan around identity verification and feature gating from the start.",
      kycNote:
        "KYC is required. That matters because KuCoin still attracts users who remember a more flexible era, while the current operating reality is more structured.",
      feesAngle:
        "Base spot fees are standard, and KCS discounts help. The real attraction is the size of the rebate relative to mainstream exchanges, especially if you trade often enough for it to compound.",
      comparisonAngle:
        "Compared with Gate and Binance, KuCoin is the clearest pick when rebate sensitivity is high, but it is not automatically the best if you mostly care about maximum liquidity or the most conservative brand profile.",
      goodFor: [
        "users who care heavily about rebate percentage",
        "traders who want a mix of mainstream and long-tail listings",
        "people willing to review account rules instead of chasing the number blindly",
      ],
      notIdealFor: [
        "users who only want the safest mainstream default exchange",
        "traders who rarely trade and will not realize the rebate advantage",
        "people who assume older KuCoin operating norms still apply unchanged",
      ],
      answerHighlight:
        "KuCoin deserves attention because the rebate is strong, but it only becomes the right choice if the rest of the platform still fits your workflow.",
    },
    zh: {
      summary:
        "KuCoin 在这 7 家里最容易因为 60% 返佣吸引注意，但真正该比较的并不只有这个数字。",
      referralAngle:
        "当前 cryptore 邀请码的名义返佣非常强，这会让 KuCoin 第一眼很有吸引力；但最终仍要回到流动性、产品和账户规则是否适合你。",
      referralRisks: [
        "只因为 60% 就注册，却没有判断 KuCoin 是否符合自己的交易习惯",
        "误以为返佣数字足以覆盖所有费率和执行差异",
        "没有先看地区或合规限制",
      ],
      signupFlow:
        "KuCoin 的注册界面不算难上手，但它已经不适合被当成“完全没门槛的侧号平台”，KYC 和功能权限要从一开始就考虑进去。",
      kycNote:
        "KYC 为必须项。这点很重要，因为不少用户对 KuCoin 还停留在更早期、更灵活的印象，但现在的实际路径已经更规范。",
      feesAngle:
        "基础现货费率属于主流水平，KCS 折扣也能叠加。真正让 KuCoin 值得比较的，是它相对主流大所更高的返佣比例。",
      comparisonAngle:
        "和 Gate、Binance 相比，KuCoin 在“返佣敏感型用户”里更有吸引力；但如果你最看重极致流动性或最稳妥的大所品牌，它不一定自动胜出。",
      goodFor: [
        "对返佣比例非常敏感的用户",
        "既要主流交易，又希望保留更多币种覆盖的人",
        "愿意认真看账户规则，而不是只追数字的人",
      ],
      notIdealFor: [
        "只想要最稳妥主流大所的人",
        "交易频次很低、返佣优势发挥不出来的人",
        "仍然按过去老印象理解 KuCoin 规则的人",
      ],
      answerHighlight:
        "KuCoin 值得优先比较，但前提是你把它当成真实交易平台来评估，而不是只把它当成一个高返佣数字。",
    },
  },
  huobi: {
    comparisonPeers: ["okx", "binance"],
    en: {
      summary:
        "Huobi/HTX can still make sense for traders who already know the brand and want a straightforward mainstream venue, but it is a more selective choice than the largest default exchanges.",
      referralAngle:
        "The current cryptore path is useful because it gives a cleaner, more reviewable entry than searching through shifting campaign pages. The 30% rebate is meaningful, but context matters.",
      referralRisks: [
        "using older Huobi assumptions without checking the current HTX signup path",
        "forgetting to confirm region-specific access and product scope",
        "assuming brand familiarity is enough reason to skip fee comparison",
      ],
      signupFlow:
        "Signup is generally manageable, though users should treat it as a full-account setup rather than a disposable backup. Verification and eligibility checks still matter.",
      kycNote:
        "KYC is required. The practical question is not only how hard the forms are, but whether the platform still fits your region, assets, and preferred product mix.",
      feesAngle:
        "Base spot fees are higher than some peers, so the 30% rebate matters more as a cost offset than as a reason to ignore the underlying fee table.",
      comparisonAngle:
        "Against OKX and Binance, Huobi/HTX is usually a more selective fit. It can work well for users who already want the platform, but it is not always the first mainstream default to compare.",
      goodFor: [
        "users already comfortable with the Huobi/HTX brand",
        "traders who want a mainstream venue but are open to comparing fee structure closely",
        "users who care about a solid rebate without assuming the biggest exchange is always best",
      ],
      notIdealFor: [
        "users who want the deepest-liquidity default immediately",
        "people who ignore base fees and only look at rebate percentage",
        "traders who have not checked regional fit recently",
      ],
      answerHighlight:
        "Huobi/HTX is worth considering when you already have a reason to use it; the rebate helps, but the fee table and regional fit matter more here than the headline alone.",
    },
    zh: {
      summary:
        "Huobi / HTX 仍然可以进入比较清单，但更适合“本来就愿意认真比较它”的用户，而不是无脑默认首选。",
      referralAngle:
        "当前 cryptore 入口的价值在于，它比四处找零散活动页更清楚、也更容易复核。30% 返佣有意义，但必须结合底层费率一起看。",
      referralRisks: [
        "沿用旧的 Huobi 印象，没有确认现在 HTX 的注册路径",
        "忽略地区权限和产品范围的变化",
        "只因为品牌熟悉就跳过费率比较",
      ],
      signupFlow:
        "注册流程整体可控，但不建议把它当成随手开的备用号。身份验证和可用产品范围仍然需要认真确认。",
      kycNote:
        "KYC 是必须项。关键不只是表单难不难，而是它现在是否仍适合你的地区、币种和交易需求。",
      feesAngle:
        "Huobi/HTX 的现货基础费率高于部分竞品，因此 30% 返佣更多是用来抵消成本，而不是让你忽视底层费率本身。",
      comparisonAngle:
        "和 OKX、Binance 相比，Huobi / HTX 更像是“有理由才去选”的平台，而不是所有人都该先开的默认大所。",
      goodFor: [
        "本来就对 Huobi / HTX 有熟悉度的人",
        "愿意把返佣和底层费率一起算清楚的交易者",
        "不把最大平台默认当成唯一答案的人",
      ],
      notIdealFor: [
        "只想立刻选流动性最深默认大所的人",
        "只看返佣比例、不看底层费率的人",
        "最近没有复核地区适配性的用户",
      ],
      answerHighlight:
        "Huobi / HTX 可以比较，但一定要把底层费率、地区适配性和返佣一起看，不能只看 30% 这个数字。",
    },
  },
};

function isPrimarySeoLocale(locale: SeoContentLocale): locale is "en" | "zh" {
  return locale === "en" || locale === "zh";
}

function getLocaleExchangeMessage(
  locale: SeoContentLocale,
  slug: string
): ExchangeMessageEntry {
  const messages = SEO_MESSAGE_SOURCES[locale];
  const entry = messages.exchanges[slug as keyof typeof messages.exchanges];

  return entry as ExchangeMessageEntry;
}

function getLocaleCopy(locale: Exclude<SeoContentLocale, "en" | "zh">) {
  return GENERATED_LOCALE_COPY[locale];
}

function getLocalizedNotes(
  locale: SeoContentLocale,
  exchange: Exchange,
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): ExchangeSeoNotes["en"] | ExchangeSeoNotes["zh"] {
  if (isPrimarySeoLocale(locale)) {
    return SEO_NOTES[exchange.slug][locale];
  }

  const copy = getLocaleCopy(locale);
  const message = getLocaleExchangeMessage(locale, exchange.slug);
  const [peerA, peerB] = comparisonPeers;

  return {
    summary: message.description,
    referralAngle: copy.ctaReferralHelper,
    referralRisks: copy.referralRiskBullets,
    signupFlow: message.tutorial.slice(0, 2).join(" "),
    kycNote: `${copy.signupKycBody(exchange.name)} ${exchange.regionRestrictions.join(", ")}`,
    feesAngle:
      message.faq.find((item) => item.q.toLowerCase().includes(exchange.name.toLowerCase()))
        ?.a ?? message.faq[0]?.a ?? copy.feesImpactBody,
    comparisonAngle: copy.compareBody(
      exchange.name,
      getExchangeName(peerA),
      getExchangeName(peerB)
    ),
    goodFor: message.pros.slice(0, 3),
    notIdealFor: message.cons.slice(0, 3),
    answerHighlight: message.bestFor,
  };
}

function isSupportedSeoLocale(locale: string): locale is SeoContentLocale {
  return SEO_CONTENT_LOCALES.includes(locale as SeoContentLocale);
}

export function isSeoContentLocale(locale: string): locale is SeoContentLocale {
  return isSupportedSeoLocale(locale);
}

export function isExchangeSeoPageType(value: string): value is ExchangeSeoPageType {
  return SEO_PAGE_TYPES.includes(value as ExchangeSeoPageType);
}

export function getExchangeSeoPageLabels(
  locale: SeoContentLocale,
  pageType: ExchangeSeoPageType
) {
  return SEO_PAGE_LABELS[locale][pageType];
}

export function getExchangeSeoClusterLabels(locale: SeoContentLocale) {
  return SEO_CLUSTER_LABELS[locale];
}

export function getExchangeSeoPageHref(
  slug: string,
  pageType: ExchangeSeoPageType
) {
  return `/exchanges/${slug}/${pageType}`;
}

function getExchangeName(slug: string) {
  return getExchangeBySlug(slug)?.name ?? slug;
}

function getOfficialSiteUrl(exchange: Exchange) {
  const url = new URL(exchange.referralLink);
  return `${url.protocol}//${url.host}`;
}

function getOfficialHost(exchange: Exchange) {
  return new URL(getOfficialSiteUrl(exchange)).hostname.replace(/^www\./, "");
}

function formatPercent(value: number, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

function getKycLabel(locale: SeoContentLocale, exchange: Exchange) {
  if (locale === "zh") {
    if (exchange.kyc === "required") return "必须";
    if (exchange.kyc === "optional") return "可选";
    return "无需";
  }

  if (locale === "en") {
    if (exchange.kyc === "required") return "Required";
    if (exchange.kyc === "optional") return "Optional";
    return "Not required";
  }

  const labels = getLocaleCopy(locale).kycLabels;
  if (exchange.kyc === "required") return labels.required;
  if (exchange.kyc === "optional") return labels.optional;
  return labels.none;
}

function getSettlementLabel(locale: SeoContentLocale, exchange: Exchange) {
  if (locale === "zh") {
    return exchange.rebateSettlement === "instant" ? "即时" : "按日";
  }

  if (locale === "en") {
    return exchange.rebateSettlement === "instant" ? "Instant" : "Daily";
  }

  const labels = getLocaleCopy(locale).settlementLabels;
  return exchange.rebateSettlement === "instant" ? labels.instant : labels.daily;
}

function getPageTypePrimaryQuery(
  locale: SeoContentLocale,
  exchange: Exchange,
  pageType: ExchangeSeoPageType
) {
  if (locale === "zh") {
    switch (pageType) {
      case "referral-code":
        return `${exchange.name} 邀请码返佣`;
      case "signup-kyc":
        return `${exchange.name} 注册 KYC`;
      case "fees-rebate":
        return `${exchange.name} 费率返佣对比`;
      case "official-site":
        return `${exchange.name} 官网入口`;
      case "app-download":
        return `${exchange.name} App 下载`;
      case "safety-review":
        return `${exchange.name} 安全正规吗`;
    }
  }

  if (locale === "en") {
    switch (pageType) {
      case "referral-code":
        return `${exchange.name} referral code`;
      case "signup-kyc":
        return `${exchange.name} signup KYC`;
      case "fees-rebate":
        return `${exchange.name} fees rebate comparison`;
      case "official-site":
        return `${exchange.name} official site`;
      case "app-download":
        return `${exchange.name} app download`;
      case "safety-review":
        return `${exchange.name} safety review`;
    }
  }

  const localizedQuery = getLocaleCopy(locale).primaryQueries[pageType];
  if (localizedQuery) {
    return localizedQuery(exchange.name);
  }

  const label = getExchangeSeoPageLabels(locale, pageType);
  return `${exchange.name} ${label.nav}`;
}

function getSecondaryQueries(
  locale: SeoContentLocale,
  exchange: Exchange,
  peers: [ExchangeSlug, ExchangeSlug],
  pageType: ExchangeSeoPageType
) {
  const [peerA, peerB] = peers;
  const peerNames = [getExchangeName(peerA), getExchangeName(peerB)];

  if (locale === "zh") {
    switch (pageType) {
      case "referral-code":
        return [
          `${exchange.name} 邀请码怎么填`,
          `${exchange.name} 返佣什么时候生效`,
          `${exchange.name} 和 ${peerNames[0]} ${peerNames[1]} 哪个更划算`,
        ];
      case "signup-kyc":
        return [
          `${exchange.name} 需要 KYC 吗`,
          `${exchange.name} 注册后返佣自动生效吗`,
          `${exchange.name} 地区限制`,
        ];
      case "fees-rebate":
        return [
          `${exchange.name} 现货手续费`,
          `${exchange.name} 合约手续费`,
          `${exchange.name} 和 ${peerNames[0]} ${peerNames[1]} 费率比较`,
        ];
      case "official-site":
        return [
          `${exchange.name} 官网`,
          `${exchange.name} 官方注册入口`,
          `${exchange.name} 官网是真的吗`,
        ];
      case "app-download":
        return [
          `${exchange.name} app 下载`,
          `${exchange.name} 官方 app`,
          `${exchange.name} 安装包安全吗`,
        ];
      case "safety-review":
        return [
          `${exchange.name} 安全吗`,
          `${exchange.name} 正规吗`,
          `${exchange.name} 靠谱吗`,
        ];
    }
  }

  if (locale === "en") {
    switch (pageType) {
      case "referral-code":
        return [
          `${exchange.name} invite code`,
          `${exchange.name} rebate activation`,
          `${exchange.name} vs ${peerNames[0]} ${peerNames[1]} rebate`,
        ];
      case "signup-kyc":
        return [
          `${exchange.name} KYC required`,
          `${exchange.name} signup steps`,
          `${exchange.name} regional restrictions`,
        ];
      case "fees-rebate":
        return [
          `${exchange.name} spot fees`,
          `${exchange.name} futures fees`,
          `${exchange.name} vs ${peerNames[0]} ${peerNames[1]} fees`,
        ];
      case "official-site":
        return [
          `${exchange.name} official website`,
          `${exchange.name} official signup`,
          `${exchange.name} official domain`,
        ];
      case "app-download":
        return [
          `${exchange.name} app download`,
          `${exchange.name} official app`,
          `${exchange.name} app safe install`,
        ];
      case "safety-review":
        return [
          `${exchange.name} safe or not`,
          `${exchange.name} legitimate exchange`,
          `${exchange.name} risk review`,
        ];
    }
  }

  const localizedQuery = getLocaleCopy(locale).secondaryQueries[pageType];
  if (localizedQuery) {
    return localizedQuery(exchange.name, [peerNames[0], peerNames[1]]);
  }

  const label = getExchangeSeoPageLabels(locale, pageType);
  return [
    `${exchange.name} ${label.short}`,
    `${exchange.name} ${label.nav}`,
    `${exchange.name} ${peerNames[0]} ${peerNames[1]}`,
  ];
}

function buildFactCard(
  locale: SeoContentLocale,
  exchange: Exchange,
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): ExchangeSeoFactItem[] {
  const [peerA, peerB] = comparisonPeers;

  if (locale === "zh") {
    return [
      { label: "返佣比例", value: `${exchange.spotRebate} / ${exchange.futuresRebate}` },
      { label: "邀请码", value: exchange.referralCode },
      { label: "现货基础费率", value: `${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}` },
      { label: "合约基础费率", value: `${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}` },
      { label: "KYC", value: getKycLabel(locale, exchange) },
      { label: "返佣结算", value: getSettlementLabel(locale, exchange) },
      { label: "常见对比", value: `${getExchangeName(peerA)} / ${getExchangeName(peerB)}` },
      { label: "最近复核", value: exchange.lastReviewed },
    ];
  }

  if (locale === "en") {
    return [
      { label: "Rebate", value: `${exchange.spotRebate} / ${exchange.futuresRebate}` },
      { label: "Invite code", value: exchange.referralCode },
      { label: "Spot base fees", value: `${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}` },
      { label: "Futures base fees", value: `${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}` },
      { label: "KYC", value: getKycLabel(locale, exchange) },
      { label: "Settlement", value: getSettlementLabel(locale, exchange) },
      { label: "Compared with", value: `${getExchangeName(peerA)} / ${getExchangeName(peerB)}` },
      { label: "Last reviewed", value: exchange.lastReviewed },
    ];
  }

  const labels = getLocaleCopy(locale).factLabels;
  return [
    { label: labels.rebate, value: `${exchange.spotRebate} / ${exchange.futuresRebate}` },
    { label: labels.inviteCode, value: exchange.referralCode },
    { label: labels.spotBaseFees, value: `${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}` },
    { label: labels.futuresBaseFees, value: `${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}` },
    { label: labels.kyc, value: getKycLabel(locale, exchange) },
    { label: labels.settlement, value: getSettlementLabel(locale, exchange) },
    { label: labels.comparedWith, value: `${getExchangeName(peerA)} / ${getExchangeName(peerB)}` },
    { label: labels.lastReviewed, value: exchange.lastReviewed },
  ];
}

function buildHowToSteps(locale: SeoContentLocale, exchange: Exchange) {
  if (locale === "zh") {
    return [
      `通过 ${exchange.name} 官方返佣链接进入注册页，先不要从普通首页绕路。`,
      "先确认你所在地区是否支持目标产品，再继续完成邮箱或手机号注册。",
      "按页面提示完成身份验证和基础安全设置，避免后续因为权限不足导致返佣路径失效。",
      "首次入金和交易前，再核对邀请码、返佣显示和费率规则是否与当前活动一致。",
    ];
  }

  if (locale === "en") {
    return [
      `Start from the official ${exchange.name} referral link instead of a generic homepage path.`,
      "Confirm that your region supports the product set you want before finishing account creation.",
      "Complete identity verification and basic security setup before expecting full trading permissions.",
      "Before your first deposit or trade, verify that the invite code, rebate path, and fee assumptions still match the current campaign.",
    ];
  }

  const message = getLocaleExchangeMessage(locale, exchange.slug);
  const steps = message.tutorial.slice(0, 4);

  return steps.length > 0 ? steps : getLocaleCopy(locale).howToSteps(exchange.name);
}

function buildMetadataKeywords(
  locale: SeoContentLocale,
  exchange: Exchange,
  pageType: ExchangeSeoPageType,
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
) {
  const aliases =
    SEO_KEYWORD_ALIASES[locale]?.[exchange.slug] ?? [exchange.name];
  const primaryQuery = getPageTypePrimaryQuery(locale, exchange, pageType);
  const secondaryQueries = getSecondaryQueries(
    locale,
    exchange,
    comparisonPeers,
    pageType
  );
  const labels = getExchangeSeoPageLabels(locale, pageType);

  return Array.from(
    new Set([
      exchange.name,
      ...aliases,
      primaryQuery,
      ...secondaryQueries,
      labels.short,
      labels.nav,
      exchange.referralCode,
    ])
  );
}

function buildReferralContent(
  locale: SeoContentLocale,
  exchange: Exchange,
  notes: ExchangeSeoNotes["en"] | ExchangeSeoNotes["zh"],
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): Pick<
  ExchangeSeoContentEntry,
  "heroTitle" | "heroDescription" | "answerBox" | "fit" | "sections" | "faq" | "cta"
> {
  const [peerA, peerB] = comparisonPeers;
  const peerNames = [getExchangeName(peerA), getExchangeName(peerB)];

  if (locale === "zh") {
    return {
      heroTitle: `${exchange.name} 邀请码与返佣，注册前先看清楚`,
      heroDescription:
        `${exchange.name} 当前邀请码、返佣口径、常见失效场景，以及它和 ${peerNames[0]}、${peerNames[1]} 相比到底值不值得先注册。`,
      answerBox: {
        title: "如果你只想先拿到结论",
        body: `${notes.answerHighlight} ${notes.referralAngle}`,
        bullets: [
          `当前邀请码：${exchange.referralCode}`,
          `当前返佣：现货 ${exchange.spotRebate} / 合约 ${exchange.futuresRebate}`,
          exchange.rebateAutoActivate
            ? "这家交易所通常是沿正确注册链接注册后自动带上返佣关系。"
            : "这家交易所可能需要额外确认返佣是否已生效，不能默认自动绑定。",
        ],
      },
      fit: {
        title: "适合谁，不适合谁",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `${exchange.name} 现在有值得用的邀请码吗？`,
          body: notes.summary,
          bullets: [
            `官方注册链接已指向当前邀请码 ${exchange.referralCode}`,
            `${exchange.spotRebate} 的返佣更适合有长期交易计划的用户`,
            `${exchange.name} 的返佣更应该被当成长期费率优化，而不是一次性注册奖励`,
          ],
        },
        {
          title: "邀请码最常见的失效场景是什么？",
          body: "大部分失效都不是“活动突然消失”，而是注册路径走错、先注册后补码，或地区和产品权限判断错误。",
          bullets: notes.referralRisks,
        },
        {
          title: `它和 ${peerNames[0]}、${peerNames[1]} 相比更适合谁？`,
          body: notes.comparisonAngle,
          bullets: [
            `如果你要的是最稳妥默认路线，可以同时比较 ${peerNames[0]}`,
            `如果你更看重活动力度或交易风格，也应一起比较 ${peerNames[1]}`,
          ],
        },
      ],
      faq: [
        {
          q: `${exchange.name} 现在的邀请码是什么？`,
          a: `当前整理到的邀请码是 ${exchange.referralCode}，对应返佣口径为现货 ${exchange.spotRebate}、合约 ${exchange.futuresRebate}。注册前仍建议再次确认官方页面显示。`,
        },
        {
          q: `${exchange.name} 邀请码为什么会不生效？`,
          a: `最常见原因是没有从带码链接进入、账号先注册后补码，或所在地区和目标产品不支持当前返佣路径。`,
        },
        {
          q: `${exchange.name} 邀请码和 ${peerNames[0]}、${peerNames[1]} 比，谁更值得先看？`,
          a: `${notes.comparisonAngle} 所以正确顺序不是只盯邀请码，而是把返佣、费率、KYC 和你的交易目标一起比。`,
        },
      ],
      cta: {
        label: `查看 ${exchange.name} 官方返佣入口`,
        helperText: "注册前再次确认邀请码、地区适配性与最新费率规则。",
      },
    };
  }

  if (locale !== "en") {
    const copy = getLocaleCopy(locale);
    const message = getLocaleExchangeMessage(locale, exchange.slug);
    const pageLabels = getExchangeSeoPageLabels(locale, "referral-code");
    const clusterLabels = getExchangeSeoClusterLabels(locale);

    return {
      heroTitle: `${exchange.name} ${pageLabels.nav}`,
      heroDescription: copy.referralHeroDescription(exchange.name, [
        peerNames[0],
        peerNames[1],
      ]),
      answerBox: {
        title: clusterLabels.answerTitle,
        body: `${message.bestFor} ${notes.referralAngle}`,
        bullets: [
          copy.currentInviteCode(exchange.referralCode),
          copy.currentRebate(exchange.spotRebate, exchange.futuresRebate),
          exchange.rebateAutoActivate ? copy.autoActivateYes : copy.autoActivateNo,
        ],
      },
      fit: {
        title: clusterLabels.fitTitle,
        goodFor: message.pros.slice(0, 3),
        notIdealFor: message.cons.slice(0, 3),
      },
      sections: [
        {
          title: copy.referralWorthTitle(exchange.name),
          body: message.description,
          bullets: [
            copy.currentInviteCode(exchange.referralCode),
            copy.currentRebate(exchange.spotRebate, exchange.futuresRebate),
            message.bestFor,
          ],
        },
        {
          title: copy.referralFailureTitle,
          body: copy.referralFailureBody,
          bullets: copy.referralRiskBullets,
        },
        {
          title: copy.compareTitle(peerNames[0], peerNames[1]),
          body: notes.comparisonAngle,
          bullets: copy.compareBullets(peerNames[0], peerNames[1]),
        },
      ],
      faq: message.faq.slice(0, 3),
      cta: {
        label: copy.ctaReferral(exchange.name),
        helperText: copy.ctaReferralHelper,
      },
    };
  }

  return {
    heroTitle: `${exchange.name} referral code and rebate: what matters before signup`,
    heroDescription:
      `Use this page to check the current ${exchange.name} invite code, rebate scope, activation logic, and how it compares with ${peerNames[0]} and ${peerNames[1]}.`,
    answerBox: {
      title: "If you only need the short answer",
      body: `${notes.answerHighlight} ${notes.referralAngle}`,
      bullets: [
        `Current invite code: ${exchange.referralCode}`,
        `Current rebate: spot ${exchange.spotRebate} / futures ${exchange.futuresRebate}`,
        exchange.rebateAutoActivate
          ? "The rebate is usually easier to preserve when you start from the referral URL and complete signup in one flow."
          : "Do not assume the rebate attaches automatically. Confirm activation before you fund or trade.",
      ],
    },
    fit: {
      title: "Who this path fits",
      goodFor: notes.goodFor,
      notIdealFor: notes.notIdealFor,
    },
    sections: [
      {
        title: `Is the current ${exchange.name} referral code worth using?`,
        body: notes.summary,
        bullets: [
          `The active code is ${exchange.referralCode}`,
          `The current rebate headline is ${exchange.spotRebate} for spot and ${exchange.futuresRebate} for futures`,
          `Treat the code as a trading-cost decision, not just a signup bonus`,
        ],
      },
      {
        title: "How do referral codes fail in practice?",
        body: "Most failures come from the signup path, account timing, or regional/product assumptions, not from the code itself suddenly disappearing.",
        bullets: notes.referralRisks,
      },
      {
        title: `How should you compare it with ${peerNames[0]} and ${peerNames[1]}?`,
        body: notes.comparisonAngle,
        bullets: [
          `Compare against ${peerNames[0]} if you want the closest mainstream alternative`,
          `Compare against ${peerNames[1]} if your trading style is more campaign-sensitive or derivatives-led`,
        ],
      },
    ],
    faq: [
      {
        q: `What is the current ${exchange.name} referral code?`,
        a: `The tracked code is ${exchange.referralCode}, with a current headline rebate of ${exchange.spotRebate} on spot and ${exchange.futuresRebate} on futures. Confirm the official landing page before you submit registration.`,
      },
      {
        q: `Why would a ${exchange.name} referral code fail to apply?`,
        a: "The usual causes are registering outside the referral link, creating the account first and trying to add a code later, or using a regional entity or product that does not follow the same rebate terms.",
      },
      {
        q: `Is ${exchange.name} a better rebate choice than ${peerNames[0]} or ${peerNames[1]}?`,
        a: `${notes.comparisonAngle} The right answer depends on your trading volume, product mix, and tolerance for KYC and regional constraints.`,
      },
    ],
    cta: {
      label: `Open the official ${exchange.name} rebate signup`,
      helperText: "Double-check invite-code visibility, regional fit, and the fee table before you finish registration.",
    },
  };
}

function buildSignupContent(
  locale: SeoContentLocale,
  exchange: Exchange,
  notes: ExchangeSeoNotes["en"] | ExchangeSeoNotes["zh"],
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): Pick<
  ExchangeSeoContentEntry,
  | "heroTitle"
  | "heroDescription"
  | "answerBox"
  | "fit"
  | "sections"
  | "faq"
  | "cta"
  | "howToSteps"
> {
  const [peerA, peerB] = comparisonPeers;
  const peerNames = [getExchangeName(peerA), getExchangeName(peerB)];

  if (locale === "zh") {
    return {
      heroTitle: `${exchange.name} 注册与 KYC：返佣什么时候才算真正生效`,
      heroDescription:
        `如果你准备注册 ${exchange.name}，先确认 KYC、地区限制、返佣自动生效逻辑，以及它和 ${peerNames[0]}、${peerNames[1]} 的差异。`,
      answerBox: {
        title: "如果你只关心答案",
        body: `${notes.signupFlow} ${notes.kycNote}`,
        bullets: [
          `KYC：${getKycLabel(locale, exchange)}`,
          `返佣是否自动生效：${exchange.rebateAutoActivate ? "通常会" : "需要额外确认"}`,
          `返佣结算：${getSettlementLabel(locale, exchange)}`,
        ],
      },
      fit: {
        title: "适合谁，不适合谁",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `${exchange.name} 的注册流程应该先看什么？`,
          body: notes.signupFlow,
          bullets: [
            "先确认走的是官方返佣入口，不要先从普通站点注册",
            "先判断地区限制和目标产品权限，再决定是否继续",
            "注册只是第一步，真正影响使用的是验证、权限和费率规则",
          ],
        },
        {
          title: "KYC、地区限制和返佣生效有什么关系？",
          body: notes.kycNote,
          bullets: [
            `地区限制：${exchange.regionRestrictions.join("、")}`,
            exchange.rebateAutoActivate
              ? "多数情况下，沿正确链接注册后返佣会自动挂上，但仍建议在首次交易前再核对一次。"
              : "不要默认返佣自动绑定，首次交易前必须主动确认是否已生效。",
            `返佣结算频率：${getSettlementLabel(locale, exchange)}`,
          ],
        },
        {
          title: `什么时候应该改看 ${peerNames[0]} 或 ${peerNames[1]}？`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} 更适合想找更接近主流默认路线的用户`,
            `${peerNames[1]} 更适合交易节奏或产品偏好不同的用户`,
          ],
        },
      ],
      faq: [
        {
          q: `${exchange.name} 一定要做 KYC 吗？`,
          a: `${exchange.name} 当前整理口径是 ${getKycLabel(locale, exchange)}。但比“做不做 KYC”更重要的是，做完后你所在地区是否还能使用目标产品。`,
        },
        {
          q: `${exchange.name} 注册后返佣会自动生效吗？`,
          a: exchange.rebateAutoActivate
            ? "通常只要沿官方邀请码链接完整注册，返佣关系会自动带上。但首次入金和交易前仍建议核对活动页显示。"
            : "不要默认自动生效，最好在注册完成后主动确认返佣是否已绑定。"
        },
        {
          q: `${exchange.name} 的注册/KYC 路径和 ${peerNames[0]}、${peerNames[1]} 比，谁更省事？`,
          a: `${notes.comparisonAngle} 真正的差异往往不在表单多少，而在地区权限、账户能力和你要用的具体产品。`,
        },
      ],
      cta: {
        label: `从 ${exchange.name} 官方链接开始注册`,
        helperText: "先看地区权限与 KYC，再决定是否把它作为主账户。",
      },
      howToSteps: buildHowToSteps(locale, exchange),
    };
  }

  if (locale !== "en") {
    const copy = getLocaleCopy(locale);
    const message = getLocaleExchangeMessage(locale, exchange.slug);
    const pageLabels = getExchangeSeoPageLabels(locale, "signup-kyc");
    const clusterLabels = getExchangeSeoClusterLabels(locale);

    return {
      heroTitle: `${exchange.name} ${pageLabels.nav}`,
      heroDescription: copy.signupHeroDescription(exchange.name, [
        peerNames[0],
        peerNames[1],
      ]),
      answerBox: {
        title: clusterLabels.answerTitle,
        body: `${message.tutorial.slice(0, 2).join(" ")} ${copy.signupKycBody(exchange.name)}`,
        bullets: [
          `${copy.factLabels.kyc}: ${getKycLabel(locale, exchange)}`,
          exchange.rebateAutoActivate ? copy.autoActivateYes : copy.autoActivateNo,
          `${copy.factLabels.settlement}: ${getSettlementLabel(locale, exchange)}`,
        ],
      },
      fit: {
        title: clusterLabels.fitTitle,
        goodFor: message.pros.slice(0, 3),
        notIdealFor: message.cons.slice(0, 3),
      },
      sections: [
        {
          title: copy.signupIntroTitle(exchange.name),
          body: message.tutorial.join(" "),
          bullets: message.tutorial.slice(0, 3),
        },
        {
          title: copy.signupKycTitle,
          body: `${copy.signupKycBody(exchange.name)} ${exchange.regionRestrictions.join(", ")}`,
          bullets: [
            exchange.rebateAutoActivate ? copy.autoActivateYes : copy.autoActivateNo,
            `${copy.factLabels.settlement}: ${getSettlementLabel(locale, exchange)}`,
            message.bestFor,
          ],
        },
        {
          title: copy.compareTitle(peerNames[0], peerNames[1]),
          body: notes.comparisonAngle,
          bullets: copy.compareBullets(peerNames[0], peerNames[1]),
        },
      ],
      faq: message.faq.slice(0, 3),
      cta: {
        label: copy.ctaSignup(exchange.name),
        helperText: copy.ctaSignupHelper,
      },
      howToSteps: buildHowToSteps(locale, exchange),
    };
  }

  return {
    heroTitle: `${exchange.name} signup and KYC: when the rebate actually becomes usable`,
    heroDescription:
      `Before you register on ${exchange.name}, confirm the KYC path, regional restrictions, rebate activation flow, and where ${peerNames[0]} or ${peerNames[1]} may fit better.`,
    answerBox: {
      title: "If you only need the short answer",
      body: `${notes.signupFlow} ${notes.kycNote}`,
      bullets: [
        `KYC: ${getKycLabel(locale, exchange)}`,
        `Rebate activation: ${exchange.rebateAutoActivate ? "usually automatic when signup starts from the referral URL" : "verify manually before funding"}`,
        `Settlement: ${getSettlementLabel(locale, exchange)}`,
      ],
    },
    fit: {
      title: "Who this path fits",
      goodFor: notes.goodFor,
      notIdealFor: notes.notIdealFor,
    },
    sections: [
      {
        title: `What should you check first in the ${exchange.name} signup flow?`,
        body: notes.signupFlow,
        bullets: [
          "Start from the official referral entry, not a generic homepage path",
          "Confirm regional product access before you finish signup",
          "Treat verification, permissions, and fee assumptions as part of signup, not as an afterthought",
        ],
      },
      {
        title: "How do KYC, regional access, and rebate activation connect?",
        body: notes.kycNote,
        bullets: [
          `Common restrictions to review: ${exchange.regionRestrictions.join(", ")}`,
          exchange.rebateAutoActivate
            ? "The referral relationship is usually easier to keep when you complete registration in one session from the referral link."
            : "Do not assume the rebate is attached automatically. Verify it before you deposit or trade.",
          `Settlement cadence: ${getSettlementLabel(locale, exchange)}`,
        ],
      },
      {
        title: `When should you compare ${peerNames[0]} or ${peerNames[1]} instead?`,
        body: notes.comparisonAngle,
        bullets: [
          `${peerNames[0]} is usually the closer mainstream alternative`,
          `${peerNames[1]} may fit better if your trading style or product needs are different`,
        ],
      },
    ],
    faq: [
      {
        q: `Is KYC required on ${exchange.name}?`,
        a: `${exchange.name} currently falls under ${getKycLabel(locale, exchange)} KYC for the tracked signup path. The real question is whether the verified account in your region can access the products you need.`,
      },
      {
        q: `Does the ${exchange.name} rebate activate automatically after signup?`,
        a: exchange.rebateAutoActivate
          ? "Usually yes when you register directly from the referral URL, but you should still verify the referral state before your first deposit or trade."
          : "Do not assume so. Confirm the rebate state before you fund or trade the account."
      },
      {
        q: `Is ${exchange.name} easier to sign up for than ${peerNames[0]} or ${peerNames[1]}?`,
        a: `${notes.comparisonAngle} The biggest practical difference usually comes from regional eligibility and product access, not only the number of form steps.`,
      },
    ],
    cta: {
      label: `Start ${exchange.name} signup from the tracked referral link`,
      helperText: "Verify regional fit and KYC scope before you treat the rebate as confirmed.",
    },
    howToSteps: buildHowToSteps(locale, exchange),
  };
}

function buildFeesContent(
  locale: SeoContentLocale,
  exchange: Exchange,
  notes: ExchangeSeoNotes["en"] | ExchangeSeoNotes["zh"],
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): Pick<
  ExchangeSeoContentEntry,
  "heroTitle" | "heroDescription" | "answerBox" | "fit" | "sections" | "faq" | "cta"
> {
  const [peerA, peerB] = comparisonPeers;
  const peerNames = [getExchangeName(peerA), getExchangeName(peerB)];

  if (locale === "zh") {
    return {
      heroTitle: `${exchange.name} 费率、返佣与真实交易成本怎么一起看`,
      heroDescription:
        `现货费率、合约费率、平台币折扣、返佣比例，以及 ${exchange.name} 与 ${peerNames[0]}、${peerNames[1]} 的真实成本差异。`,
      answerBox: {
        title: "如果你只想先看结论",
        body: `${notes.feesAngle} ${notes.comparisonAngle}`,
        bullets: [
          `现货基础费率：${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
          `合约基础费率：${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
          exchange.fees.tokenName
            ? `${exchange.fees.tokenName} 折扣可叠加，名义折扣约 ${formatPercent(exchange.fees.tokenDiscount ?? 0, 0)}`
            : "没有平台币折扣可叠加，核心还是看基础费率和返佣比例",
        ],
      },
      fit: {
        title: "适合谁，不适合谁",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `${exchange.name} 的基础费率到底贵不贵？`,
          body: notes.feesAngle,
          bullets: [
            `现货 Maker/Taker：${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
            `合约 Maker/Taker：${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
            exchange.fees.tokenName
              ? `${exchange.fees.tokenName} 可用于进一步压低名义费率`
              : "这家平台没有平台币折扣可叠加",
          ],
        },
        {
          title: "返佣会怎样改变你的有效成本？",
          body: "返佣只有在你真的会交易、而且会持续交易时才有意义。低频用户更应该先看底层费率和平台适配性。",
          bullets: [
            `现货返佣：${exchange.spotRebate}`,
            `合约返佣：${exchange.futuresRebate}`,
            `返佣结算：${getSettlementLabel(locale, exchange)}`,
          ],
        },
        {
          title: `${exchange.name} 和 ${peerNames[0]}、${peerNames[1]} 比，真实成本怎么判断？`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} 适合拿来比较主流路径下的费率与产品完整度`,
            `${peerNames[1]} 更适合拿来比较交易风格、活动力度或细分市场偏好`,
          ],
        },
      ],
      faq: [
        {
          q: `${exchange.name} 的现货和合约基础费率是多少？`,
          a: `当前整理口径为：现货 ${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}，合约 ${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}。`,
        },
        {
          q: `${exchange.name} 的平台币折扣和返佣能一起看吗？`,
          a: exchange.fees.tokenName
            ? `可以先把 ${exchange.fees.tokenName} 折扣视为底层费率优化，再把返佣视为后续返还。真正要比较的是你是否愿意长期持有平台币，以及交易量是否足够。`
            : "这家平台没有明确的平台币费率折扣可叠加，因此主要比较基础费率、返佣比例和你的实际交易频率。"
        },
        {
          q: `${exchange.name} 和 ${peerNames[0]}、${peerNames[1]} 谁更省？`,
          a: `${notes.comparisonAngle} 正确比较方式不是只看单一费率或返佣，而是把你的产品类型、交易量、KYC 路径和返佣结算规则一起考虑。`,
        },
      ],
      cta: {
        label: `查看 ${exchange.name} 返佣与费率入口`,
        helperText: "适合准备长期交易前，先用真实成本视角做最后一次筛选。",
      },
    };
  }

  if (locale !== "en") {
    const copy = getLocaleCopy(locale);
    const message = getLocaleExchangeMessage(locale, exchange.slug);
    const pageLabels = getExchangeSeoPageLabels(locale, "fees-rebate");
    const clusterLabels = getExchangeSeoClusterLabels(locale);

    return {
      heroTitle: `${exchange.name} ${pageLabels.nav}`,
      heroDescription: copy.feesHeroDescription(exchange.name, [
        peerNames[0],
        peerNames[1],
      ]),
      answerBox: {
        title: clusterLabels.answerTitle,
        body: `${message.faq[0]?.a ?? notes.feesAngle} ${notes.comparisonAngle}`,
        bullets: [
          `${copy.factLabels.spotBaseFees}: ${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
          `${copy.factLabels.futuresBaseFees}: ${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
          exchange.fees.tokenName
            ? copy.tokenDiscountYes(
                exchange.fees.tokenName,
                formatPercent(exchange.fees.tokenDiscount ?? 0, 0)
              )
            : copy.tokenDiscountNo,
        ],
      },
      fit: {
        title: clusterLabels.fitTitle,
        goodFor: message.pros.slice(0, 3),
        notIdealFor: message.cons.slice(0, 3),
      },
      sections: [
        {
          title: copy.feesBaseTitle(exchange.name),
          body: message.faq[0]?.a ?? notes.feesAngle,
          bullets: [
            `${copy.factLabels.spotBaseFees}: ${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
            `${copy.factLabels.futuresBaseFees}: ${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
            exchange.fees.tokenName
              ? copy.tokenDiscountYes(
                  exchange.fees.tokenName,
                  formatPercent(exchange.fees.tokenDiscount ?? 0, 0)
                )
              : copy.tokenDiscountNo,
          ],
        },
        {
          title: copy.feesImpactTitle,
          body: copy.feesImpactBody,
          bullets: [
            copy.currentRebate(exchange.spotRebate, exchange.futuresRebate),
            `${copy.factLabels.settlement}: ${getSettlementLabel(locale, exchange)}`,
            message.bestFor,
          ],
        },
        {
          title: copy.compareTitle(peerNames[0], peerNames[1]),
          body: notes.comparisonAngle,
          bullets: copy.compareBullets(peerNames[0], peerNames[1]),
        },
      ],
      faq: message.faq.slice(0, 3),
      cta: {
        label: copy.ctaFees(exchange.name),
        helperText: copy.ctaFeesHelper,
      },
    };
  }

  return {
    heroTitle: `${exchange.name} fees, rebate, and effective trading cost`,
    heroDescription:
      `Review spot fees, futures fees, token discounts, rebate scope, and how ${exchange.name} stacks up against ${peerNames[0]} and ${peerNames[1]} before you register.`,
    answerBox: {
      title: "If you only need the short answer",
      body: `${notes.feesAngle} ${notes.comparisonAngle}`,
      bullets: [
        `Spot base fees: ${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
        `Futures base fees: ${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
        exchange.fees.tokenName
          ? `${exchange.fees.tokenName} discounts can stack on top of the base fee structure`
          : "There is no platform-token discount to stack, so base fees and rebate quality matter more",
      ],
    },
    fit: {
      title: "Who this path fits",
      goodFor: notes.goodFor,
      notIdealFor: notes.notIdealFor,
    },
    sections: [
      {
        title: `Are ${exchange.name} base fees actually low enough to care about?`,
        body: notes.feesAngle,
        bullets: [
          `Spot maker/taker: ${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)}`,
          `Futures maker/taker: ${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)}`,
          exchange.fees.tokenName
            ? `${exchange.fees.tokenName} can lower effective costs further for committed users`
            : "No additional platform-token fee discount is part of the current setup",
        ],
      },
      {
        title: "How much can the rebate change your effective cost?",
        body: "Rebates matter most when you actually trade enough for fee savings to compound. If you trade rarely, the headline percentage matters less than overall platform fit.",
        bullets: [
          `Spot rebate: ${exchange.spotRebate}`,
          `Futures rebate: ${exchange.futuresRebate}`,
          `Settlement cadence: ${getSettlementLabel(locale, exchange)}`,
        ],
      },
      {
        title: `How should you compare ${exchange.name} with ${peerNames[0]} and ${peerNames[1]}?`,
        body: notes.comparisonAngle,
        bullets: [
          `${peerNames[0]} is the closer benchmark for mainstream fee and product comparison`,
          `${peerNames[1]} is useful when your style is more derivatives-led, campaign-sensitive, or alt-market focused`,
        ],
      },
    ],
    faq: [
      {
        q: `What are the current ${exchange.name} spot and futures base fees?`,
        a: `The tracked base rates are ${formatPercent(exchange.fees.spotMaker)} / ${formatPercent(exchange.fees.spotTaker)} on spot and ${formatPercent(exchange.fees.futuresMaker, 3)} / ${formatPercent(exchange.fees.futuresTaker, 3)} on futures.`,
      },
      {
        q: `Can ${exchange.name} token discounts stack with the rebate?`,
        a: exchange.fees.tokenName
          ? `Yes, ${exchange.fees.tokenName} discounts can reduce the nominal fee layer first, while the rebate changes what you effectively recover afterward. The real question is whether holding the token suits your trading plan.`
          : "No explicit platform-token fee discount is part of the current tracked setup, so compare base fees, rebate scope, and actual trading volume instead."
      },
      {
        q: `Is ${exchange.name} cheaper than ${peerNames[0]} or ${peerNames[1]} after rebate?`,
        a: `${notes.comparisonAngle} The honest answer depends on your volume, product mix, token-discount usage, and how reliably the rebate path fits your account setup.`,
      },
    ],
    cta: {
      label: `Review ${exchange.name} signup with the rebate path applied`,
      helperText: "Use this when you want to translate headline rebate numbers into real trading-cost decisions.",
    },
  };
}

function buildOfficialSiteContent(
  locale: SeoContentLocale,
  exchange: Exchange,
  notes: ExchangeSeoNotes["en"] | ExchangeSeoNotes["zh"],
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): Pick<
  ExchangeSeoContentEntry,
  "heroTitle" | "heroDescription" | "answerBox" | "fit" | "sections" | "faq" | "cta"
> {
  const [peerA, peerB] = comparisonPeers;
  const peerNames = [getExchangeName(peerA), getExchangeName(peerB)];
  const officialSiteUrl = getOfficialSiteUrl(exchange);
  const officialHost = getOfficialHost(exchange);

  if (locale === "zh") {
    return {
      heroTitle: `${exchange.name} 官网入口与注册路径，先确认真官网再注册`,
      heroDescription:
        `如果你在找 ${exchange.name} 官网、官方注册链接或安全注册入口，这页先帮你确认官网域名、常见误区，以及它和 ${peerNames[0]}、${peerNames[1]} 的差异。`,
      answerBox: {
        title: "如果你只想先拿到答案",
        body: `${exchange.name} 的官方主域名是 ${officialHost}。真正值得做的是先确认域名、再走官方注册链接，而不是被搜索结果里的镜像站和下载站带偏。`,
        bullets: [
          `官方主域名：${officialHost}`,
          `官方注册链接来源：${officialSiteUrl}`,
          "涉及注册、下载或邀请码时，优先从官方主站或官方邀请码链接进入。",
        ],
      },
      fit: {
        title: "适合谁，不适合谁",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `${exchange.name} 真官网该怎么认？`,
          body: `${notes.summary} 在搜索官网时，先认域名，再认页面结构，最后再看注册链接是否仍在官方主域名下。`,
          bullets: [
            `当前整理到的主域名是 ${officialHost}`,
            "如果页面域名、跳转链或下载方式异常，先停下不要直接注册或下载",
            "带邀请码的注册链接也应尽量落在官方主域名或明确 partner 域名上",
          ],
        },
        {
          title: "官网搜索里最容易踩的坑是什么？",
          body: "最常见的坑不是“官网找不到”，而是点进了镜像站、聚合下载页、假下载包，或者误把非官方活动页当成主站。",
          bullets: [
            "不要只看页面标题或 logo，要优先看域名本身",
            "如果你想注册，最稳妥的方法是从主域名或官方邀请链接进入",
            "下载 App 时也不要从第三方下载站拿安装包",
          ],
        },
        {
          title: `什么时候应该顺手一起比较 ${peerNames[0]} 或 ${peerNames[1]}？`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} 更适合拿来比较主流官网入口和注册体验`,
            `${peerNames[1]} 更适合拿来比较产品风格和活动路径`,
          ],
        },
      ],
      faq: [
        {
          q: `${exchange.name} 官网是什么？`,
          a: `当前整理到的 ${exchange.name} 官方主域名是 ${officialHost}，注册和下载都建议从主域名或官方邀请码链接进入。`,
        },
        {
          q: `${exchange.name} 官网和邀请码注册链接有什么区别？`,
          a: "官网主域名是品牌主站，邀请码注册链接通常是在官网或 partner 域名下的注册落地页。真正重要的是它们都要落在可信官方域名体系里。",
        },
        {
          q: `搜索 ${exchange.name} 官网时怎么避免假站？`,
          a: "先看域名，再看跳转路径，涉及下载和注册时不要使用第三方聚合下载站或来历不明的中转页。",
        },
      ],
      cta: {
        label: `打开 ${exchange.name} 官方站点`,
        helperText: "点击后将直接进入当前追踪的官方返佣注册链接。",
        href: exchange.referralLink,
      },
    };
  }

  if (locale === "en") {
    return {
      heroTitle: `${exchange.name} official site and signup route: verify the real domain first`,
      heroDescription:
        `Use this page to confirm the real ${exchange.name} website, the official signup route, common fake-site risks, and how it compares with ${peerNames[0]} and ${peerNames[1]}.`,
      answerBox: {
        title: "If you only need the short answer",
        body: `The core check is simple: confirm that ${exchange.name} is loading under ${officialHost}, then start from the official site or the official referral route instead of a random search result or mirror page.`,
        bullets: [
          `Official host: ${officialHost}`,
          `Official site root: ${officialSiteUrl}`,
          "If you plan to register or download an app, stay on the official domain family from the start.",
        ],
      },
      fit: {
        title: "Who this path fits",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `How do you confirm the real ${exchange.name} official site?`,
          body: `${notes.summary} When searching for the official site, verify the host first, then the page structure, and only then the signup path.`,
          bullets: [
            `The tracked official host is ${officialHost}`,
            "Do not trust a page only because it copies the logo or brand copy",
            "For signup, the safest route is the official site or an official referral URL on the correct domain family",
          ],
        },
        {
          title: "What usually goes wrong when people search for the official site?",
          body: "The biggest mistakes come from mirror sites, unofficial download pages, or landing pages that look branded but do not sit on the right domain.",
          bullets: [
            "Check the host before you check the visual design",
            "Avoid third-party download aggregators and redirect chains",
            "If you want the rebate path, verify that the signup URL still lives on the official or approved partner host",
          ],
        },
        {
          title: `When should you compare ${peerNames[0]} or ${peerNames[1]} at the same time?`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} is useful when comparing mainstream official-site and onboarding paths`,
            `${peerNames[1]} is useful when your product priorities or campaign sensitivity are different`,
          ],
        },
      ],
      faq: [
        {
          q: `What is the official ${exchange.name} site?`,
          a: `The tracked official host is ${officialHost}. Registration and app discovery should start from the official root or an official referral route on the same domain family.`,
        },
        {
          q: `What is the difference between the official site and a referral signup URL?`,
          a: "The official site is the main brand domain, while a referral signup URL is a registration-specific path on the official or approved partner domain. Both should still sit on a trusted host.",
        },
        {
          q: `How do you avoid fake ${exchange.name} websites in search results?`,
          a: "Verify the hostname first, avoid mirror pages and third-party download sites, and do not trust a page only because it looks visually similar to the brand.",
        },
      ],
      cta: {
        label: `Open the official ${exchange.name} site`,
        helperText: "This button takes you directly to the tracked referral signup URL.",
        href: exchange.referralLink,
      },
    };
  }

  const message = getLocaleExchangeMessage(locale, exchange.slug);
  const pageLabels = getExchangeSeoPageLabels(locale, "official-site");
  const clusterLabels = getExchangeSeoClusterLabels(locale);

  return {
    heroTitle: `${exchange.name} ${pageLabels.nav}`,
    heroDescription: `${message.description} ${officialHost}`,
    answerBox: {
      title: clusterLabels.answerTitle,
      body: `${message.bestFor} ${officialHost}`,
      bullets: [
        `${pageLabels.short}: ${officialHost}`,
        `${officialSiteUrl}`,
        message.pros[0] ?? message.bestFor,
      ],
    },
    fit: {
      title: clusterLabels.fitTitle,
      goodFor: message.pros.slice(0, 3),
      notIdealFor: message.cons.slice(0, 3),
    },
    sections: [
      {
        title: pageLabels.nav,
        body: message.description,
        bullets: [
          `${pageLabels.short}: ${officialHost}`,
          officialSiteUrl,
          message.bestFor,
        ],
      },
      {
        title: clusterLabels.factCardTitle,
        body: message.tutorial.join(" "),
        bullets: [
          message.pros[0] ?? officialHost,
          message.cons[0] ?? message.bestFor,
          officialSiteUrl,
        ],
      },
      {
        title: clusterLabels.moreGuidesTitle,
        body: notes.comparisonAngle,
        bullets: [
          `${peerNames[0]}`,
          `${peerNames[1]}`,
        ],
      },
    ],
    faq: message.faq.slice(0, 3),
    cta: {
      label: `${pageLabels.short} · ${exchange.name}`,
      helperText: exchange.referralLink,
      href: exchange.referralLink,
    },
  };
}

function buildAppDownloadContent(
  locale: SeoContentLocale,
  exchange: Exchange,
  notes: ExchangeSeoNotes["en"] | ExchangeSeoNotes["zh"],
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): Pick<
  ExchangeSeoContentEntry,
  | "heroTitle"
  | "heroDescription"
  | "answerBox"
  | "fit"
  | "sections"
  | "faq"
  | "cta"
  | "howToSteps"
> {
  const [peerA, peerB] = comparisonPeers;
  const peerNames = [getExchangeName(peerA), getExchangeName(peerB)];
  const officialSiteUrl = getOfficialSiteUrl(exchange);
  const officialHost = getOfficialHost(exchange);

  if (locale === "zh") {
    return {
      heroTitle: `${exchange.name} App 下载与安全安装，别从第三方下载站拿包`,
      heroDescription:
        `如果你在找 ${exchange.name} App 下载、官网 App 入口或手机安装方法，这页先帮你确认正确来源，再判断该不该继续注册。`,
      answerBox: {
        title: "如果你只关心答案",
        body: `下载 ${exchange.name} App 时，最稳妥的方法不是找“某个 APK 包”，而是先回到 ${officialHost} 这个官方域名，再走它自己的 App 下载或商店入口。`,
        bullets: [
          `官方域名：${officialHost}`,
          "不要从第三方下载站、镜像页或来历不明的二维码安装",
          "如果要同时拿返佣，先确认 App 安装路径和官方注册链接属于同一可信域名体系",
        ],
      },
      fit: {
        title: "适合谁，不适合谁",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `${exchange.name} App 应该从哪里下载？`,
          body: `${notes.summary} 真正安全的下载路径应从官网主站或官方应用商店入口出发，而不是直接找第三方安装包。`,
          bullets: [
            `建议先进入 ${officialSiteUrl}`,
            "优先使用官网提供的 App Store / Google Play / 官方下载入口",
            "若页面域名异常、安装包来源不明，先停止安装",
          ],
        },
        {
          title: "下载 App 时最常见的风险是什么？",
          body: "最常见的风险不是 App 本身，而是下载来源错误。搜索结果里大量“官方下载站”“最新版安装包”并不等于官方来源。",
          bullets: [
            "不要只看页面写着“官方”两个字，要先认域名",
            "二维码、APK、安装包都应该来自官网主域名或官方商店",
            "安装前后都要核对登录域名和注册链接是否一致",
          ],
        },
        {
          title: `什么时候应该改看 ${peerNames[0]} 或 ${peerNames[1]} 的 App 路径？`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} 更适合比较主流 App 体验和官方入口稳定性`,
            `${peerNames[1]} 更适合比较交易风格、返佣入口和安装路径`,
          ],
        },
      ],
      faq: [
        {
          q: `${exchange.name} App 去哪里下载最安全？`,
          a: `最稳妥的方法是先回到 ${officialHost} 官方域名，再从官网给出的 App 下载页或官方应用商店入口安装。`,
        },
        {
          q: `${exchange.name} 可以直接下载 APK 吗？`,
          a: "除非 APK 或二维码明确来自官方主域名，否则不要直接安装。优先信任官网主站和官方应用商店，而不是第三方下载站。",
        },
        {
          q: `下载 ${exchange.name} App 之后，返佣会自动带上吗？`,
          a: "返佣是否生效仍要看你是否沿正确官方注册链接完成注册，App 下载本身不等于返佣关系已经自动绑定。",
        },
      ],
      cta: {
        label: `打开 ${exchange.name} 官网查看 App 入口`,
        helperText: "点击后将直接进入当前追踪的官方返佣注册链接。",
        href: exchange.referralLink,
      },
      howToSteps: [
        `先打开 ${exchange.name} 官方主站 ${officialHost}。`,
        "从官网页面进入官方 App 下载页或官方应用商店入口。",
        "安装前确认包来源、域名和登录入口都属于官方体系。",
        "如果你还要拿返佣，再从官方邀请码链接完成注册，不要混用第三方下载路径。",
      ],
    };
  }

  if (locale === "en") {
    return {
      heroTitle: `${exchange.name} app download and safe install: avoid third-party download traps`,
      heroDescription:
        `If you are searching for the ${exchange.name} app, the safest workflow is to confirm the official domain first, then use its own app page or store route instead of a random APK or mirror result.`,
      answerBox: {
        title: "If you only need the short answer",
        body: `Do not start with a random installer. Start from ${officialHost}, then move to the app page or official store route that the exchange itself exposes.`,
        bullets: [
          `Official host: ${officialHost}`,
          "Avoid third-party download aggregators, mirror pages, and unknown QR codes",
          "If you also want the rebate path, keep the app and signup flow inside the same trusted domain family",
        ],
      },
      fit: {
        title: "Who this path fits",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `Where should you download the ${exchange.name} app from?`,
          body: `${notes.summary} The safest route starts from the official site or official app-store links, not from third-party installer pages.`,
          bullets: [
            `Start from ${officialSiteUrl}`,
            "Prefer the official App Store / Google Play / platform-provided route",
            "If the hostname or package source looks wrong, stop before installing",
          ],
        },
        {
          title: "What usually goes wrong with exchange app downloads?",
          body: "The risk is usually the download source, not the existence of the app itself. Search results are full of pages that say 'official' without actually being official.",
          bullets: [
            "Verify the host, not just the page design",
            "Treat QR codes, APK files, and installer pages as sensitive sources",
            "Check that the login domain and signup route still match the official host family",
          ],
        },
        {
          title: `When should you compare the app path with ${peerNames[0]} or ${peerNames[1]}?`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} is useful when comparing mainstream app onboarding and stability`,
            `${peerNames[1]} is useful when comparing app-first trading flow and referral path fit`,
          ],
        },
      ],
      faq: [
        {
          q: `Where is the safest place to download the ${exchange.name} app?`,
          a: `Start from ${officialHost}, then use the official app page or official app-store route exposed there. Avoid third-party download sites.`,
        },
        {
          q: `Should you install an APK directly for ${exchange.name}?`,
          a: "Only when the package source is clearly controlled by the official domain family. Otherwise, prefer the official site and official store paths.",
        },
        {
          q: `Does downloading the ${exchange.name} app guarantee the rebate path?`,
          a: "No. The rebate depends on how you complete registration. App installation alone does not guarantee the referral relationship is attached.",
        },
      ],
      cta: {
        label: `Open the official ${exchange.name} site for app access`,
        helperText: "This button takes you directly to the tracked referral signup URL.",
        href: exchange.referralLink,
      },
      howToSteps: [
        `Open the official ${exchange.name} site at ${officialHost}.`,
        "Use the app route or store link provided there instead of a third-party installer page.",
        "Verify that the package source, hostname, and login entry still match the official domain family.",
        "If you want the rebate path too, complete signup through the official referral route after confirming the app source.",
      ],
    };
  }

  const message = getLocaleExchangeMessage(locale, exchange.slug);
  const pageLabels = getExchangeSeoPageLabels(locale, "app-download");
  const clusterLabels = getExchangeSeoClusterLabels(locale);

  return {
    heroTitle: `${exchange.name} ${pageLabels.nav}`,
    heroDescription: `${message.description} ${officialHost}`,
    answerBox: {
      title: clusterLabels.answerTitle,
      body: `${message.bestFor} ${officialHost}`,
      bullets: [
        officialSiteUrl,
        message.tutorial[0] ?? officialHost,
        message.cons[0] ?? message.bestFor,
      ],
    },
    fit: {
      title: clusterLabels.fitTitle,
      goodFor: message.pros.slice(0, 3),
      notIdealFor: message.cons.slice(0, 3),
    },
    sections: [
      {
        title: pageLabels.nav,
        body: message.description,
        bullets: [
          officialSiteUrl,
          message.tutorial[0] ?? message.bestFor,
          message.tutorial[1] ?? message.pros[0] ?? officialHost,
        ],
      },
      {
        title: clusterLabels.factCardTitle,
        body: message.tutorial.join(" "),
        bullets: [
          message.pros[0] ?? officialHost,
          message.cons[0] ?? message.bestFor,
          officialHost,
        ],
      },
      {
        title: clusterLabels.moreGuidesTitle,
        body: notes.comparisonAngle,
        bullets: [peerNames[0], peerNames[1]],
      },
    ],
    faq: message.faq.slice(0, 3),
    cta: {
      label: `${pageLabels.short} · ${exchange.name}`,
      helperText: exchange.referralLink,
      href: exchange.referralLink,
    },
    howToSteps: buildHowToSteps(locale, exchange),
  };
}

function buildSafetyReviewContent(
  locale: SeoContentLocale,
  exchange: Exchange,
  notes: ExchangeSeoNotes["en"] | ExchangeSeoNotes["zh"],
  comparisonPeers: [ExchangeSlug, ExchangeSlug]
): Pick<
  ExchangeSeoContentEntry,
  "heroTitle" | "heroDescription" | "answerBox" | "fit" | "sections" | "faq" | "cta"
> {
  const [peerA, peerB] = comparisonPeers;
  const peerNames = [getExchangeName(peerA), getExchangeName(peerB)];

  if (locale === "zh") {
    return {
      heroTitle: `${exchange.name} 安全性、正规性与风险评测`,
      heroDescription:
        `如果你在搜 ${exchange.name} 是否正规、安全可靠吗、能不能长期用，这页把牌照心智、KYC、地区限制、返佣和真实风险一起讲清楚。`,
      answerBox: {
        title: "如果你只关心答案",
        body: `${notes.answerHighlight} 但任何交易所都不是“零风险”。真正要确认的是：它是否适合你的地区、你的产品需求，以及你能否接受它的账户和合规要求。`,
        bullets: [
          `KYC：${getKycLabel(locale, exchange)}`,
          `地区限制：${exchange.regionRestrictions.join("、")}`,
          `官方域名：${getOfficialHost(exchange)}`,
        ],
      },
      fit: {
        title: "适合谁，不适合谁",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `${exchange.name} 算正规平台吗？`,
          body: `${notes.summary} 对大多数用户来说，判断“正规”不该只看品牌名气，还要看官网域名、KYC 流程、地区限制和产品可用性。`,
          bullets: [
            "能否在官方域名下完成注册和登录",
            `是否明确要求 KYC：${getKycLabel(locale, exchange)}`,
            "是否对你的地区和目标产品有清晰规则",
          ],
        },
        {
          title: "真正的风险点在哪里？",
          body: "风险不只来自黑客或诈骗，也来自地区限制、账户权限、活动口径变化，以及你是否误走了非官方路径。",
          bullets: [
            "不要把“知名平台”理解成“适合所有地区和所有用户”",
            "返佣和活动会变化，不能把营销数字当作长期承诺",
            "合规、KYC 和产品权限，都会直接影响你能不能真正使用这个账户",
          ],
        },
        {
          title: `什么时候应该一起比较 ${peerNames[0]} 或 ${peerNames[1]}？`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} 更适合拿来比较主流稳妥路线`,
            `${peerNames[1]} 更适合拿来比较产品风格和交易需求`,
          ],
        },
      ],
      faq: [
        {
          q: `${exchange.name} 是正规的吗？`,
          a: `更准确的说法是：${exchange.name} 是一家主流加密交易平台，但你仍要结合官方域名、KYC、地区限制和目标产品来判断它是否适合你。`,
        },
        {
          q: `${exchange.name} 安全可靠吗？`,
          a: "安全性不能只看品牌知名度，还要看你是否走了官方路径、是否完成合适的账户安全设置，以及你所在地区能否正常使用目标产品。",
        },
        {
          q: `${exchange.name} 适合长期使用吗？`,
          a: `${notes.comparisonAngle} 如果你准备长期用，建议把安全性、费率、返佣、地区适配性和产品线放在一起比较。`,
        },
      ],
      cta: {
        label: `查看 ${exchange.name} 官方入口并继续比较`,
        helperText: "点击后将直接进入当前追踪的官方返佣注册链接。",
        href: exchange.referralLink,
      },
    };
  }

  if (locale === "en") {
    return {
      heroTitle: `${exchange.name} safety, legitimacy, and risk review`,
      heroDescription:
        `If you are searching whether ${exchange.name} is safe, legitimate, or reliable enough for long-term use, this page pulls together the domain check, KYC reality, regional restrictions, and practical risk points.`,
      answerBox: {
        title: "If you only need the short answer",
        body: `${notes.answerHighlight} But no exchange is risk-free. The real question is whether its domain integrity, KYC path, regional fit, and product availability are acceptable for your use case.`,
        bullets: [
          `KYC: ${getKycLabel(locale, exchange)}`,
          `Regional restrictions: ${exchange.regionRestrictions.join(", ")}`,
          `Official host: ${getOfficialHost(exchange)}`,
        ],
      },
      fit: {
        title: "Who this path fits",
        goodFor: notes.goodFor,
        notIdealFor: notes.notIdealFor,
      },
      sections: [
        {
          title: `Is ${exchange.name} a legitimate exchange?`,
          body: `${notes.summary} The better way to judge legitimacy is not brand size alone, but the combination of the official domain, KYC path, regional clarity, and product availability.`,
          bullets: [
            "Can you register and log in under the official domain family?",
            `Is KYC explicit and manageable? ${getKycLabel(locale, exchange)}`,
            "Are regional and product restrictions stated clearly enough for your use case?",
          ],
        },
        {
          title: "Where do the real risks actually sit?",
          body: "Risk is not only about hacks or obvious scams. It also comes from regional ineligibility, account-access assumptions, changing campaign terms, and off-domain signup or download paths.",
          bullets: [
            "Do not confuse brand familiarity with universal suitability",
            "Rebate and fee campaigns can change; they are not a substitute for account certainty",
            "Compliance, KYC, and product permissions shape whether the account is truly usable",
          ],
        },
        {
          title: `When should you compare ${peerNames[0]} or ${peerNames[1]} for a safer fit?`,
          body: notes.comparisonAngle,
          bullets: [
            `${peerNames[0]} is useful when comparing mainstream, lower-friction default paths`,
            `${peerNames[1]} is useful when your product priorities or trading style differ`,
          ],
        },
      ],
      faq: [
        {
          q: `Is ${exchange.name} a legitimate exchange?`,
          a: `${exchange.name} is better understood as a mainstream crypto venue with a real official domain and account framework, but you still need to judge fit through KYC, region, and product access.`,
        },
        {
          q: `Is ${exchange.name} safe and reliable?`,
          a: "Safety depends on more than the brand name. Official-domain usage, security settings, KYC reality, and regional product fit all matter in practice.",
        },
        {
          q: `Is ${exchange.name} suitable for long-term use?`,
          a: `${notes.comparisonAngle} For long-term use, compare safety, fee structure, rebate logic, regional suitability, and product depth together.`,
        },
      ],
      cta: {
        label: `Open the official ${exchange.name} path and continue comparing`,
        helperText: "This button takes you directly to the tracked referral signup URL.",
        href: exchange.referralLink,
      },
    };
  }

  const message = getLocaleExchangeMessage(locale, exchange.slug);
  const pageLabels = getExchangeSeoPageLabels(locale, "safety-review");
  const clusterLabels = getExchangeSeoClusterLabels(locale);

  return {
    heroTitle: `${exchange.name} ${pageLabels.nav}`,
    heroDescription: `${message.description} ${getOfficialHost(exchange)}`,
    answerBox: {
      title: clusterLabels.answerTitle,
      body: `${message.bestFor} ${getOfficialHost(exchange)}`,
      bullets: [
        `${clusterLabels.reviewed}: ${exchange.lastReviewed}`,
        `${clusterLabels.comparePeers}: ${peerNames[0]} / ${peerNames[1]}`,
        `${pageLabels.short}: ${getOfficialHost(exchange)}`,
      ],
    },
    fit: {
      title: clusterLabels.fitTitle,
      goodFor: message.pros.slice(0, 3),
      notIdealFor: message.cons.slice(0, 3),
    },
    sections: [
      {
        title: pageLabels.nav,
        body: message.description,
        bullets: [
          `${getKycLabel(locale, exchange)}`,
          `${exchange.regionRestrictions.join(", ")}`,
          `${getOfficialHost(exchange)}`,
        ],
      },
      {
        title: clusterLabels.factCardTitle,
        body: message.bestFor,
        bullets: [
          message.pros[0] ?? message.bestFor,
          message.cons[0] ?? message.bestFor,
          message.pros[1] ?? getOfficialHost(exchange),
        ],
      },
      {
        title: clusterLabels.moreGuidesTitle,
        body: notes.comparisonAngle,
        bullets: [peerNames[0], peerNames[1]],
      },
    ],
    faq: message.faq.slice(0, 3),
    cta: {
      label: `${pageLabels.short} · ${exchange.name}`,
      helperText: exchange.referralLink,
      href: exchange.referralLink,
    },
  };
}

function buildEntry(
  locale: SeoContentLocale,
  exchange: Exchange,
  pageType: ExchangeSeoPageType
): ExchangeSeoContentEntry {
  const comparisonPeers = SEO_NOTES[exchange.slug].comparisonPeers;
  const notes = getLocalizedNotes(locale, exchange, comparisonPeers);
  const pageLabels = getExchangeSeoPageLabels(locale, pageType);
  const primaryQuery = getPageTypePrimaryQuery(locale, exchange, pageType);
  const secondaryQueries = getSecondaryQueries(locale, exchange, comparisonPeers, pageType);
  const keywords = buildMetadataKeywords(
    locale,
    exchange,
    pageType,
    comparisonPeers
  );

  const pageContent =
    pageType === "referral-code"
      ? buildReferralContent(locale, exchange, notes, comparisonPeers)
      : pageType === "signup-kyc"
        ? buildSignupContent(locale, exchange, notes, comparisonPeers)
        : pageType === "fees-rebate"
          ? buildFeesContent(locale, exchange, notes, comparisonPeers)
          : pageType === "official-site"
            ? buildOfficialSiteContent(locale, exchange, notes, comparisonPeers)
            : pageType === "app-download"
              ? buildAppDownloadContent(locale, exchange, notes, comparisonPeers)
              : buildSafetyReviewContent(locale, exchange, notes, comparisonPeers);

  const metadata =
    locale === "zh"
      ? {
          title: `${exchange.name}${pageLabels.nav} | CryptoRebate`,
          description: `${pageContent.heroDescription} 当前邀请码 ${exchange.referralCode}，最近复核 ${exchange.lastReviewed}。`,
          keywords,
        }
      : locale === "en" &&
          (pageType === "official-site" ||
            pageType === "referral-code" ||
            pageType === "signup-kyc" ||
            pageType === "fees-rebate")
        ? {
            title: `${primaryQuery} | CryptoRebate`,
            description:
              pageType === "official-site"
                ? `${pageContent.heroDescription} Verify the official domain, region restrictions, safe signup route, and alternative exchange paths before you register. Last reviewed ${exchange.lastReviewed}.`
                : pageType === "referral-code"
                  ? `${pageContent.heroDescription} Check the live referral code, official signup route, rebate terms, and activation risks before you create the account. Last reviewed ${exchange.lastReviewed}.`
                  : pageType === "signup-kyc"
                    ? `${pageContent.heroDescription} Confirm the signup flow, KYC documents, rebate activation timing, and funding prerequisites before you finish onboarding. Last reviewed ${exchange.lastReviewed}.`
                    : `${pageContent.heroDescription} Review trading fees, rebate math, effective cost, and compare alternatives before you choose this exchange. Last reviewed ${exchange.lastReviewed}.`,
            keywords,
          }
      : {
          title: `${exchange.name} ${pageLabels.nav} | CryptoRebate`,
          description:
            locale === "en"
              ? `${pageContent.heroDescription} Current invite code ${exchange.referralCode}. Last reviewed ${exchange.lastReviewed}.`
              : `${pageContent.heroDescription} ${exchange.referralCode} · ${exchange.lastReviewed}.`,
          keywords,
        };
  const howToSteps: string[] | undefined =
    pageType === "signup-kyc" || pageType === "app-download"
      ? (pageContent as ReturnType<typeof buildSignupContent> | ReturnType<typeof buildAppDownloadContent>).howToSteps
      : undefined;

  return {
    locale,
    exchange,
    pageType,
    comparisonPeers,
    primaryQuery,
    secondaryQueries,
    metadata,
    heroTitle: pageContent.heroTitle,
    heroDescription: pageContent.heroDescription,
    answerBox: pageContent.answerBox,
    factCard: buildFactCard(locale, exchange, comparisonPeers),
    fit: pageContent.fit,
    sections: pageContent.sections,
    faq: pageContent.faq,
    cta: pageContent.cta,
    lastReviewed: exchange.lastReviewed,
    howToSteps,
  };
}

export function getExchangeSeoEntry(
  locale: string,
  slug: string,
  pageType: string
): ExchangeSeoContentEntry | undefined {
  if (!isSeoContentLocale(locale) || !isExchangeSeoPageType(pageType)) {
    return undefined;
  }

  const exchange = getExchangeBySlug(slug);
  if (!exchange) {
    return undefined;
  }

  return buildEntry(locale, exchange, pageType);
}

export function getExchangeSeoEntriesForExchange(
  locale: string,
  slug: string
): ExchangeSeoContentEntry[] {
  if (!isSeoContentLocale(locale) || !getExchangeBySlug(slug)) {
    return [];
  }

  return SEO_PAGE_TYPES.map((pageType) => {
    const entry = getExchangeSeoEntry(locale, slug, pageType);
    if (!entry) {
      throw new Error(`Missing SEO entry for ${locale}/${slug}/${pageType}`);
    }
    return entry;
  });
}

export function getExchangeSeoStaticParams() {
  return SEO_CONTENT_LOCALES.flatMap((locale) =>
    getAllExchangeSlugs().flatMap((slug) =>
      SEO_PAGE_TYPES.map((pageType) => ({
        locale,
        slug,
        pageType,
      }))
    )
  );
}

export function getExchangeSeoGuidesForLocale(locale: string) {
  if (!isSeoContentLocale(locale)) {
    return [];
  }

  return exchanges
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((exchange) => ({
      exchange,
      guides: getExchangeSeoEntriesForExchange(locale, exchange.slug),
    }));
}
