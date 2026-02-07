export type BatteryStrategy = "self_consumption" | "tou_arbitrage" | "backup_only";

export interface BatteryUnit {
  id: string;
  name: string;
  capacityKwh: number;
  continuousPowerKw: number;
  peakPowerKw: number;
  roundTripEfficiency: number;
  costInstalled: number;
  warrantyYears: number;
}

export interface BatteryConfig {
  enabled: boolean;
  unitId: string;
  unitName: string;
  capacityKwh: number;
  continuousPowerKw: number;
  roundTripEfficiency: number;
  unitCostInstalled: number;
  quantity: number;
  strategy: BatteryStrategy;
  amortizationYears: number; // Default: 10
  arbitrageUtilization: number; // Default: 0.8 (80%)
}

export interface BatteryCostCalculation {
  totalCapacity: number; // Total kWh storage
  usableCapacity: number; // After efficiency losses
  totalCost: number;
  monthlyAmortizedCost: number; // Over 10 year lifespan
  dailyCycleValue: number; // Estimated value from TOU arbitrage
}

// Default battery presets
export const POWERWALL_3: BatteryUnit = {
  id: "powerwall_3",
  name: "Tesla Powerwall 3",
  capacityKwh: 13.5,
  continuousPowerKw: 11.5,
  peakPowerKw: 20,
  roundTripEfficiency: 0.9,
  costInstalled: 12000,
  warrantyYears: 10,
};

export const POWERWALL_2: BatteryUnit = {
  id: "powerwall_2",
  name: "Tesla Powerwall 2",
  capacityKwh: 13.5,
  continuousPowerKw: 5.8,
  peakPowerKw: 10,
  roundTripEfficiency: 0.9,
  costInstalled: 10500,
  warrantyYears: 10,
};

export const ENPHASE_5P: BatteryUnit = {
  id: "enphase_5p",
  name: "Enphase IQ 5P",
  capacityKwh: 5,
  continuousPowerKw: 3.84,
  peakPowerKw: 7.68,
  roundTripEfficiency: 0.89,
  costInstalled: 6000,
  warrantyYears: 15,
};

export const BATTERY_PRESETS: BatteryUnit[] = [
  POWERWALL_3,
  POWERWALL_2,
  ENPHASE_5P,
];

export const defaultBatteryConfig: BatteryConfig = {
  enabled: false,
  unitId: "powerwall_3",
  unitName: "Tesla Powerwall 3",
  capacityKwh: 13.5,
  continuousPowerKw: 11.5,
  roundTripEfficiency: 0.9,
  unitCostInstalled: 12000,
  quantity: 1,
  strategy: "self_consumption",
  amortizationYears: 10,
  arbitrageUtilization: 0.8,
};
