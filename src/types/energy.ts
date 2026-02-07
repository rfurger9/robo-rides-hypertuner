export type RateMode = "flat" | "tou";

export interface FlatRate {
  ratePerKwh: number; // Default: $0.25
}

export interface TOURate {
  offPeakRate: number; // Default: $0.15
  offPeakHours: string; // e.g., "12am-6am"
  partialPeakRate: number; // Default: $0.30
  partialPeakHours: string; // e.g., "6am-4pm, 9pm-12am"
  onPeakRate: number; // Default: $0.45
  onPeakHours: string; // e.g., "4pm-9pm"
}

export interface NetMeteringConfig {
  enabled: boolean;
  exportRatePercent: number; // Default: 0.75
  annualTrueUp: boolean; // Default: true
}

export interface EnergyConfig {
  rateMode: RateMode;
  flatRate: FlatRate;
  touRate: TOURate;
  netMetering: NetMeteringConfig;
}

export interface MonthlyEnergyBalance {
  vehicleEnergyNeed: number; // total_miles / efficiency
  solarGeneration: number;
  gridImport: number; // If solar < need
  excessSolar: number; // If solar > need
  exportCredit: number; // excess × rate × export_percent
  netEnergyCost: number; // import_cost - export_credit
}

export interface EnergyCalculation {
  monthlyVehicleKwh: number;
  monthlySolarKwh: number;
  monthlyGridImportKwh: number;
  monthlyExcessSolarKwh: number;
  monthlyGridCost: number;
  monthlyExportCredit: number;
  monthlyNetEnergyCost: number;
  // Battery metrics
  batteryCapacityKwh: number;
  batteryUsableKwh: number;
  monthlyBatteryChargeKwh: number;
  monthlyBatteryDischargeKwh: number;
  monthlyBatterySavings: number;
  monthlyBatteryAmortizedCost: number;
}

export interface MonthlyEnergyData {
  month: string;
  solarGeneration: number;
  vehicleConsumption: number;
  gridImport: number;
  gridExport: number;
  batteryCharge: number;
  batteryDischarge: number;
}
