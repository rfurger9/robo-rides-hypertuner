import {
  HumanoidConfig,
  HumanoidCalculation,
  LaborComparison,
  HumanoidPlatform,
  HUMANOID_PLATFORMS,
  getPlatformById,
} from "@/types/humanoid";

/**
 * Calculate total capital cost for a platform selection
 */
export function calculatePlatformCapitalCost(
  platform: HumanoidPlatform,
  quantity: number,
  config: HumanoidConfig
): number {
  const baseUnitCost = platform.estimatedMsrp;
  const additionalCosts =
    config.customizationCost +
    config.chargingStationCost +
    config.safetySystemsCost +
    config.installationCost;

  return (baseUnitCost + additionalCosts) * quantity;
}

/**
 * Calculate monthly operating cost for a platform selection
 */
export function calculatePlatformOperatingCost(
  quantity: number,
  config: HumanoidConfig
): number {
  const perUnitCost =
    config.energyCostMonthly +
    config.maintenanceCostMonthly +
    config.partsCostMonthly +
    config.softwareCostMonthly +
    config.insuranceCostMonthly;

  return perUnitCost * quantity;
}

/**
 * Calculate monthly lease cost for a platform selection
 */
export function calculatePlatformLeaseCost(
  platform: HumanoidPlatform,
  quantity: number,
  config: HumanoidConfig
): number {
  // Lease includes base lease plus operating costs
  const operatingCost = calculatePlatformOperatingCost(quantity, config);
  return platform.monthlyLeaseEstimate * quantity + operatingCost;
}

/**
 * Calculate weekly coverage hours for a platform
 */
export function calculateWeeklyCoverageHours(
  platform: HumanoidPlatform,
  quantity: number
): number {
  // Assume robots can work while charging (with rotation)
  // Runtime + charging time = cycle time
  const cycleTime = platform.runtimeHours + platform.chargeTimeHours;
  const cyclesPerDay = 24 / cycleTime;
  const hoursPerDay = cyclesPerDay * platform.runtimeHours;

  // With multiple units, coverage can be staggered
  return hoursPerDay * 7 * quantity;
}

/**
 * Calculate human labor annual cost
 */
export function calculateHumanLaborCost(config: HumanoidConfig): number {
  const annualHours = 2080; // 40 hours × 52 weeks
  const baseCost = config.humanHourlyWage * annualHours;
  const withBenefits = baseCost * (1 + config.humanBenefitsPercent / 100);

  return withBenefits * config.humanFteCount;
}

/**
 * Calculate labor comparison between humans and humanoids
 */
export function calculateLaborComparison(
  config: HumanoidConfig
): LaborComparison {
  // Human costs
  const humanAnnualCostPerFte =
    config.humanHourlyWage * 2080 * (1 + config.humanBenefitsPercent / 100);
  const humanTotalAnnualCost = humanAnnualCostPerFte * config.humanFteCount;
  const humanWeeklyCoverageHours = config.humanWeeklyHours * config.humanFteCount;

  // Humanoid costs
  let humanoidQuantity = 0;
  let humanoidCapitalTotal = 0;
  let humanoidAnnualOperating = 0;
  let humanoidWeeklyCoverageHours = 0;

  for (const selection of config.platforms) {
    const platform = getPlatformById(selection.platformId);
    if (!platform) continue;

    humanoidQuantity += selection.quantity;

    if (selection.acquisitionType === "purchase") {
      humanoidCapitalTotal += calculatePlatformCapitalCost(
        platform,
        selection.quantity,
        config
      );
      humanoidAnnualOperating +=
        calculatePlatformOperatingCost(selection.quantity, config) * 12;
    } else {
      // Lease includes operating costs
      humanoidAnnualOperating +=
        calculatePlatformLeaseCost(platform, selection.quantity, config) * 12;
    }

    humanoidWeeklyCoverageHours += calculateWeeklyCoverageHours(
      platform,
      selection.quantity
    );
  }

  const humanoidAnnualCapital =
    humanoidCapitalTotal / (config.depreciationYears || 5);
  const humanoidAnnualCost = humanoidAnnualCapital + humanoidAnnualOperating;

  // Comparison metrics
  const annualSavings = humanTotalAnnualCost - humanoidAnnualCost;
  const monthlySavings = annualSavings / 12;

  const coverageMultiplier =
    humanWeeklyCoverageHours > 0
      ? humanoidWeeklyCoverageHours / humanWeeklyCoverageHours
      : 0;

  const paybackMonths =
    annualSavings > 0 ? (humanoidCapitalTotal / annualSavings) * 12 : Infinity;

  const costPerHourHuman =
    humanWeeklyCoverageHours > 0
      ? humanTotalAnnualCost / (humanWeeklyCoverageHours * 52)
      : 0;

  const costPerHourHumanoid =
    humanoidWeeklyCoverageHours > 0
      ? humanoidAnnualCost / (humanoidWeeklyCoverageHours * 52)
      : 0;

  return {
    humanAnnualCostPerFte,
    humanTotalAnnualCost,
    humanWeeklyCoverageHours,
    humanoidQuantity,
    humanoidCapitalTotal,
    humanoidAnnualCapital,
    humanoidAnnualOperating,
    humanoidWeeklyCoverageHours,
    humanoidAnnualCost,
    annualSavings,
    monthlySavings,
    coverageMultiplier,
    paybackMonths,
    costPerHourHuman,
    costPerHourHumanoid,
  };
}

/**
 * Calculate comprehensive humanoid costs and metrics
 */
export function calculateHumanoidEconomics(
  config: HumanoidConfig,
  fleetSize: number = 1
): HumanoidCalculation {
  if (!config.enabled) {
    return getEmptyHumanoidCalculation();
  }

  // Calculate labor comparison even if no platforms selected
  const laborComparison = calculateLaborComparison(config);

  if (config.platforms.length === 0) {
    return {
      totalPlatforms: 0,
      totalCapitalCost: 0,
      totalMonthlyOperating: 0,
      monthlyAmortizedCapital: 0,
      totalMonthlyCost: 0,
      totalWeeklyCoverageHours: 0,
      coveragePerVehicle: 0,
      laborComparison,
    };
  }

  let totalPlatforms = 0;
  let totalCapitalCost = 0;
  let totalMonthlyOperating = 0;
  let totalWeeklyCoverageHours = 0;

  for (const selection of config.platforms) {
    const platform = getPlatformById(selection.platformId);
    if (!platform) continue;

    totalPlatforms += selection.quantity;

    if (selection.acquisitionType === "purchase") {
      totalCapitalCost += calculatePlatformCapitalCost(
        platform,
        selection.quantity,
        config
      );
      totalMonthlyOperating += calculatePlatformOperatingCost(
        selection.quantity,
        config
      );
    } else {
      totalMonthlyOperating += calculatePlatformLeaseCost(
        platform,
        selection.quantity,
        config
      );
    }

    totalWeeklyCoverageHours += calculateWeeklyCoverageHours(
      platform,
      selection.quantity
    );
  }

  const monthlyAmortizedCapital =
    totalCapitalCost / ((config.depreciationYears || 5) * 12);
  const totalMonthlyCost = monthlyAmortizedCapital + totalMonthlyOperating;
  const coveragePerVehicle =
    fleetSize > 0 ? totalWeeklyCoverageHours / fleetSize : 0;

  return {
    totalPlatforms,
    totalCapitalCost,
    totalMonthlyOperating,
    monthlyAmortizedCapital,
    totalMonthlyCost,
    totalWeeklyCoverageHours,
    coveragePerVehicle,
    laborComparison,
  };
}

/**
 * Get empty humanoid calculation object
 */
function getEmptyHumanoidCalculation(): HumanoidCalculation {
  return {
    totalPlatforms: 0,
    totalCapitalCost: 0,
    totalMonthlyOperating: 0,
    monthlyAmortizedCapital: 0,
    totalMonthlyCost: 0,
    totalWeeklyCoverageHours: 0,
    coveragePerVehicle: 0,
    laborComparison: {
      humanAnnualCostPerFte: 0,
      humanTotalAnnualCost: 0,
      humanWeeklyCoverageHours: 0,
      humanoidQuantity: 0,
      humanoidCapitalTotal: 0,
      humanoidAnnualCapital: 0,
      humanoidAnnualOperating: 0,
      humanoidWeeklyCoverageHours: 0,
      humanoidAnnualCost: 0,
      annualSavings: 0,
      monthlySavings: 0,
      coverageMultiplier: 0,
      paybackMonths: Infinity,
      costPerHourHuman: 0,
      costPerHourHumanoid: 0,
    },
  };
}

/**
 * Calculate recommended robot count based on fleet size
 */
export function calculateRecommendedRobots(
  fleetSize: number,
  operatingHoursPerDay: number = 12
): { recommended: number; coverage: string } {
  // Rough heuristic: 1 robot per 8-10 vehicles for basic operations
  // Adjust based on operating hours
  const baseRatio = 0.12; // 12% of fleet size
  const hoursMultiplier = operatingHoursPerDay / 12;

  const recommended = Math.ceil(fleetSize * baseRatio * hoursMultiplier);

  let coverage = "Basic";
  if (recommended >= fleetSize * 0.2) {
    coverage = "Comprehensive";
  } else if (recommended >= fleetSize * 0.15) {
    coverage = "Standard";
  }

  return { recommended, coverage };
}

/**
 * Calculate break-even point for humanoid investment
 */
export function calculateBreakEvenAnalysis(
  config: HumanoidConfig,
  months: number = 60
): { month: number; humanCumulative: number; humanoidCumulative: number }[] {
  const laborComparison = calculateLaborComparison(config);
  const analysis: {
    month: number;
    humanCumulative: number;
    humanoidCumulative: number;
  }[] = [];

  const monthlyHumanCost = laborComparison.humanTotalAnnualCost / 12;
  const monthlyHumanoidCost = laborComparison.humanoidAnnualCost / 12;

  for (let month = 0; month <= months; month++) {
    const humanCumulative = monthlyHumanCost * month;
    // Humanoid includes upfront capital
    const humanoidCumulative =
      laborComparison.humanoidCapitalTotal + monthlyHumanoidCost * month;

    analysis.push({
      month,
      humanCumulative,
      humanoidCumulative,
    });
  }

  return analysis;
}
