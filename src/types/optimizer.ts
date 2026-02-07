// Energy Optimizer Types

export type TOUPeriod = "superOffPeak" | "offPeak" | "peak";
export type EnergySourceType = "solar" | "battery" | "grid";
export type EnergyConsumerType =
  | "fleetCharging"
  | "facilityOps"
  | "batteryCharging"
  | "cryptoMining"
  | "gridExport";

// Priority configuration (1-5, lower = higher priority)
export interface PriorityConfig {
  fleetCharging: number;
  facilityOps: number;
  batteryCharging: number;
  cryptoMining: number;
  gridExport: number;
}

// Energy source availability
export interface EnergySource {
  type: EnergySourceType;
  availableKw: number;
  costPerKwh: number;
}

// Energy consumer demand
export interface EnergyConsumer {
  type: EnergyConsumerType;
  demandKw: number;
  priority: number;
  isFlexible: boolean; // Can be shifted in time
  minRequired: number; // Minimum kW required
}

// Time window for scheduling
export interface TimeWindow {
  start: number; // Hour (0-23)
  end: number; // Hour (0-23)
}

// Charging schedule for a vehicle
export interface ChargingSchedule {
  vehicleId: string;
  targetSoC: number; // Target state of charge (0-100)
  departureTime: number; // Hour (0-23)
  preferredWindow: TimeWindow;
  actualWindow: TimeWindow;
  energyNeeded: number; // kWh
}

// Arbitrage rule configuration
export interface ArbitrageRule {
  chargeWhen: {
    touPeriod: TOUPeriod;
    maxRate: number; // $/kWh
    solarExcess: boolean;
  };
  dischargeWhen: {
    touPeriod: TOUPeriod;
    minRate: number; // $/kWh
    fleetNeed: boolean;
  };
}

// Energy allocation for a single consumer
export interface EnergyAllocation {
  consumer: EnergyConsumerType;
  allocatedKw: number;
  source: EnergySourceType;
  cost: number;
}

// Complete allocation plan for a time period
export interface AllocationPlan {
  timestamp: Date;
  period: TOUPeriod;
  hourOfDay: number;

  sources: {
    solar: number; // kW available
    battery: number; // kW available
    grid: number; // kW available
    total: number;
  };

  demands: {
    fleetCharging: number;
    facilityOps: number;
    batteryCharging: number;
    cryptoMining: number;
    total: number;
  };

  allocations: {
    fleetCharging: number;
    facilityOps: number;
    batteryCharging: number;
    cryptoMining: number;
    gridExport: number;
  };

  unmetDemand: number;
  excessEnergy: number;

  costs: {
    gridCost: number;
    exportRevenue: number;
    netCost: number;
  };
}

// Main optimizer configuration
export interface OptimizerConfig {
  enabled: boolean;

  // Priorities (1-5, lower = higher priority)
  priorities: PriorityConfig;

  // Constraints
  minFleetSoC: number; // Minimum vehicle charge % (0-100)
  maxGridImportKw: number; // kW limit for grid import
  reserveBatteryPercent: number; // % reserved for backup

  // Facility operations
  facilityBaseLoadKw: number; // Base facility power demand

  // Automation flags
  autoArbitrage: boolean;
  autoMining: boolean;
  autoExport: boolean;

  // Time-based settings
  peakHoursStart: number; // Hour (0-23)
  peakHoursEnd: number; // Hour (0-23)
  superOffPeakStart: number; // Hour (0-23)
  superOffPeakEnd: number; // Hour (0-23)
}

// Optimization calculation results
export interface OptimizerCalculation {
  // Current period allocation
  currentAllocation: AllocationPlan;

  // 24-hour schedule
  hourlyAllocations: AllocationPlan[];

  // Daily totals
  dailyTotals: {
    solarGeneration: number; // kWh
    batteryThroughput: number; // kWh
    gridImport: number; // kWh
    gridExport: number; // kWh
    fleetCharging: number; // kWh
    facilityOps: number; // kWh
    miningConsumption: number; // kWh
  };

  // Cost analysis
  costs: {
    totalGridCost: number;
    totalExportRevenue: number;
    netEnergyCost: number;
    savingsVsBaseline: number; // vs no optimization
    optimizationEfficiency: number; // % (0-100)
  };

  // Battery state
  batteryState: {
    currentSoC: number; // %
    projectedEndOfDaySoC: number; // %
    cyclesUsedToday: number;
  };

  // Fleet readiness
  fleetReadiness: {
    vehiclesAtTargetSoC: number;
    totalVehicles: number;
    averageSoC: number;
  };
}

// Simulation hour data
export interface SimulationHour {
  hour: number;
  touPeriod: TOUPeriod;
  solarOutput: number; // kW
  gridRate: number; // $/kWh
  fleetDemand: number; // kW
  miningDemand: number; // kW
  facilityDemand: number; // kW
  batteryAction: "charge" | "discharge" | "hold";
  batteryKw: number;
  gridImport: number; // kW
  gridExport: number; // kW
}

// Default optimizer configuration
export const defaultOptimizerConfig: OptimizerConfig = {
  enabled: false,

  priorities: {
    fleetCharging: 1,
    facilityOps: 2,
    batteryCharging: 3,
    cryptoMining: 4,
    gridExport: 5,
  },

  minFleetSoC: 80,
  maxGridImportKw: 100,
  reserveBatteryPercent: 20,

  facilityBaseLoadKw: 5,

  autoArbitrage: true,
  autoMining: true,
  autoExport: true,

  peakHoursStart: 16, // 4 PM
  peakHoursEnd: 21, // 9 PM
  superOffPeakStart: 0, // 12 AM
  superOffPeakEnd: 9, // 9 AM
};

// Solar production curve (normalized, 0-1 scale by hour)
export const SOLAR_PRODUCTION_CURVE: number[] = [
  0, 0, 0, 0, 0, 0, // 12am-5am
  0.05, 0.15, 0.35, 0.55, 0.75, 0.9, // 6am-11am
  1.0, 0.95, 0.85, 0.7, 0.5, 0.3, // 12pm-5pm
  0.1, 0.02, 0, 0, 0, 0, // 6pm-11pm
];

// Fleet charging demand curve (normalized, 0-1 scale by hour)
export const FLEET_DEMAND_CURVE: number[] = [
  0.8, 0.7, 0.6, 0.5, 0.4, 0.3, // 12am-5am (overnight charging)
  0.2, 0.15, 0.1, 0.1, 0.15, 0.2, // 6am-11am (vehicles in use)
  0.25, 0.3, 0.35, 0.4, 0.5, 0.6, // 12pm-5pm (returning)
  0.7, 0.8, 0.85, 0.9, 0.85, 0.8, // 6pm-11pm (evening charging)
];

// Helper function to get TOU period for an hour
export function getTOUPeriod(
  hour: number,
  config: OptimizerConfig
): TOUPeriod {
  if (hour >= config.superOffPeakStart && hour < config.superOffPeakEnd) {
    return "superOffPeak";
  }
  if (hour >= config.peakHoursStart && hour < config.peakHoursEnd) {
    return "peak";
  }
  return "offPeak";
}

// Helper function to get grid rate for TOU period
export function getGridRateForPeriod(
  period: TOUPeriod,
  offPeakRate: number,
  onPeakRate: number
): number {
  switch (period) {
    case "superOffPeak":
      return offPeakRate * 0.6; // 60% of off-peak
    case "offPeak":
      return offPeakRate;
    case "peak":
      return onPeakRate;
  }
}

// Helper function to get priority label
export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1:
      return "Critical";
    case 2:
      return "High";
    case 3:
      return "Medium";
    case 4:
      return "Low";
    case 5:
      return "Optional";
    default:
      return "Unknown";
  }
}

// Consumer type labels
export const CONSUMER_LABELS: Record<EnergyConsumerType, string> = {
  fleetCharging: "Fleet Charging",
  facilityOps: "Facility Operations",
  batteryCharging: "Battery Charging",
  cryptoMining: "Crypto Mining",
  gridExport: "Grid Export",
};

// Source type labels
export const SOURCE_LABELS: Record<EnergySourceType, string> = {
  solar: "Solar",
  battery: "Battery",
  grid: "Grid",
};
