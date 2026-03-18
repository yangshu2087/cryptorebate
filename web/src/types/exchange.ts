export interface ExchangeFees {
  spotMaker: number;
  spotTaker: number;
  futuresMaker: number;
  futuresTaker: number;
  tokenDiscount?: number;
  tokenName?: string;
}

export interface Exchange {
  slug: string;
  name: string;
  logo: string;
  referralCode: string;
  referralLink: string;
  fees: ExchangeFees;
  spotRebate: string;
  futuresRebate: string;
  founded: number;
  headquarters: string;
  tradingPairs: number;
  supports: {
    spot: boolean;
    futures: boolean;
    options: boolean;
    copyTrading: boolean;
    staking: boolean;
  };
  kyc: "required" | "optional" | "none";
  tags: string[];
  order: number;
}
