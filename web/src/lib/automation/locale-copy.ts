import type { AutomationDynamicPageType } from "./types";

type IntentCopy = {
  short: string;
  nav: string;
  question: string;
  actionLabel: string;
  actionNoun: string;
  querySuffix: string;
  heroLead: string;
  answerLead: string;
  section1: string;
  section2: string;
  section3: string;
  faq1: string;
  faq2: string;
  faq3: string;
};

type LocaleAutomationCopy = {
  titlePrefix: string;
  answerTitle: string;
  fitTitle: string;
  goodForTitle: string;
  notIdealForTitle: string;
  ctaLabel: string;
  ctaHelper: string;
  factLabels: {
    opportunity: string;
    inviteCode: string;
    spotFees: string;
    futuresFees: string;
    kyc: string;
    settlement: string;
    lastReviewed: string;
    projectedRevenue: string;
  };
  bullets: {
    officialPath: string;
    policyCheck: string;
    compareBeforeSignup: string;
    watchRegionRisk: string;
  };
  intents: Record<AutomationDynamicPageType, IntentCopy>;
};

const locales = {
  en: {
    titlePrefix: "Automation",
    answerTitle: "Auto-generated answer",
    fitTitle: "Who should use this path",
    goodForTitle: "Good for",
    notIdealForTitle: "Not ideal for",
    ctaLabel: "Open signup route",
    ctaHelper:
      "This page was automatically expanded from query, click, and earnings signals. Use the official signup route and verify region and KYC rules before acting.",
    factLabels: {
      opportunity: "Opportunity score",
      inviteCode: "Invite code",
      spotFees: "Spot base fees",
      futuresFees: "Futures base fees",
      kyc: "KYC",
      settlement: "Settlement",
      lastReviewed: "Last reviewed",
      projectedRevenue: "Projected monthly revenue",
    },
    bullets: {
      officialPath: "Use the official referral path, not an unverified mirror.",
      policyCheck: "Check the latest KYC, region, and activation rules before registering.",
      compareBeforeSignup: "Compare the signup path against other high-intent pages before you commit.",
      watchRegionRisk: "If your region is restricted, treat this page as research, not an activation shortcut.",
    },
    intents: {
      login: {
        short: "Login",
        nav: "Login access & safe entry",
        question: "Find the safest login route",
        actionLabel: "login",
        actionNoun: "login access",
        querySuffix: "login",
        heroLead: "Users often search this route when they want fast account access without landing on the wrong hostname.",
        answerLead: "If you only care about the answer, use the official domain family and check that the login flow still matches the active signup route.",
        section1: "What users usually mean by this query",
        section2: "What to validate before logging in",
        section3: "How this query converts into revenue",
        faq1: "What is the safest login route?",
        faq2: "Can this query still drive affiliate revenue?",
        faq3: "When should this page be refreshed?",
      },
      "country-availability": {
        short: "Regions",
        nav: "Country availability & restrictions",
        question: "Check whether the exchange is available in your region",
        actionLabel: "country availability",
        actionNoun: "country availability",
        querySuffix: "country availability",
        heroLead: "These queries come from users close to signup who want to know whether they can legally and practically use the exchange.",
        answerLead: "If you only care about the answer, verify region support, derivatives rules, and KYC availability before you click the referral route.",
        section1: "What this region query usually means",
        section2: "What to validate before signing up",
        section3: "Why this page matters for conversion",
        faq1: "Is this exchange available in all regions?",
        faq2: "Should users register before checking restrictions?",
        faq3: "What makes this page monetizable?",
      },
      "deposit-withdrawal": {
        short: "Deposit",
        nav: "Deposit, withdrawal & funding flow",
        question: "Check deposit and withdrawal behavior before signup",
        actionLabel: "deposit and withdrawal",
        actionNoun: "deposit and withdrawal flow",
        querySuffix: "deposit withdrawal",
        heroLead: "Funding queries usually appear right before a serious signup decision, especially for users comparing actual usability instead of only headline rebates.",
        answerLead: "If you only care about the answer, confirm funding rails, fee friction, and verification requirements before choosing the referral route.",
        section1: "What funding-intent users want to know",
        section2: "What to validate in the funding flow",
        section3: "Why this page influences monetization",
        faq1: "Does funding friction block conversion?",
        faq2: "What should users check before depositing?",
        faq3: "How often should deposit pages be refreshed?",
      },
      "copy-trading": {
        short: "Copy",
        nav: "Copy trading access & fit",
        question: "See whether copy trading is a strong signup angle",
        actionLabel: "copy trading",
        actionNoun: "copy trading path",
        querySuffix: "copy trading",
        heroLead: "Copy-trading queries usually come from action-ready users who care more about ease of onboarding than raw fee math.",
        answerLead: "If you only care about the answer, confirm whether copy trading is available in your region and whether the exchange’s rebate route still activates correctly.",
        section1: "What this copy-trading query means",
        section2: "What to validate before signup",
        section3: "Why this page can monetize well",
        faq1: "Is copy trading available everywhere?",
        faq2: "Does copy trading change rebate activation?",
        faq3: "What makes this page high intent?",
      },
      "trading-bot": {
        short: "Bots",
        nav: "Trading bots, grids & automation tools",
        question: "Check whether the exchange is a strong bot/signup fit",
        actionLabel: "trading bots",
        actionNoun: "bot trading path",
        querySuffix: "trading bot",
        heroLead: "Bot and grid searches usually indicate users who are evaluating execution depth and recurring trading behavior.",
        answerLead: "If you only care about the answer, verify API/tool support, fee friction, and derivative availability before using the referral route.",
        section1: "What bot users usually need",
        section2: "What to validate before acting",
        section3: "Why this query matters for revenue",
        faq1: "Does bot support affect conversion quality?",
        faq2: "What should users validate first?",
        faq3: "When does this page deserve expansion?",
      },
      "proof-of-reserves": {
        short: "PoR",
        nav: "Proof of reserves & transparency",
        question: "Check transparency before choosing the signup path",
        actionLabel: "proof of reserves",
        actionNoun: "proof of reserves view",
        querySuffix: "proof of reserves",
        heroLead: "These queries come from risk-aware users who still convert well when trust signals are handled clearly.",
        answerLead: "If you only care about the answer, use proof-of-reserves pages to reduce trust friction before routing users to the affiliate path.",
        section1: "What transparency queries imply",
        section2: "What trust checks should be surfaced",
        section3: "Why this page helps conversion",
        faq1: "Does transparency content convert?",
        faq2: "What trust evidence matters most?",
        faq3: "How should these pages be maintained?",
      },
      "verification-troubleshooting": {
        short: "KYC Fix",
        nav: "Verification troubleshooting & fixes",
        question: "Help users solve verification blocks",
        actionLabel: "verification troubleshooting",
        actionNoun: "verification troubleshooting",
        querySuffix: "verification troubleshooting",
        heroLead: "Verification-failure queries catch users at the edge of churn; solving them protects previously won traffic value.",
        answerLead: "If you only care about the answer, explain the likely KYC failure points and route users back to the safest active signup path.",
        section1: "Why users search this problem",
        section2: "How to reduce failed verification friction",
        section3: "Why this matters for retained revenue",
        faq1: "Why do these pages matter?",
        faq2: "What should users check first?",
        faq3: "When should the page auto-refresh?",
      },
      "new-listings": {
        short: "Listings",
        nav: "New listings & coin availability",
        question: "Use new-listing demand as a signup hook",
        actionLabel: "new listings",
        actionNoun: "new listings path",
        querySuffix: "new listings",
        heroLead: "Listing-related searches often come from active traders who are comparing where to register right before a market event.",
        answerLead: "If you only care about the answer, pair listing demand with real fee and access facts before sending users into the referral flow.",
        section1: "What listing queries signal",
        section2: "What to validate before signup",
        section3: "Why this is a monetizable query",
        faq1: "Are listing pages high intent?",
        faq2: "What should be checked before routing traffic?",
        faq3: "How often should listing pages refresh?",
      },
    },
  },
  zh: {
    titlePrefix: "自动化",
    answerTitle: "自动生成答案",
    fitTitle: "适合谁使用这条路径",
    goodForTitle: "更适合",
    notIdealForTitle: "不太适合",
    ctaLabel: "打开注册入口",
    ctaHelper:
      "这页由 query、点击和收益信号自动扩出来。行动前仍需确认地区、KYC 和最新平台规则。",
    factLabels: {
      opportunity: "机会分",
      inviteCode: "邀请码",
      spotFees: "现货基础费率",
      futuresFees: "合约基础费率",
      kyc: "KYC",
      settlement: "返佣结算",
      lastReviewed: "最近复核",
      projectedRevenue: "预计月收入",
    },
    bullets: {
      officialPath: "优先使用官方返佣入口，不要走不明镜像站。",
      policyCheck: "注册前先看最新 KYC、地区和返佣生效规则。",
      compareBeforeSignup: "真正下决定前，先对比其他高意图页面给出的路径。",
      watchRegionRisk: "如果所在地区受限，这页更适合作为研究入口，而不是直接行动入口。",
    },
    intents: {
      login: { short: "登录", nav: "登录入口与安全访问", question: "先找到安全的登录路径", actionLabel: "登录", actionNoun: "登录入口", querySuffix: "登录", heroLead: "这类词通常来自想快速进入账户、又担心点错域名的用户。", answerLead: "如果你只关心答案：优先走官方域名体系，并确认登录入口和当前注册入口一致。", section1: "用户搜这个词通常在找什么", section2: "登录前要核对什么", section3: "这类词为什么也能变现", faq1: "最安全的登录入口是什么？", faq2: "登录词也能带来联盟收益吗？", faq3: "这类页面多久该刷新一次？" },
      "country-availability": { short: "地区", nav: "地区可用性与限制", question: "先确认所在地区能否使用", actionLabel: "地区可用性", actionNoun: "地区可用性", querySuffix: "地区可用性", heroLead: "这类词通常来自临近注册、但还不确定自己能不能用的用户。", answerLead: "如果你只关心答案：先确认地区支持、衍生品限制和 KYC 可用性，再决定是否点返佣入口。", section1: "地区词背后的真实意图", section2: "注册前必须核对的限制", section3: "为什么这类页直接影响变现", faq1: "这家交易所在所有地区都能用吗？", faq2: "用户应该先注册还是先查限制？", faq3: "为什么这类页有变现价值？" },
      "deposit-withdrawal": { short: "充提", nav: "充值、提现与资金路径", question: "注册前先看充提路径", actionLabel: "充值提现", actionNoun: "充提路径", querySuffix: "充值 提现", heroLead: "资金路径词往往出现在用户真正准备注册和入金之前。", answerLead: "如果你只关心答案：先看入金通道、提现摩擦和验证要求，再选返佣入口。", section1: "用户最关心哪些资金问题", section2: "充提路径里要确认什么", section3: "为什么这类页容易影响转化", faq1: "充提体验会影响转化吗？", faq2: "入金前最该检查什么？", faq3: "这类页多久该刷新？" },
      "copy-trading": { short: "跟单", nav: "跟单交易与注册适配", question: "先判断跟单是不是好切入口", actionLabel: "跟单交易", actionNoun: "跟单路径", querySuffix: "跟单", heroLead: "跟单词通常来自接近行动、但更看重上手速度的用户。", answerLead: "如果你只关心答案：先确认地区支持、产品可用性以及返佣路径是否还能正常生效。", section1: "跟单词代表什么需求", section2: "注册前应该核对什么", section3: "为什么这类页变现效率高", faq1: "跟单功能在所有地区都可用吗？", faq2: "跟单会影响返佣生效吗？", faq3: "为什么这是高意图页面？" },
      "trading-bot": { short: "机器人", nav: "交易机器人与自动化工具", question: "先判断机器人是不是注册理由", actionLabel: "交易机器人", actionNoun: "机器人路径", querySuffix: "交易机器人", heroLead: "机器人和网格词通常来自更活跃、长期交易倾向更强的用户。", answerLead: "如果你只关心答案：先确认 API、工具、费率和合约支持，再决定走返佣路径。", section1: "机器人用户真正关心什么", section2: "行动前该确认什么", section3: "为什么这类词有收益价值", faq1: "机器人支持会影响转化质量吗？", faq2: "用户最先该核对什么？", faq3: "什么情况下该扩更多相关页？" },
      "proof-of-reserves": { short: "储备", nav: "储备证明与透明度", question: "先看透明度再决定注册", actionLabel: "储备证明", actionNoun: "储备证明视图", querySuffix: "储备证明", heroLead: "这类词来自更重视信任和风险控制、但依然有高转化潜力的用户。", answerLead: "如果你只关心答案：先用透明度内容降低不信任，再把用户导向官方返佣路径。", section1: "透明度词说明了什么", section2: "该展示哪些信任信息", section3: "为什么这类页能提升转化", faq1: "透明度内容真的能转化吗？", faq2: "最重要的信任证据是什么？", faq3: "这类页该如何维护？" },
      "verification-troubleshooting": { short: "认证修复", nav: "KYC 失败排查与修复", question: "先解决认证卡点", actionLabel: "认证排查", actionNoun: "认证排查", querySuffix: "认证失败", heroLead: "认证失败词通常出现在用户流失边缘，解决得好就能把已拿到的流量价值保住。", answerLead: "如果你只关心答案：明确最常见 KYC 失败点，并把用户重新引回最安全的注册路径。", section1: "用户为什么搜这个问题", section2: "如何降低认证失败摩擦", section3: "为什么这类页关系到留存收益", faq1: "为什么这种页面重要？", faq2: "用户第一步要检查什么？", faq3: "什么时候该自动刷新这类页？" },
      "new-listings": { short: "上新", nav: "新币上架与可交易性", question: "用上新需求做注册钩子", actionLabel: "新币上架", actionNoun: "上新路径", querySuffix: "上新", heroLead: "上新词通常来自临近交易动作、在比较去哪里开户的活跃用户。", answerLead: "如果你只关心答案：把上新需求和实际费率、可交易性一起讲清，再导向返佣路径。", section1: "上新词代表什么交易意图", section2: "注册前该核对什么", section3: "为什么这类词容易变现", faq1: "上新词算高意图吗？", faq2: "导流前最该确认什么？", faq3: "上新页多久刷新一次？" },
    },
  },
} satisfies Record<string, LocaleAutomationCopy>;

const fallbackLocale = locales.en;

export function getAutomationLocaleCopy(locale: string): LocaleAutomationCopy {
  return locales[locale as keyof typeof locales] ?? fallbackLocale;
}
