// Cryptocurrency Mining Types

export type MinerType = "asic" | "gpu";
export type Algorithm = "sha256" | "scrypt" | "kawpow" | "autolykos" | "ethash";
export type CoolingType = "portable_ac" | "mini_split" | "industrial" | "immersion";
export type MiningStrategy = "excess_solar" | "tou_arbitrage" | "continuous";
export type TargetCrypto = "BTC" | "LTC" | "RVN" | "ERGO" | "FLUX";

// ASIC Miner Definition
export interface ASICMiner {
  id: string;
  displayName: string;
  manufacturer: string;
  algorithm: Algorithm;
  hashrateTh: number; // Terahash per second
  powerWatts: number;
  efficiencyJTh: number; // Joules per Terahash
  msrpUsd: number;
  noiseDb: number;
  coolingType: "air" | "hydro" | "immersion";
}

// GPU Miner Definition
export interface GPUMiner {
  id: string;
  displayName: string;
  manufacturer: string;
  vramGb: number;
  hashrateKawpowMh: number; // Megahash for Kawpow (RVN)
  hashrateAutolykosMh: number; // Megahash for Autolykos (ERGO)
  powerWattsMining: number;
  msrpUsd: number;
}

// Selected miner in config
export interface MinerSelection {
  minerId: string;
  minerType: MinerType;
  quantity: number;
  overclockPercent: number; // -10 to +15
}

// Cooling configuration
export interface CoolingConfig {
  type: CoolingType;
  capacityKw: number;
  powerWatts: number;
  installCost: number;
}

// Mining configuration in scenario
export interface MiningConfig {
  enabled: boolean;

  // ASIC Configuration
  asicModel: string;
  asicQuantity: number;
  asicOverclockPercent: number;

  // GPU Configuration
  gpuEnabled: boolean;
  gpuModel: string;
  gpuQuantity: number;
  gpuRigCount: number;
  gpuAlgorithm: Algorithm;
  gpuTargetCoin: TargetCrypto;

  // Pool settings
  poolFeePercent: number;

  // Infrastructure
  coolingType: CoolingType;
  coolingPowerWatts: number;
  coolingInstallCost: number;

  // Strategy
  miningStrategy: MiningStrategy;
  mineOffPeak: boolean;
  mineSolarOnly: boolean;
  pauseDuringPeakExport: boolean;

  // Facility operations (for calculating excess solar)
  facilityBaseLoadKw: number; // Facility power consumption (HVAC, lights, etc.)
  fleetChargingKwhPerDay: number; // Daily fleet charging needs

  // Difficulty modeling
  modelDifficultyIncreases: boolean;
  annualDifficultyGrowthPercent: number;
}

// Network statistics from APIs
export interface NetworkStats {
  networkHashrateEh: number; // Exahash
  difficulty: number;
  blockReward: number; // 3.125 BTC post-2024 halving
  avgBlockTimeSeconds: number;
  nextDifficultyAdjustmentPercent: number;
}

// Crypto prices from CoinGecko
export interface CryptoPrices {
  bitcoin: number;
  litecoin: number;
  ravencoin: number;
  ergo: number;
  flux: number;
  lastUpdated: Date;
}

// Mining revenue calculation result
export interface MiningRevenue {
  // Hashrate
  totalHashrateTh: number;
  minerShare: number; // fraction of network

  // Daily production
  dailyCryptoGross: number;
  dailyCryptoNet: number; // after pool fee
  dailyUsdRevenue: number;

  // Monthly projections
  monthlyCrypto: number;
  monthlyUsdRevenue: number;

  // Energy consumption
  dailyEnergyKwh: number;
  monthlyEnergyKwh: number;

  // Energy source breakdown
  energyFromSolarKwh: number;
  energyFromBatteryKwh: number;
  energyFromGridKwh: number;
  solarOffsetPercent: number;
  effectiveHoursPerDay: number; // Based on strategy

  // Energy costs
  monthlyEnergyCost: number;
  energyCostWithoutSolar: number; // What it would cost without solar
  monthlySolarSavings: number;

  // Net profit
  monthlyGrossRevenue: number;
  monthlyMaintenanceCost: number;
  monthlyCoolingCost: number;
  monthlyNetProfit: number;

  // Hardware
  totalHardwareCost: number;
  monthlyCoolingEnergyCost: number;
  paybackMonths: number;
}

// Cooling type presets
export const COOLING_PRESETS: Record<CoolingType, CoolingConfig> = {
  portable_ac: {
    type: "portable_ac",
    capacityKw: 4,
    powerWatts: 1500,
    installCost: 600,
  },
  mini_split: {
    type: "mini_split",
    capacityKw: 7,
    powerWatts: 2000,
    installCost: 2500,
  },
  industrial: {
    type: "industrial",
    capacityKw: 15,
    powerWatts: 500,
    installCost: 1500,
  },
  immersion: {
    type: "immersion",
    capacityKw: 50,
    powerWatts: 1000,
    installCost: 15000,
  },
};

// ASIC Miner Database
export const ASIC_MINERS: ASICMiner[] = [
  {
    id: "antminer_s21_hyd",
    displayName: "Bitmain Antminer S21 Hyd",
    manufacturer: "Bitmain",
    algorithm: "sha256",
    hashrateTh: 335,
    powerWatts: 5360,
    efficiencyJTh: 16.0,
    msrpUsd: 5500,
    noiseDb: 50,
    coolingType: "hydro",
  },
  {
    id: "antminer_s21",
    displayName: "Bitmain Antminer S21",
    manufacturer: "Bitmain",
    algorithm: "sha256",
    hashrateTh: 200,
    powerWatts: 3500,
    efficiencyJTh: 17.5,
    msrpUsd: 4500,
    noiseDb: 75,
    coolingType: "air",
  },
  {
    id: "antminer_s19_xp",
    displayName: "Bitmain Antminer S19 XP",
    manufacturer: "Bitmain",
    algorithm: "sha256",
    hashrateTh: 140,
    powerWatts: 3010,
    efficiencyJTh: 21.5,
    msrpUsd: 3200,
    noiseDb: 75,
    coolingType: "air",
  },
  {
    id: "whatsminer_m50s",
    displayName: "MicroBT Whatsminer M50S",
    manufacturer: "MicroBT",
    algorithm: "sha256",
    hashrateTh: 126,
    powerWatts: 3276,
    efficiencyJTh: 26.0,
    msrpUsd: 2800,
    noiseDb: 75,
    coolingType: "air",
  },
  {
    id: "antminer_l7",
    displayName: "Bitmain Antminer L7",
    manufacturer: "Bitmain",
    algorithm: "scrypt",
    hashrateTh: 9.5, // Actually GH/s for Scrypt, but stored in TH for simplicity
    powerWatts: 3425,
    efficiencyJTh: 360,
    msrpUsd: 8000,
    noiseDb: 75,
    coolingType: "air",
  },
];

// GPU Miner Database
export const GPU_MINERS: GPUMiner[] = [
  {
    id: "rtx_4090",
    displayName: "NVIDIA RTX 4090",
    manufacturer: "NVIDIA",
    vramGb: 24,
    hashrateKawpowMh: 58,
    hashrateAutolykosMh: 260,
    powerWattsMining: 350,
    msrpUsd: 1800,
  },
  {
    id: "rtx_4070ti",
    displayName: "NVIDIA RTX 4070 Ti",
    manufacturer: "NVIDIA",
    vramGb: 12,
    hashrateKawpowMh: 35,
    hashrateAutolykosMh: 150,
    powerWattsMining: 220,
    msrpUsd: 800,
  },
  {
    id: "rtx_3080",
    displayName: "NVIDIA RTX 3080",
    manufacturer: "NVIDIA",
    vramGb: 10,
    hashrateKawpowMh: 28,
    hashrateAutolykosMh: 130,
    powerWattsMining: 280,
    msrpUsd: 500,
  },
  {
    id: "rx_7900xtx",
    displayName: "AMD Radeon RX 7900 XTX",
    manufacturer: "AMD",
    vramGb: 24,
    hashrateKawpowMh: 32,
    hashrateAutolykosMh: 140,
    powerWattsMining: 355,
    msrpUsd: 1000,
  },
];

// Default mining configuration
export const defaultMiningConfig: MiningConfig = {
  enabled: false,

  // ASIC defaults
  asicModel: "antminer_s21",
  asicQuantity: 1,
  asicOverclockPercent: 0,

  // GPU defaults
  gpuEnabled: false,
  gpuModel: "rtx_4090",
  gpuQuantity: 6,
  gpuRigCount: 1,
  gpuAlgorithm: "kawpow",
  gpuTargetCoin: "RVN",

  // Pool settings
  poolFeePercent: 2,

  // Infrastructure
  coolingType: "mini_split",
  coolingPowerWatts: 2000,
  coolingInstallCost: 2500,

  // Strategy
  miningStrategy: "continuous", // Default to 24/7 so it works without solar
  mineOffPeak: true,
  mineSolarOnly: false,
  pauseDuringPeakExport: true,

  // Facility operations
  facilityBaseLoadKw: 5, // 5 kW default facility load
  fleetChargingKwhPerDay: 0, // Will be calculated from vehicle config

  // Difficulty modeling
  modelDifficultyIncreases: true,
  annualDifficultyGrowthPercent: 25,
};

// Crypto coin info
export interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
  algorithm: Algorithm;
  coingeckoId: string;
}

export const SUPPORTED_COINS: CoinInfo[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    algorithm: "sha256",
    coingeckoId: "bitcoin",
  },
  {
    id: "ltc",
    symbol: "LTC",
    name: "Litecoin",
    algorithm: "scrypt",
    coingeckoId: "litecoin",
  },
  {
    id: "rvn",
    symbol: "RVN",
    name: "Ravencoin",
    algorithm: "kawpow",
    coingeckoId: "ravencoin",
  },
  {
    id: "erg",
    symbol: "ERG",
    name: "Ergo",
    algorithm: "autolykos",
    coingeckoId: "ergo",
  },
  {
    id: "flux",
    symbol: "FLUX",
    name: "Flux",
    algorithm: "kawpow",
    coingeckoId: "zelcash",
  },
];
