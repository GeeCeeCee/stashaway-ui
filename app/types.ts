export type PortfolioPlans = "one-time" | "monthly";

export interface DepositPlan {
  type: PortfolioPlans;
  isEnabled: boolean;
  allocations: {
    portfolioName: string;
    amount: number;
  }[];
}
