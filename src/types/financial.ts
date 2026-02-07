export interface MonthlyCosts {
  // Vehicle costs
  vehicleCapital: number; // Amortized depreciation + financing
  vehicleOperating: number; // Insurance, maintenance, connectivity

  // Energy costs
  energyGross: number; // Grid import costs
  energySolarOffset: number; // Value of solar generation
  energyExportCredit: number; // NEM export revenue
  energyNet: number; // Gross - offset - credits

  // Platform costs
  platformFees: number; // If using Uber/Lyft
  ownPlatformCosts: number; // If own platform

  // Solar amortized cost
  solarAmortized: number;

  // Total
  totalMonthlyCost: number;
}

export interface MonthlyRevenue {
  rideRevenue: number;
  exportRevenue: number;
  totalMonthlyRevenue: number;
}

export interface MonthlyProfit {
  revenue: number;
  costs: number;
  profit: number;
  margin: number; // profit / revenue
}

export interface BreakEvenAnalysis {
  totalInvestment: number;
  monthlyProfit: number;
  breakEvenMonths: number;

  // Cumulative projection (60 months)
  cumulativeInvestment: number[];
  cumulativeProfit: number[];
  breakEvenMonth: number | null; // null if never breaks even
}

export interface ScenarioSummary {
  name: string;
  monthlyRevenue: number;
  monthlyCosts: number;
  monthlyProfit: number;
  totalInvestment: number;
  breakEvenMonths: number | null;
  solarEnabled: boolean;
}

export interface ScenarioComparison {
  vehiclesOnly: ScenarioSummary;
  vehiclesPlusSolar: ScenarioSummary;
}
