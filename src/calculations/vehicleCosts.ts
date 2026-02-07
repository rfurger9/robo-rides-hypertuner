import {
  VehicleConfig,
  VehicleCostCalculation,
  FinancingMode,
} from "@/types/vehicle";

/**
 * Calculate the total capital cost for vehicles
 */
export function calculateVehicleCapitalCost(config: VehicleConfig): number {
  const { capitalCosts, quantity } = config;
  const perVehicle =
    capitalCosts.purchasePrice +
    capitalCosts.taxesFees +
    capitalCosts.avHardwareRetrofit +
    capitalCosts.brandingWrap +
    capitalCosts.initialAccessories;

  return perVehicle * quantity;
}

/**
 * Calculate monthly loan payment using standard amortization formula
 */
export function calculateMonthlyLoanPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return payment;
}

/**
 * Calculate monthly financing payment based on mode
 */
export function calculateMonthlyPayment(config: VehicleConfig): number {
  const { financingMode, loanDetails, leaseDetails, capitalCosts, quantity } =
    config;

  switch (financingMode) {
    case "cash":
      return 0; // No monthly payment for cash

    case "loan":
      const loanPrincipal =
        (capitalCosts.purchasePrice + capitalCosts.taxesFees) * quantity -
        loanDetails.downPayment;
      return calculateMonthlyLoanPayment(
        loanPrincipal,
        loanDetails.interestRateApr,
        loanDetails.loanTermMonths
      );

    case "lease":
      return leaseDetails.monthlyLease * quantity;

    default:
      return 0;
  }
}

/**
 * Calculate monthly depreciation
 */
export function calculateMonthlyDepreciation(config: VehicleConfig): number {
  const { vehicle, quantity, depreciationYears } = config;
  const totalMsrp = vehicle.msrp * quantity;
  return totalMsrp / (depreciationYears * 12);
}

/**
 * Calculate monthly fixed operating costs
 */
export function calculateMonthlyFixedCost(config: VehicleConfig): number {
  const { operatingCosts, quantity } = config;

  const perVehicle =
    operatingCosts.insuranceMonthly +
    operatingCosts.connectivityMonthly +
    operatingCosts.softwareSubscription +
    operatingCosts.parkingMonthly +
    operatingCosts.registrationAnnual / 12 +
    operatingCosts.cleaningPerDay * 30; // Assuming 30 days/month

  return perVehicle * quantity;
}

/**
 * Calculate variable cost per mile
 */
export function calculateCostPerMile(
  config: VehicleConfig,
  energyRatePerKwh: number
): number {
  const { vehicle, operatingCosts } = config;

  const energyCostPerMile = energyRatePerKwh / vehicle.efficiencyMiPerKwh;
  return operatingCosts.maintenancePerMile + energyCostPerMile;
}

/**
 * Calculate all vehicle costs
 */
export function calculateVehicleCosts(
  config: VehicleConfig,
  energyRatePerKwh: number
): VehicleCostCalculation {
  const totalCapitalCost = calculateVehicleCapitalCost(config);
  const monthlyFixedCost = calculateMonthlyFixedCost(config);
  const costPerMile = calculateCostPerMile(config, energyRatePerKwh);
  const depreciationMonthly = calculateMonthlyDepreciation(config);
  const monthlyPayment = calculateMonthlyPayment(config);

  // For cash purchases, amortized capital = depreciation
  // For loans/leases, it's the monthly payment
  const amortizedCapitalMonthly =
    config.financingMode === "cash" ? depreciationMonthly : monthlyPayment;

  const totalMonthlyVehicleCost =
    monthlyFixedCost +
    amortizedCapitalMonthly +
    (config.financingMode === "cash" ? 0 : depreciationMonthly);

  return {
    totalCapitalCost,
    monthlyFixedCost,
    costPerMile,
    amortizedCapitalMonthly,
    depreciationMonthly,
    monthlyPayment,
    totalMonthlyVehicleCost,
  };
}
