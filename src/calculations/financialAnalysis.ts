import { VehicleConfig, VehicleCostCalculation } from "@/types/vehicle";
import { RevenueConfig, RevenueCalculation } from "@/types/revenue";
import { SolarConfig, SolarCostCalculation } from "@/types/solar";
import { EnergyConfig, EnergyCalculation } from "@/types/energy";
import {
  MonthlyCosts,
  MonthlyRevenue,
  BreakEvenAnalysis,
  ScenarioSummary,
  ScenarioComparison,
} from "@/types/financial";
import { calculateVehicleCosts, calculateVehicleCapitalCost } from "./vehicleCosts";
import { calculateRevenue } from "./revenueModel";
import { calculateSolarCost, calculateEnergyBalance, getEffectiveEnergyRate } from "./energyBalance";

/**
 * Calculate monthly costs for a scenario
 */
export function calculateMonthlyCosts(
  vehicleConfig: VehicleConfig,
  vehicleCosts: VehicleCostCalculation,
  revenueConfig: RevenueConfig,
  solarConfig: SolarConfig,
  solarCosts: SolarCostCalculation,
  energyCalc: EnergyCalculation,
  revenueCalc: RevenueCalculation
): MonthlyCosts {
  // Variable costs based on miles driven
  const variableMileCosts =
    vehicleConfig.operatingCosts.maintenancePerMile * revenueCalc.totalMiles;

  // Vehicle operating costs (fixed + variable)
  const vehicleOperating = vehicleCosts.monthlyFixedCost + variableMileCosts;

  // Platform costs
  const platformFees = revenueCalc.platformFees;
  const ownPlatformCosts =
    revenueConfig.platform.mode === "own_platform"
      ? revenueConfig.platform.ownPlatformCostsMonthly
      : 0;

  // Solar amortized cost (only if enabled)
  const solarAmortized = solarConfig.enabled ? solarCosts.monthlyAmortizedCost : 0;

  // Total monthly cost
  const totalMonthlyCost =
    vehicleCosts.amortizedCapitalMonthly +
    vehicleOperating +
    energyCalc.monthlyNetEnergyCost +
    platformFees +
    ownPlatformCosts +
    solarAmortized;

  return {
    vehicleCapital: vehicleCosts.amortizedCapitalMonthly,
    vehicleOperating,
    energyGross: energyCalc.monthlyGridCost,
    energySolarOffset: solarConfig.enabled
      ? (energyCalc.monthlyVehicleKwh - energyCalc.monthlyGridImportKwh) *
        (energyCalc.monthlyGridImportKwh > 0
          ? energyCalc.monthlyGridCost / energyCalc.monthlyGridImportKwh
          : 0)
      : 0,
    energyExportCredit: energyCalc.monthlyExportCredit,
    energyNet: energyCalc.monthlyNetEnergyCost,
    platformFees,
    ownPlatformCosts,
    solarAmortized,
    totalMonthlyCost,
  };
}

/**
 * Calculate monthly revenue
 */
export function calculateMonthlyRevenue(
  revenueCalc: RevenueCalculation,
  energyCalc: EnergyCalculation
): MonthlyRevenue {
  return {
    rideRevenue: revenueCalc.netRevenue,
    exportRevenue: energyCalc.monthlyExportCredit,
    totalMonthlyRevenue: revenueCalc.netRevenue + energyCalc.monthlyExportCredit,
  };
}

/**
 * Calculate total upfront investment
 */
export function calculateTotalInvestment(
  vehicleConfig: VehicleConfig,
  solarConfig: SolarConfig,
  solarCosts: SolarCostCalculation
): number {
  const vehicleCapital = calculateVehicleCapitalCost(vehicleConfig);
  const solarCapital = solarConfig.enabled ? solarCosts.netCost : 0;

  // For cash purchases, include full vehicle cost
  // For loans, include down payment
  // For leases, include first/last month
  let vehicleUpfront: number;
  switch (vehicleConfig.financingMode) {
    case "cash":
      vehicleUpfront = vehicleCapital;
      break;
    case "loan":
      vehicleUpfront = vehicleConfig.loanDetails.downPayment;
      break;
    case "lease":
      vehicleUpfront = vehicleConfig.leaseDetails.monthlyLease * 2; // First + security
      break;
    default:
      vehicleUpfront = vehicleCapital;
  }

  return vehicleUpfront + solarCapital;
}

/**
 * Calculate break-even analysis
 */
export function calculateBreakEven(
  totalInvestment: number,
  monthlyProfit: number,
  projectionMonths: number = 60
): BreakEvenAnalysis {
  const cumulativeInvestment: number[] = [];
  const cumulativeProfit: number[] = [];
  let breakEvenMonth: number | null = null;

  for (let month = 0; month <= projectionMonths; month++) {
    cumulativeInvestment.push(totalInvestment);
    const profit = monthlyProfit * month;
    cumulativeProfit.push(profit);

    if (breakEvenMonth === null && profit >= totalInvestment) {
      breakEvenMonth = month;
    }
  }

  const breakEvenMonths =
    monthlyProfit > 0 ? totalInvestment / monthlyProfit : Infinity;

  return {
    totalInvestment,
    monthlyProfit,
    breakEvenMonths: breakEvenMonths === Infinity ? -1 : breakEvenMonths,
    cumulativeInvestment,
    cumulativeProfit,
    breakEvenMonth,
  };
}

/**
 * Create scenario summary
 */
export function createScenarioSummary(
  name: string,
  monthlyCosts: MonthlyCosts,
  monthlyRevenue: MonthlyRevenue,
  totalInvestment: number,
  solarEnabled: boolean
): ScenarioSummary {
  const monthlyProfit = monthlyRevenue.totalMonthlyRevenue - monthlyCosts.totalMonthlyCost;
  const breakEvenMonths =
    monthlyProfit > 0 ? totalInvestment / monthlyProfit : null;

  return {
    name,
    monthlyRevenue: monthlyRevenue.totalMonthlyRevenue,
    monthlyCosts: monthlyCosts.totalMonthlyCost,
    monthlyProfit,
    totalInvestment,
    breakEvenMonths,
    solarEnabled,
  };
}

/**
 * Calculate scenario comparison (Vehicles Only vs Vehicles + Solar)
 */
export function calculateScenarioComparison(
  vehicleConfig: VehicleConfig,
  revenueConfig: RevenueConfig,
  solarConfig: SolarConfig,
  energyConfig: EnergyConfig
): ScenarioComparison {
  const energyRate = getEffectiveEnergyRate(energyConfig);

  // Scenario 1: Vehicles Only (no solar)
  const noSolarConfig: SolarConfig = { ...solarConfig, enabled: false };
  const vehicleCostsNoSolar = calculateVehicleCosts(vehicleConfig, energyRate);
  const revenueCalc = calculateRevenue(revenueConfig, vehicleConfig.quantity);
  const energyNoSolar = calculateEnergyBalance(
    revenueCalc.totalMiles,
    vehicleConfig.vehicle.efficiencyMiPerKwh,
    noSolarConfig,
    energyConfig
  );
  const solarCostsNoSolar = calculateSolarCost(noSolarConfig);
  const monthlyCostsNoSolar = calculateMonthlyCosts(
    vehicleConfig,
    vehicleCostsNoSolar,
    revenueConfig,
    noSolarConfig,
    solarCostsNoSolar,
    energyNoSolar,
    revenueCalc
  );
  const monthlyRevenueNoSolar = calculateMonthlyRevenue(revenueCalc, energyNoSolar);
  const investmentNoSolar = calculateTotalInvestment(
    vehicleConfig,
    noSolarConfig,
    solarCostsNoSolar
  );

  // Scenario 2: Vehicles + Solar
  const withSolarConfig: SolarConfig = { ...solarConfig, enabled: true };
  const vehicleCostsWithSolar = calculateVehicleCosts(vehicleConfig, energyRate);
  const energyWithSolar = calculateEnergyBalance(
    revenueCalc.totalMiles,
    vehicleConfig.vehicle.efficiencyMiPerKwh,
    withSolarConfig,
    energyConfig
  );
  const solarCostsWithSolar = calculateSolarCost(withSolarConfig);
  const monthlyCostsWithSolar = calculateMonthlyCosts(
    vehicleConfig,
    vehicleCostsWithSolar,
    revenueConfig,
    withSolarConfig,
    solarCostsWithSolar,
    energyWithSolar,
    revenueCalc
  );
  const monthlyRevenueWithSolar = calculateMonthlyRevenue(revenueCalc, energyWithSolar);
  const investmentWithSolar = calculateTotalInvestment(
    vehicleConfig,
    withSolarConfig,
    solarCostsWithSolar
  );

  return {
    vehiclesOnly: createScenarioSummary(
      "Vehicles Only",
      monthlyCostsNoSolar,
      monthlyRevenueNoSolar,
      investmentNoSolar,
      false
    ),
    vehiclesPlusSolar: createScenarioSummary(
      "Vehicles + Solar",
      monthlyCostsWithSolar,
      monthlyRevenueWithSolar,
      investmentWithSolar,
      true
    ),
  };
}

/**
 * Format currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number with commas
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
