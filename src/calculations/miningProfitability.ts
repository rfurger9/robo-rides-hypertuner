import {
  MiningConfig,
  MiningRevenue,
  NetworkStats,
  CryptoPrices,
  ASIC_MINERS,
  GPU_MINERS,
  COOLING_PRESETS,
  ASICMiner,
  GPUMiner,
} from "@/types/mining";
import { EnergyConfig } from "@/types/energy";
import { SolarConfig } from "@/types/solar";
import { BatteryConfig } from "@/types/battery";

// Default network stats (fallback)
const DEFAULT_NETWORK_STATS: NetworkStats = {
  networkHashrateEh: 600, // ~600 EH/s
  difficulty: 88e12,
  blockReward: 3.125, // Post-2024 halving
  avgBlockTimeSeconds: 600,
  nextDifficultyAdjustmentPercent: 0,
};

// Default crypto prices (fallback)
const DEFAULT_PRICES: CryptoPrices = {
  bitcoin: 67000,
  litecoin: 85,
  ravencoin: 0.025,
  ergo: 1.5,
  flux: 0.5,
  lastUpdated: new Date(),
};

/**
 * Get ASIC miner by ID
 */
export function getASICMiner(id: string): ASICMiner | undefined {
  return ASIC_MINERS.find((m) => m.id === id);
}

/**
 * Get GPU miner by ID
 */
export function getGPUMiner(id: string): GPUMiner | undefined {
  return GPU_MINERS.find((m) => m.id === id);
}

/**
 * Calculate total ASIC hashrate in TH/s
 */
export function calculateASICHashrate(config: MiningConfig): number {
  const miner = getASICMiner(config.asicModel);
  if (!miner) return 0;

  const baseHashrate = miner.hashrateTh * config.asicQuantity;
  const overclockMultiplier = 1 + config.asicOverclockPercent / 100;

  return baseHashrate * overclockMultiplier;
}

/**
 * Calculate total ASIC power consumption in watts
 */
export function calculateASICPower(config: MiningConfig): number {
  const miner = getASICMiner(config.asicModel);
  if (!miner) return 0;

  const basePower = miner.powerWatts * config.asicQuantity;
  // Overclocking increases power more than proportionally
  const overclockMultiplier = 1 + (config.asicOverclockPercent / 100) * 1.3;

  return basePower * overclockMultiplier;
}

/**
 * Calculate total GPU hashrate in MH/s for the selected algorithm
 */
export function calculateGPUHashrate(config: MiningConfig): number {
  if (!config.gpuEnabled) return 0;

  const gpu = getGPUMiner(config.gpuModel);
  if (!gpu) return 0;

  const totalGpus = config.gpuQuantity * config.gpuRigCount;

  if (config.gpuAlgorithm === "kawpow") {
    return gpu.hashrateKawpowMh * totalGpus;
  } else if (config.gpuAlgorithm === "autolykos") {
    return gpu.hashrateAutolykosMh * totalGpus;
  }

  return gpu.hashrateKawpowMh * totalGpus;
}

/**
 * Calculate total GPU power consumption in watts
 */
export function calculateGPUPower(config: MiningConfig): number {
  if (!config.gpuEnabled) return 0;

  const gpu = getGPUMiner(config.gpuModel);
  if (!gpu) return 0;

  const totalGpus = config.gpuQuantity * config.gpuRigCount;
  // Add rig overhead (motherboard, PSU efficiency loss, etc.)
  const rigOverheadWatts = 100 * config.gpuRigCount;

  return gpu.powerWattsMining * totalGpus + rigOverheadWatts;
}

/**
 * Calculate cooling power requirement
 */
export function calculateCoolingPower(config: MiningConfig): number {
  const cooling = COOLING_PRESETS[config.coolingType];
  return cooling?.powerWatts || config.coolingPowerWatts;
}

/**
 * Calculate total power consumption (ASIC + GPU + Cooling)
 */
export function calculateTotalPower(config: MiningConfig): number {
  if (!config.enabled) return 0;

  return (
    calculateASICPower(config) +
    calculateGPUPower(config) +
    calculateCoolingPower(config)
  );
}

/**
 * Calculate daily energy consumption in kWh
 */
export function calculateDailyEnergyKwh(
  config: MiningConfig,
  hoursPerDay: number = 24
): number {
  const totalWatts = calculateTotalPower(config);
  return (totalWatts / 1000) * hoursPerDay;
}

/**
 * Calculate monthly energy consumption in kWh
 */
export function calculateMonthlyEnergyKwh(
  config: MiningConfig,
  hoursPerDay: number = 24
): number {
  return calculateDailyEnergyKwh(config, hoursPerDay) * 30;
}

/**
 * Calculate Bitcoin mining revenue
 */
export function calculateBTCRevenue(
  config: MiningConfig,
  networkStats: NetworkStats = DEFAULT_NETWORK_STATS,
  btcPrice: number = DEFAULT_PRICES.bitcoin
): { dailyBtc: number; dailyUsd: number; monthlyUsd: number } {
  const minerHashrateTh = calculateASICHashrate(config);
  if (minerHashrateTh === 0) {
    return { dailyBtc: 0, dailyUsd: 0, monthlyUsd: 0 };
  }

  // Network hashrate in TH/s
  const networkHashrateTh = networkStats.networkHashrateEh * 1e6;

  // Miner's share of network
  const minerShare = minerHashrateTh / networkHashrateTh;

  // Blocks per day
  const blocksPerDay = 86400 / networkStats.avgBlockTimeSeconds;

  // Daily BTC produced by network
  const dailyBtcNetwork = blocksPerDay * networkStats.blockReward;

  // Miner's gross daily BTC
  const dailyBtcGross = dailyBtcNetwork * minerShare;

  // After pool fee
  const dailyBtcNet = dailyBtcGross * (1 - config.poolFeePercent / 100);

  // USD values
  const dailyUsd = dailyBtcNet * btcPrice;
  const monthlyUsd = dailyUsd * 30;

  return {
    dailyBtc: dailyBtcNet,
    dailyUsd,
    monthlyUsd,
  };
}

/**
 * Calculate altcoin (GPU) mining revenue
 * Simplified calculation - actual profitability varies significantly
 */
export function calculateAltcoinRevenue(
  config: MiningConfig,
  prices: CryptoPrices = DEFAULT_PRICES
): { dailyUsd: number; monthlyUsd: number } {
  if (!config.gpuEnabled) {
    return { dailyUsd: 0, monthlyUsd: 0 };
  }

  const hashrateMh = calculateGPUHashrate(config);
  const powerKw = calculateGPUPower(config) / 1000;

  // Rough revenue per MH/s per day (varies by coin and network)
  // These are approximate values and should be updated with real API data
  let revenuePerMhPerDay = 0;

  switch (config.gpuTargetCoin) {
    case "RVN":
      // Ravencoin: ~$0.005-0.01 per MH/s/day at current rates
      revenuePerMhPerDay = 0.007 * (prices.ravencoin / 0.025);
      break;
    case "ERGO":
      // Ergo: ~$0.003-0.005 per MH/s/day
      revenuePerMhPerDay = 0.004 * (prices.ergo / 1.5);
      break;
    case "FLUX":
      // Flux: ~$0.004-0.006 per MH/s/day
      revenuePerMhPerDay = 0.005 * (prices.flux / 0.5);
      break;
    default:
      revenuePerMhPerDay = 0.005;
  }

  const dailyUsd = hashrateMh * revenuePerMhPerDay * (1 - config.poolFeePercent / 100);
  const monthlyUsd = dailyUsd * 30;

  return { dailyUsd, monthlyUsd };
}

/**
 * Calculate hardware costs
 */
export function calculateHardwareCost(config: MiningConfig): number {
  let total = 0;

  // ASIC cost
  const asic = getASICMiner(config.asicModel);
  if (asic) {
    total += asic.msrpUsd * config.asicQuantity;
  }

  // GPU cost
  if (config.gpuEnabled) {
    const gpu = getGPUMiner(config.gpuModel);
    if (gpu) {
      const totalGpus = config.gpuQuantity * config.gpuRigCount;
      total += gpu.msrpUsd * totalGpus;
      // Add rig cost (motherboard, PSU, frame, etc.)
      total += 500 * config.gpuRigCount;
    }
  }

  // Cooling cost
  const cooling = COOLING_PRESETS[config.coolingType];
  total += cooling?.installCost || config.coolingInstallCost;

  return total;
}

/**
 * Calculate monthly maintenance cost
 */
export function calculateMaintenanceCost(config: MiningConfig): number {
  // ASIC maintenance: ~$50/unit/quarter + $20/month base
  const asicMaintenance = (config.asicQuantity * 50) / 3 + 20;

  // GPU maintenance: ~$20/unit/year + $20/month base
  let gpuMaintenance = 0;
  if (config.gpuEnabled) {
    const totalGpus = config.gpuQuantity * config.gpuRigCount;
    gpuMaintenance = (totalGpus * 20) / 12 + 20;
  }

  return asicMaintenance + gpuMaintenance;
}

/**
 * Calculate energy costs based on mining strategy and solar/battery availability
 *
 * Key principle: Solar only helps mining AFTER fleet charging and facility operations are covered.
 * Mining hours are based on strategy, not solar availability.
 * Solar/battery just changes WHERE the energy comes from (reducing grid costs).
 */
function calculateStrategyBasedEnergy(
  config: MiningConfig,
  energyConfig: EnergyConfig,
  solarConfig: SolarConfig | undefined,
  batteryConfig: BatteryConfig | undefined,
  totalPowerKw: number
): {
  effectiveHoursPerDay: number;
  energyFromSolarKwh: number;
  energyFromBatteryKwh: number;
  energyFromGridKwh: number;
  monthlyEnergyCost: number;
  energyCostWithoutSolar: number;
} {
  // Base rates
  const flatRate = energyConfig.flatRate?.ratePerKwh || 0.15;
  const offPeakRate = energyConfig.touRate?.offPeakRate || flatRate * 0.6;
  const onPeakRate = energyConfig.touRate?.onPeakRate || flatRate * 1.5;

  // Calculate total daily solar output
  const dailySolarKwh = solarConfig?.enabled ? (solarConfig.annualOutputKwh / 365) : 0;

  // Calculate what solar is consumed by OTHER loads first
  const fleetChargingDaily = config.fleetChargingKwhPerDay || 0;
  const facilityDailyKwh = config.facilityBaseLoadKw * 24; // Facility runs 24/7
  const otherLoadsDaily = fleetChargingDaily + facilityDailyKwh;

  // EXCESS solar available for mining (only after other loads are covered)
  // Solar produces during ~6 peak sun hours, but facility/fleet may charge at different times
  // Assume 40% of solar can potentially go to mining during overlapping hours
  const solarHoursOverlap = 6; // Peak solar hours
  const excessSolarDaily = Math.max(0, dailySolarKwh - (otherLoadsDaily * 0.4)); // Excess after priority loads

  // Battery capacity available for mining (after other uses)
  const batteryCapacityKwh = batteryConfig?.enabled
    ? batteryConfig.capacityKwh * batteryConfig.quantity * 0.8 * 0.5 // 80% usable, 50% for mining
    : 0;

  let effectiveHoursPerDay = 24;
  let energyFromSolarKwh = 0;
  let energyFromBatteryKwh = 0;
  let energyFromGridKwh = 0;
  let monthlyEnergyCost = 0;

  const dailyMiningDemandKwh = totalPowerKw * 24;

  switch (config.miningStrategy) {
    case "excess_solar":
      // Only mine using excess solar - NO grid power
      // Mining hours limited by available excess solar
      if (excessSolarDaily > 0 && totalPowerKw > 0) {
        effectiveHoursPerDay = Math.min(solarHoursOverlap, excessSolarDaily / totalPowerKw);
        energyFromSolarKwh = totalPowerKw * effectiveHoursPerDay * 30;
      } else {
        effectiveHoursPerDay = 0; // No excess solar, no mining
        energyFromSolarKwh = 0;
      }
      energyFromGridKwh = 0; // Pure excess solar - no grid
      monthlyEnergyCost = 0; // Free energy
      break;

    case "tou_arbitrage":
      // Mine during off-peak hours using cheap grid power
      // Solar/battery can supplement but strategy is grid-focused
      const offPeakHours = config.mineOffPeak ? 12 : 24;
      effectiveHoursPerDay = offPeakHours;
      const dailyDemandTou = totalPowerKw * offPeakHours;
      const monthlyDemandTou = dailyDemandTou * 30;

      // Battery charged during super off-peak can offset some usage
      if (batteryConfig?.enabled) {
        energyFromBatteryKwh = Math.min(batteryCapacityKwh * 30, monthlyDemandTou * 0.2);
      }

      // Minimal solar overlap with off-peak hours (mostly night/early morning)
      if (solarConfig?.enabled && excessSolarDaily > 0) {
        energyFromSolarKwh = Math.min(excessSolarDaily * 0.2 * 30, monthlyDemandTou * 0.1);
      }

      energyFromGridKwh = monthlyDemandTou - energyFromSolarKwh - energyFromBatteryKwh;
      monthlyEnergyCost = Math.max(0, energyFromGridKwh) * offPeakRate;
      break;

    case "continuous":
    default:
      // Run 24/7 - maximize output, use grid as needed
      effectiveHoursPerDay = 24;
      const monthlyMiningDemand = dailyMiningDemandKwh * 30;

      // Excess solar can offset daytime grid usage
      if (solarConfig?.enabled && excessSolarDaily > 0) {
        energyFromSolarKwh = Math.min(excessSolarDaily * 30, monthlyMiningDemand * 0.25);
      }

      // Battery can provide additional offset
      if (batteryConfig?.enabled) {
        energyFromBatteryKwh = Math.min(batteryCapacityKwh * 30, monthlyMiningDemand * 0.1);
      }

      energyFromGridKwh = monthlyMiningDemand - energyFromSolarKwh - energyFromBatteryKwh;

      // Calculate blended rate based on TOU or flat
      const avgRate = energyConfig.rateMode === "tou"
        ? (offPeakRate * 12 + onPeakRate * 5 + flatRate * 7) / 24
        : flatRate;
      monthlyEnergyCost = Math.max(0, energyFromGridKwh) * avgRate;
      break;
  }

  // Cost without solar/battery (baseline for comparison) - based on actual mining hours
  const energyCostWithoutSolar = (totalPowerKw * effectiveHoursPerDay * 30) * flatRate;

  return {
    effectiveHoursPerDay,
    energyFromSolarKwh: Math.max(0, energyFromSolarKwh),
    energyFromBatteryKwh: Math.max(0, energyFromBatteryKwh),
    energyFromGridKwh: Math.max(0, energyFromGridKwh),
    monthlyEnergyCost: Math.max(0, monthlyEnergyCost),
    energyCostWithoutSolar,
  };
}

/**
 * Calculate comprehensive mining revenue and profitability
 */
export function calculateMiningProfitability(
  config: MiningConfig,
  energyConfig: EnergyConfig,
  solarConfig?: SolarConfig,
  batteryConfig?: BatteryConfig,
  networkStats: NetworkStats = DEFAULT_NETWORK_STATS,
  prices: CryptoPrices = DEFAULT_PRICES
): MiningRevenue {
  if (!config.enabled) {
    return getEmptyMiningRevenue();
  }

  // Hashrates
  const asicHashrateTh = calculateASICHashrate(config);
  const gpuHashrateMh = calculateGPUHashrate(config);

  // Power consumption
  const asicPowerW = calculateASICPower(config);
  const gpuPowerW = calculateGPUPower(config);
  const coolingPowerW = calculateCoolingPower(config);
  const totalPowerW = asicPowerW + gpuPowerW + coolingPowerW;
  const totalPowerKw = totalPowerW / 1000;

  // Calculate strategy-based energy costs
  const energyCalc = calculateStrategyBasedEnergy(
    config,
    energyConfig,
    solarConfig,
    batteryConfig,
    totalPowerKw
  );

  // Effective energy consumption based on strategy
  const dailyEnergyKwh = totalPowerKw * energyCalc.effectiveHoursPerDay;
  const monthlyEnergyKwh = dailyEnergyKwh * 30;

  // BTC revenue (adjusted for effective hours)
  const revenueMultiplier = energyCalc.effectiveHoursPerDay / 24;
  const btcRevenue = calculateBTCRevenue(config, networkStats, prices.bitcoin);
  const adjustedBtcRevenue = {
    dailyBtc: btcRevenue.dailyBtc * revenueMultiplier,
    dailyUsd: btcRevenue.dailyUsd * revenueMultiplier,
    monthlyUsd: btcRevenue.monthlyUsd * revenueMultiplier,
  };

  // Altcoin revenue (GPU) - also adjusted
  const altcoinRevenue = calculateAltcoinRevenue(config, prices);
  const adjustedAltcoinRevenue = {
    dailyUsd: altcoinRevenue.dailyUsd * revenueMultiplier,
    monthlyUsd: altcoinRevenue.monthlyUsd * revenueMultiplier,
  };

  // Total revenue
  const monthlyGrossRevenue = adjustedBtcRevenue.monthlyUsd + adjustedAltcoinRevenue.monthlyUsd;

  // Costs
  const monthlyMaintenanceCost = calculateMaintenanceCost(config);
  const energyRate = energyConfig.flatRate?.ratePerKwh || 0.15;
  const monthlyCoolingEnergyCost = ((coolingPowerW / 1000) * energyCalc.effectiveHoursPerDay * 30 * energyRate);
  const totalHardwareCost = calculateHardwareCost(config);

  // Solar savings
  const monthlySolarSavings = energyCalc.energyCostWithoutSolar - energyCalc.monthlyEnergyCost;
  const solarOffsetPercent = monthlyEnergyKwh > 0
    ? ((energyCalc.energyFromSolarKwh + energyCalc.energyFromBatteryKwh) / monthlyEnergyKwh) * 100
    : 0;

  // Net profit
  const monthlyNetProfit =
    monthlyGrossRevenue - energyCalc.monthlyEnergyCost - monthlyMaintenanceCost - monthlyCoolingEnergyCost;

  // Payback period
  const paybackMonths =
    monthlyNetProfit > 0 ? totalHardwareCost / monthlyNetProfit : Infinity;

  // Network share
  const networkHashrateTh = networkStats.networkHashrateEh * 1e6;
  const minerShare = asicHashrateTh / networkHashrateTh;

  return {
    totalHashrateTh: asicHashrateTh,
    minerShare,

    dailyCryptoGross: adjustedBtcRevenue.dailyBtc / (1 - config.poolFeePercent / 100),
    dailyCryptoNet: adjustedBtcRevenue.dailyBtc,
    dailyUsdRevenue: adjustedBtcRevenue.dailyUsd + adjustedAltcoinRevenue.dailyUsd,

    monthlyCrypto: adjustedBtcRevenue.dailyBtc * 30,
    monthlyUsdRevenue: monthlyGrossRevenue,

    dailyEnergyKwh,
    monthlyEnergyKwh,

    energyFromSolarKwh: energyCalc.energyFromSolarKwh,
    energyFromBatteryKwh: energyCalc.energyFromBatteryKwh,
    energyFromGridKwh: energyCalc.energyFromGridKwh,
    solarOffsetPercent,
    effectiveHoursPerDay: energyCalc.effectiveHoursPerDay,

    monthlyEnergyCost: energyCalc.monthlyEnergyCost,
    energyCostWithoutSolar: energyCalc.energyCostWithoutSolar,
    monthlySolarSavings,

    monthlyGrossRevenue,
    monthlyMaintenanceCost,
    monthlyCoolingCost: monthlyCoolingEnergyCost,
    monthlyNetProfit,

    totalHardwareCost,
    monthlyCoolingEnergyCost,
    paybackMonths,
  };
}

/**
 * Get empty mining revenue object
 */
function getEmptyMiningRevenue(): MiningRevenue {
  return {
    totalHashrateTh: 0,
    minerShare: 0,
    dailyCryptoGross: 0,
    dailyCryptoNet: 0,
    dailyUsdRevenue: 0,
    monthlyCrypto: 0,
    monthlyUsdRevenue: 0,
    dailyEnergyKwh: 0,
    monthlyEnergyKwh: 0,
    energyFromSolarKwh: 0,
    energyFromBatteryKwh: 0,
    energyFromGridKwh: 0,
    solarOffsetPercent: 0,
    effectiveHoursPerDay: 24,
    monthlyEnergyCost: 0,
    energyCostWithoutSolar: 0,
    monthlySolarSavings: 0,
    monthlyGrossRevenue: 0,
    monthlyMaintenanceCost: 0,
    monthlyCoolingCost: 0,
    monthlyNetProfit: 0,
    totalHardwareCost: 0,
    monthlyCoolingEnergyCost: 0,
    paybackMonths: Infinity,
  };
}

/**
 * Project revenue with difficulty increases over time
 */
export function projectRevenueOverTime(
  config: MiningConfig,
  energyConfig: EnergyConfig,
  solarConfig: SolarConfig | undefined,
  batteryConfig: BatteryConfig | undefined,
  networkStats: NetworkStats,
  prices: CryptoPrices,
  months: number = 24
): { month: number; revenue: number; profit: number; cumulativeProfit: number }[] {
  const projections: { month: number; revenue: number; profit: number; cumulativeProfit: number }[] = [];
  let cumulativeProfit = -calculateHardwareCost(config);

  const monthlyDifficultyGrowth = config.modelDifficultyIncreases
    ? Math.pow(1 + config.annualDifficultyGrowthPercent / 100, 1 / 12) - 1
    : 0;

  let currentStats = { ...networkStats };

  for (let month = 1; month <= months; month++) {
    // Increase difficulty each month
    if (config.modelDifficultyIncreases) {
      currentStats = {
        ...currentStats,
        networkHashrateEh: currentStats.networkHashrateEh * (1 + monthlyDifficultyGrowth),
        difficulty: currentStats.difficulty * (1 + monthlyDifficultyGrowth),
      };
    }

    const monthlyResult = calculateMiningProfitability(
      config,
      energyConfig,
      solarConfig,
      batteryConfig,
      currentStats,
      prices
    );

    cumulativeProfit += monthlyResult.monthlyNetProfit;

    projections.push({
      month,
      revenue: monthlyResult.monthlyGrossRevenue,
      profit: monthlyResult.monthlyNetProfit,
      cumulativeProfit,
    });
  }

  return projections;
}
