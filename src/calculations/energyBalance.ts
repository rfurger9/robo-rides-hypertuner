import { SolarConfig, SolarCostCalculation, MONTHLY_SOLAR_FACTORS } from "@/types/solar";
import { EnergyConfig, EnergyCalculation, MonthlyEnergyData } from "@/types/energy";
import { BatteryConfig, BatteryCostCalculation } from "@/types/battery";

/**
 * Calculate vehicle energy need in kWh
 */
export function calculateVehicleEnergyNeed(
  totalMiles: number,
  efficiencyMiPerKwh: number
): number {
  return totalMiles / efficiencyMiPerKwh;
}

/**
 * Calculate monthly solar generation (simple model for MVP)
 * Uses 1,500 kWh per kW installed as annual average
 */
export function calculateMonthlySolarGeneration(
  systemSizeKw: number,
  month?: number
): number {
  // Monthly variation factors (normalized, higher in summer)
  const monthlyFactors = [
    0.06, // Jan
    0.07, // Feb
    0.09, // Mar
    0.10, // Apr
    0.11, // May
    0.11, // Jun
    0.11, // Jul
    0.10, // Aug
    0.09, // Sep
    0.08, // Oct
    0.06, // Nov
    0.05, // Dec
  ];

  const annualKwh = systemSizeKw * 1500; // Default; overridden by config.annualProductionFactor when available

  if (month !== undefined && month >= 0 && month < 12) {
    return annualKwh * monthlyFactors[month];
  }

  // Return average monthly
  return annualKwh / 12;
}

/**
 * Calculate solar installation cost
 */
export function calculateSolarCost(config: SolarConfig): SolarCostCalculation {
  const grossCost =
    config.systemSizeKw * config.costPerWatt * 1000 + config.permitFees;
  const federalCredit = grossCost * config.federalItcPercent;
  const netCost = grossCost - federalCredit - config.stateRebate;

  // Amortize over configured years (typical solar warranty period)
  const monthlyAmortizedCost = netCost / (config.amortizationYears * 12);

  return {
    grossCost,
    federalCredit,
    netCost,
    monthlyAmortizedCost,
  };
}

/**
 * Calculate energy rate based on config
 * For MVP, only flat rate is supported
 */
export function getEffectiveEnergyRate(config: EnergyConfig): number {
  if (config.rateMode === "flat") {
    return config.flatRate.ratePerKwh;
  }

  // For TOU, return weighted average (simplified)
  // Assuming 6h off-peak, 10h partial-peak, 5h on-peak, 3h remainder
  const offPeakWeight = 6 / 24;
  const partialPeakWeight = 13 / 24;
  const onPeakWeight = 5 / 24;

  return (
    config.touRate.offPeakRate * offPeakWeight +
    config.touRate.partialPeakRate * partialPeakWeight +
    config.touRate.onPeakRate * onPeakWeight
  );
}

/**
 * Calculate battery installation cost
 */
export function calculateBatteryCost(config: BatteryConfig): BatteryCostCalculation {
  const totalCost = config.unitCostInstalled * config.quantity;
  const totalCapacity = config.capacityKwh * config.quantity;
  const usableCapacity = totalCapacity * config.roundTripEfficiency;

  // Amortize over configured years (typical battery warranty)
  const monthlyAmortizedCost = totalCost / (config.amortizationYears * 12);

  // Estimated daily cycle value from TOU arbitrage (simplified)
  const dailyCycleValue = usableCapacity * 0.15 * config.arbitrageUtilization;

  return {
    totalCapacity,
    usableCapacity,
    totalCost,
    monthlyAmortizedCost,
    dailyCycleValue,
  };
}

/**
 * Calculate TOU arbitrage value for battery
 */
export function calculateTOUArbitrageValue(
  batteryConfig: BatteryConfig,
  energyConfig: EnergyConfig
): { dailyValue: number; monthlyValue: number } {
  if (!batteryConfig.enabled || batteryConfig.strategy !== "tou_arbitrage") {
    return { dailyValue: 0, monthlyValue: 0 };
  }

  if (energyConfig.rateMode !== "tou") {
    return { dailyValue: 0, monthlyValue: 0 };
  }

  const usableCapacity =
    batteryConfig.capacityKwh *
    batteryConfig.quantity *
    batteryConfig.roundTripEfficiency;

  const rateSpread = energyConfig.touRate.onPeakRate - energyConfig.touRate.offPeakRate;

  // Use configured utilization for arbitrage
  const dailyValue = usableCapacity * rateSpread * batteryConfig.arbitrageUtilization;
  const monthlyValue = dailyValue * 30;

  return { dailyValue, monthlyValue };
}

/**
 * Calculate self-consumption value for battery
 * Stores excess solar during day, uses at night
 */
export function calculateSelfConsumptionValue(
  batteryConfig: BatteryConfig,
  solarConfig: SolarConfig,
  energyConfig: EnergyConfig,
  monthlyVehicleKwh: number
): { monthlyStoredKwh: number; monthlySavings: number } {
  if (!batteryConfig.enabled || batteryConfig.strategy !== "self_consumption") {
    return { monthlyStoredKwh: 0, monthlySavings: 0 };
  }

  if (!solarConfig.enabled) {
    return { monthlyStoredKwh: 0, monthlySavings: 0 };
  }

  const monthlySolarKwh = calculateMonthlySolarGeneration(solarConfig.systemSizeKw);
  const usableCapacity =
    batteryConfig.capacityKwh *
    batteryConfig.quantity *
    batteryConfig.roundTripEfficiency;

  // Excess solar that could be stored
  const monthlyExcessSolar = Math.max(0, monthlySolarKwh - monthlyVehicleKwh * 0.5);

  // Limited by battery capacity (assume daily cycling for 30 days)
  const monthlyStorableKwh = usableCapacity * 30;
  const monthlyStoredKwh = Math.min(monthlyExcessSolar, monthlyStorableKwh);

  // Value is based on avoided grid import rate
  const effectiveRate = getEffectiveEnergyRate(energyConfig);
  const monthlySavings = monthlyStoredKwh * effectiveRate;

  return { monthlyStoredKwh, monthlySavings };
}

/**
 * Calculate complete energy balance with battery
 */
export function calculateEnergyBalance(
  totalMiles: number,
  efficiencyMiPerKwh: number,
  solarConfig: SolarConfig,
  energyConfig: EnergyConfig,
  batteryConfig?: BatteryConfig
): EnergyCalculation {
  const monthlyVehicleKwh = calculateVehicleEnergyNeed(
    totalMiles,
    efficiencyMiPerKwh
  );

  const monthlySolarKwh = solarConfig.enabled
    ? calculateMonthlySolarGeneration(solarConfig.systemSizeKw)
    : 0;

  const effectiveRate = getEffectiveEnergyRate(energyConfig);

  // Battery calculations
  let batteryCapacityKwh = 0;
  let batteryUsableKwh = 0;
  let monthlyBatteryChargeKwh = 0;
  let monthlyBatteryDischargeKwh = 0;
  let monthlyBatterySavings = 0;
  let monthlyBatteryAmortizedCost = 0;

  if (batteryConfig?.enabled) {
    const batteryCost = calculateBatteryCost(batteryConfig);
    batteryCapacityKwh = batteryCost.totalCapacity;
    batteryUsableKwh = batteryCost.usableCapacity;
    monthlyBatteryAmortizedCost = batteryCost.monthlyAmortizedCost;

    if (batteryConfig.strategy === "tou_arbitrage") {
      const arbitrageValue = calculateTOUArbitrageValue(batteryConfig, energyConfig);
      monthlyBatterySavings = arbitrageValue.monthlyValue;
      // Battery cycles daily for arbitrage
      monthlyBatteryChargeKwh = batteryUsableKwh * 30 * batteryConfig.arbitrageUtilization;
      monthlyBatteryDischargeKwh = monthlyBatteryChargeKwh * batteryConfig.roundTripEfficiency;
    } else if (batteryConfig.strategy === "self_consumption") {
      const selfConsumption = calculateSelfConsumptionValue(
        batteryConfig,
        solarConfig,
        energyConfig,
        monthlyVehicleKwh
      );
      monthlyBatterySavings = selfConsumption.monthlySavings;
      monthlyBatteryChargeKwh = selfConsumption.monthlyStoredKwh;
      monthlyBatteryDischargeKwh = monthlyBatteryChargeKwh * batteryConfig.roundTripEfficiency;
    }
    // backup_only strategy: no regular cycling, no savings
  }

  // Adjust grid import based on battery
  let adjustedGridImport = monthlyVehicleKwh;
  let solarUsed = 0;

  if (solarConfig.enabled) {
    // Solar directly offsets vehicle needs
    solarUsed = Math.min(monthlyVehicleKwh, monthlySolarKwh);
    adjustedGridImport = monthlyVehicleKwh - solarUsed;
  }

  // Battery discharge further reduces grid import
  if (batteryConfig?.enabled && batteryConfig.strategy !== "backup_only") {
    adjustedGridImport = Math.max(0, adjustedGridImport - monthlyBatteryDischargeKwh);
  }

  const monthlyGridImportKwh = adjustedGridImport;

  // Excess solar after vehicle and battery charging
  const totalSolarUsed = solarUsed + monthlyBatteryChargeKwh;
  const monthlyExcessSolarKwh = Math.max(0, monthlySolarKwh - totalSolarUsed);

  // Grid cost
  const monthlyGridCost = monthlyGridImportKwh * effectiveRate;

  // Export credit (if net metering enabled)
  const monthlyExportCredit =
    energyConfig.netMetering.enabled && solarConfig.enabled
      ? monthlyExcessSolarKwh *
        effectiveRate *
        energyConfig.netMetering.exportRatePercent
      : 0;

  // Net energy cost (includes battery amortization but offset by savings)
  const monthlyNetEnergyCost =
    monthlyGridCost -
    monthlyExportCredit +
    monthlyBatteryAmortizedCost -
    monthlyBatterySavings;

  return {
    monthlyVehicleKwh,
    monthlySolarKwh,
    monthlyGridImportKwh,
    monthlyExcessSolarKwh,
    monthlyGridCost,
    monthlyExportCredit,
    monthlyNetEnergyCost,
    batteryCapacityKwh,
    batteryUsableKwh,
    monthlyBatteryChargeKwh,
    monthlyBatteryDischargeKwh,
    monthlyBatterySavings,
    monthlyBatteryAmortizedCost,
  };
}

/**
 * Calculate monthly energy data for chart visualization
 */
export function calculateMonthlyEnergyData(
  totalMiles: number,
  efficiencyMiPerKwh: number,
  solarConfig: SolarConfig,
  energyConfig: EnergyConfig,
  batteryConfig?: BatteryConfig
): MonthlyEnergyData[] {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const annualVehicleKwh = calculateVehicleEnergyNeed(totalMiles, efficiencyMiPerKwh);
  const monthlyVehicleKwh = annualVehicleKwh; // Assume constant monthly vehicle usage

  const annualSolarKwh = solarConfig.enabled
    ? solarConfig.annualOutputKwh
    : 0;

  const usableBatteryKwh = batteryConfig?.enabled
    ? batteryConfig.capacityKwh * batteryConfig.quantity * batteryConfig.roundTripEfficiency
    : 0;

  return monthNames.map((month, index) => {
    const solarGeneration = annualSolarKwh * MONTHLY_SOLAR_FACTORS[index];
    const vehicleConsumption = monthlyVehicleKwh;

    // Calculate battery charge/discharge based on strategy
    let batteryCharge = 0;
    let batteryDischarge = 0;

    if (batteryConfig?.enabled && batteryConfig.strategy !== "backup_only") {
      if (batteryConfig.strategy === "self_consumption") {
        // Charge from excess solar
        const excessSolar = Math.max(0, solarGeneration - vehicleConsumption * 0.5);
        batteryCharge = Math.min(excessSolar, usableBatteryKwh * 30);
        batteryDischarge = batteryCharge * batteryConfig.roundTripEfficiency;
      } else if (batteryConfig.strategy === "tou_arbitrage") {
        // Daily cycling for arbitrage
        batteryCharge = usableBatteryKwh * 30 * (batteryConfig?.arbitrageUtilization ?? 0.8);
        batteryDischarge = batteryCharge * batteryConfig.roundTripEfficiency;
      }
    }

    // Grid import: what we need minus solar and battery
    const solarUsed = Math.min(vehicleConsumption, solarGeneration);
    const gridImport = Math.max(0, vehicleConsumption - solarUsed - batteryDischarge);

    // Grid export: excess solar after charging battery
    const gridExport = Math.max(0, solarGeneration - solarUsed - batteryCharge);

    return {
      month,
      solarGeneration: Math.round(solarGeneration),
      vehicleConsumption: Math.round(vehicleConsumption),
      gridImport: Math.round(gridImport),
      gridExport: Math.round(gridExport),
      batteryCharge: Math.round(batteryCharge),
      batteryDischarge: Math.round(batteryDischarge),
    };
  });
}
