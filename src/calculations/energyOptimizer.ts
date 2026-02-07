import {
  OptimizerConfig,
  OptimizerCalculation,
  AllocationPlan,
  SimulationHour,
  TOUPeriod,
  EnergyConsumerType,
  SOLAR_PRODUCTION_CURVE,
  FLEET_DEMAND_CURVE,
  getTOUPeriod,
  getGridRateForPeriod,
  defaultOptimizerConfig,
} from "@/types/optimizer";
import { SolarConfig } from "@/types/solar";
import { BatteryConfig } from "@/types/battery";
import { EnergyConfig } from "@/types/energy";
import { MiningConfig } from "@/types/mining";
import { VehicleConfig } from "@/types/vehicle";

/**
 * Get empty optimizer calculation
 */
function getEmptyOptimizerCalculation(): OptimizerCalculation {
  const emptyAllocation: AllocationPlan = {
    timestamp: new Date(),
    period: "offPeak",
    hourOfDay: 0,
    sources: { solar: 0, battery: 0, grid: 0, total: 0 },
    demands: { fleetCharging: 0, facilityOps: 0, batteryCharging: 0, cryptoMining: 0, total: 0 },
    allocations: { fleetCharging: 0, facilityOps: 0, batteryCharging: 0, cryptoMining: 0, gridExport: 0 },
    unmetDemand: 0,
    excessEnergy: 0,
    costs: { gridCost: 0, exportRevenue: 0, netCost: 0 },
  };

  return {
    currentAllocation: emptyAllocation,
    hourlyAllocations: [],
    dailyTotals: {
      solarGeneration: 0,
      batteryThroughput: 0,
      gridImport: 0,
      gridExport: 0,
      fleetCharging: 0,
      facilityOps: 0,
      miningConsumption: 0,
    },
    costs: {
      totalGridCost: 0,
      totalExportRevenue: 0,
      netEnergyCost: 0,
      savingsVsBaseline: 0,
      optimizationEfficiency: 0,
    },
    batteryState: {
      currentSoC: 50,
      projectedEndOfDaySoC: 50,
      cyclesUsedToday: 0,
    },
    fleetReadiness: {
      vehiclesAtTargetSoC: 0,
      totalVehicles: 0,
      averageSoC: 0,
    },
  };
}

/**
 * Calculate solar output for a given hour
 */
function getSolarOutputKw(
  hour: number,
  solarConfig: SolarConfig
): number {
  if (!solarConfig.enabled) return 0;
  const normalizedOutput = SOLAR_PRODUCTION_CURVE[hour] || 0;
  return solarConfig.systemSizeKw * normalizedOutput;
}

/**
 * Calculate fleet charging demand for a given hour
 */
function getFleetDemandKw(
  hour: number,
  vehicleConfig: VehicleConfig
): number {
  const normalizedDemand = FLEET_DEMAND_CURVE[hour] || 0;
  // Assume each vehicle has a 11kW charger on average
  const maxChargingPower = vehicleConfig.quantity * 11;
  return maxChargingPower * normalizedDemand;
}

/**
 * Calculate mining demand based on config and optimization settings
 */
function getMiningDemandKw(
  hour: number,
  miningConfig: MiningConfig,
  optimizerConfig: OptimizerConfig,
  solarOutput: number,
  fleetDemand: number
): number {
  if (!miningConfig.enabled || !optimizerConfig.autoMining) return 0;

  // Get base mining power
  let miningPower = 0;

  // ASIC power
  const asicPower = (miningConfig.asicQuantity || 1) *
    ((miningConfig.asicOverclockPercent || 0) / 100 + 1) * 3500; // Approximate W per ASIC
  miningPower += asicPower / 1000; // Convert to kW

  // GPU power
  if (miningConfig.gpuEnabled) {
    const gpuPower = (miningConfig.gpuQuantity || 1) *
      (miningConfig.gpuRigCount || 1) * 350; // Approximate W per GPU
    miningPower += gpuPower / 1000;
  }

  // For excess solar strategy, only mine when there's excess solar
  if (miningConfig.miningStrategy === "excess_solar") {
    const excessSolar = Math.max(0, solarOutput - fleetDemand);
    return Math.min(miningPower, excessSolar);
  }

  // For TOU arbitrage, only mine during off-peak
  const period = getTOUPeriod(hour, optimizerConfig);
  if (miningConfig.miningStrategy === "tou_arbitrage" && period === "peak") {
    return 0;
  }

  return miningPower;
}

/**
 * Calculate allocation for a single hour
 */
function calculateHourlyAllocation(
  hour: number,
  optimizerConfig: OptimizerConfig,
  solarConfig: SolarConfig,
  batteryConfig: BatteryConfig,
  energyConfig: EnergyConfig,
  miningConfig: MiningConfig,
  vehicleConfig: VehicleConfig,
  batteryState: { soc: number; capacity: number }
): AllocationPlan {
  const period = getTOUPeriod(hour, optimizerConfig);

  // Get rate for this period
  const offPeakRate = energyConfig.rateMode === "flat"
    ? energyConfig.flatRate.ratePerKwh
    : energyConfig.touRate.offPeakRate;
  const onPeakRate = energyConfig.rateMode === "flat"
    ? energyConfig.flatRate.ratePerKwh
    : energyConfig.touRate.onPeakRate;
  const gridRate = getGridRateForPeriod(period, offPeakRate, onPeakRate);

  // Calculate sources
  const solarOutput = getSolarOutputKw(hour, solarConfig);

  // Battery availability depends on arbitrage settings and SoC
  let batteryAvailable = 0;
  if (batteryConfig.enabled && batteryState.soc > optimizerConfig.reserveBatteryPercent) {
    // Discharge during peak or when solar is low
    if (period === "peak" || (solarOutput === 0 && optimizerConfig.autoArbitrage)) {
      const usableSoC = batteryState.soc - optimizerConfig.reserveBatteryPercent;
      batteryAvailable = (usableSoC / 100) * batteryState.capacity * 0.9; // 90% efficiency
      // Limit to max discharge rate (assume 5kW per 13.5kWh Powerwall)
      const maxDischargeRate = (batteryState.capacity / 13.5) * 5;
      batteryAvailable = Math.min(batteryAvailable, maxDischargeRate);
    }
  }

  const totalSourcesAvailable = solarOutput + batteryAvailable;

  // Calculate demands
  const fleetDemand = getFleetDemandKw(hour, vehicleConfig);
  const facilityDemand = optimizerConfig.facilityBaseLoadKw;
  const miningDemand = getMiningDemandKw(hour, miningConfig, optimizerConfig, solarOutput, fleetDemand);

  // Battery charging demand (during super off-peak or when solar excess)
  let batteryChargeDemand = 0;
  if (batteryConfig.enabled && batteryState.soc < 100) {
    if (period === "superOffPeak" || solarOutput > fleetDemand + facilityDemand) {
      const roomToCharge = 100 - batteryState.soc;
      const chargeKwh = (roomToCharge / 100) * batteryState.capacity;
      const maxChargeRate = (batteryState.capacity / 13.5) * 5; // 5kW per Powerwall
      batteryChargeDemand = Math.min(chargeKwh, maxChargeRate);
    }
  }

  const totalDemand = fleetDemand + facilityDemand + miningDemand + batteryChargeDemand;

  // Allocate based on priority
  const priorityList: Array<{ type: EnergyConsumerType; demand: number; priority: number }> = [
    { type: "fleetCharging" as const, demand: fleetDemand, priority: optimizerConfig.priorities.fleetCharging },
    { type: "facilityOps" as const, demand: facilityDemand, priority: optimizerConfig.priorities.facilityOps },
    { type: "batteryCharging" as const, demand: batteryChargeDemand, priority: optimizerConfig.priorities.batteryCharging },
    { type: "cryptoMining" as const, demand: miningDemand, priority: optimizerConfig.priorities.cryptoMining },
  ];
  const priorities = priorityList.sort((a, b) => a.priority - b.priority);

  const allocations: Record<EnergyConsumerType, number> = {
    fleetCharging: 0,
    facilityOps: 0,
    batteryCharging: 0,
    cryptoMining: 0,
    gridExport: 0,
  };

  let remainingFromSolarBattery = totalSourcesAvailable;
  let gridImportNeeded = 0;

  // First pass: allocate from solar + battery
  for (const consumer of priorities) {
    const allocated = Math.min(consumer.demand, remainingFromSolarBattery);
    allocations[consumer.type] = allocated;
    remainingFromSolarBattery -= allocated;
  }

  // Second pass: check unmet demand and get from grid
  for (const consumer of priorities) {
    const unmet = consumer.demand - allocations[consumer.type];
    if (unmet > 0 && gridImportNeeded < optimizerConfig.maxGridImportKw) {
      const fromGrid = Math.min(unmet, optimizerConfig.maxGridImportKw - gridImportNeeded);
      allocations[consumer.type] += fromGrid;
      gridImportNeeded += fromGrid;
    }
  }

  // Calculate excess for export
  let excessEnergy = remainingFromSolarBattery;
  if (excessEnergy > 0 && optimizerConfig.autoExport) {
    allocations.gridExport = excessEnergy;
  }

  // Calculate unmet demand
  let unmetDemand = 0;
  for (const consumer of priorities) {
    unmetDemand += consumer.demand - allocations[consumer.type];
  }

  // Calculate costs
  const exportRate = gridRate * (energyConfig.netMetering?.exportRatePercent || 0.75);
  const gridCost = gridImportNeeded * gridRate;
  const exportRevenue = allocations.gridExport * exportRate;
  const netCost = gridCost - exportRevenue;

  return {
    timestamp: new Date(),
    period,
    hourOfDay: hour,
    sources: {
      solar: solarOutput,
      battery: batteryAvailable,
      grid: gridImportNeeded,
      total: totalSourcesAvailable + gridImportNeeded,
    },
    demands: {
      fleetCharging: fleetDemand,
      facilityOps: facilityDemand,
      batteryCharging: batteryChargeDemand,
      cryptoMining: miningDemand,
      total: totalDemand,
    },
    allocations,
    unmetDemand,
    excessEnergy,
    costs: {
      gridCost,
      exportRevenue,
      netCost,
    },
  };
}

/**
 * Run 24-hour simulation
 */
function simulate24Hours(
  optimizerConfig: OptimizerConfig,
  solarConfig: SolarConfig,
  batteryConfig: BatteryConfig,
  energyConfig: EnergyConfig,
  miningConfig: MiningConfig,
  vehicleConfig: VehicleConfig
): SimulationHour[] {
  const simulation: SimulationHour[] = [];

  // Initial battery state
  const batteryCapacity = batteryConfig.enabled ? batteryConfig.capacityKwh * batteryConfig.quantity : 0;
  let batterySoC = batteryConfig.enabled ? 50 : 0; // Start at 50%

  for (let hour = 0; hour < 24; hour++) {
    const period = getTOUPeriod(hour, optimizerConfig);
    const solarOutput = getSolarOutputKw(hour, solarConfig);
    const fleetDemand = getFleetDemandKw(hour, vehicleConfig);
    const facilityDemand = optimizerConfig.facilityBaseLoadKw;
    const miningDemand = getMiningDemandKw(hour, miningConfig, optimizerConfig, solarOutput, fleetDemand);

    // Get grid rate
    const offPeakRate = energyConfig.rateMode === "flat"
      ? energyConfig.flatRate.ratePerKwh
      : energyConfig.touRate.offPeakRate;
    const onPeakRate = energyConfig.rateMode === "flat"
      ? energyConfig.flatRate.ratePerKwh
      : energyConfig.touRate.onPeakRate;
    const gridRate = getGridRateForPeriod(period, offPeakRate, onPeakRate);

    // Determine battery action
    let batteryAction: "charge" | "discharge" | "hold" = "hold";
    let batteryKw = 0;

    const totalDemand = fleetDemand + facilityDemand + miningDemand;
    const netSolar = solarOutput - totalDemand;

    if (netSolar > 0 && batterySoC < 100) {
      // Charge from excess solar
      batteryAction = "charge";
      const roomToCharge = (100 - batterySoC) / 100 * batteryCapacity;
      batteryKw = Math.min(netSolar, roomToCharge, 5); // Max 5kW charge rate
      batterySoC += (batteryKw / batteryCapacity) * 100;
    } else if (netSolar < 0 && batterySoC > optimizerConfig.reserveBatteryPercent) {
      // Discharge to meet demand
      if (period === "peak" || solarOutput < totalDemand) {
        batteryAction = "discharge";
        const available = (batterySoC - optimizerConfig.reserveBatteryPercent) / 100 * batteryCapacity;
        batteryKw = Math.min(Math.abs(netSolar), available, 5);
        batterySoC -= (batteryKw / batteryCapacity) * 100;
      }
    } else if (period === "superOffPeak" && batterySoC < 100 && optimizerConfig.autoArbitrage) {
      // Charge from grid during super off-peak
      batteryAction = "charge";
      const roomToCharge = (100 - batterySoC) / 100 * batteryCapacity;
      batteryKw = Math.min(roomToCharge, 5);
      batterySoC += (batteryKw / batteryCapacity) * 100;
    }

    // Calculate grid import/export
    const netDemand = totalDemand - solarOutput - (batteryAction === "discharge" ? batteryKw : 0);
    const gridImport = Math.max(0, netDemand + (batteryAction === "charge" ? batteryKw : 0));
    const gridExport = Math.max(0, -netDemand);

    simulation.push({
      hour,
      touPeriod: period,
      solarOutput,
      gridRate,
      fleetDemand,
      miningDemand,
      facilityDemand,
      batteryAction,
      batteryKw,
      gridImport,
      gridExport,
    });
  }

  return simulation;
}

/**
 * Calculate baseline cost (no optimization)
 */
function calculateBaselineCost(
  solarConfig: SolarConfig,
  energyConfig: EnergyConfig,
  vehicleConfig: VehicleConfig,
  miningConfig: MiningConfig,
  facilityBaseLoadKw: number
): number {
  let totalCost = 0;
  const avgRate = energyConfig.rateMode === "flat"
    ? energyConfig.flatRate.ratePerKwh
    : (energyConfig.touRate.offPeakRate + energyConfig.touRate.onPeakRate) / 2;

  for (let hour = 0; hour < 24; hour++) {
    const fleetDemand = getFleetDemandKw(hour, vehicleConfig);
    const solarOutput = getSolarOutputKw(hour, solarConfig);
    const miningPower = miningConfig.enabled ?
      (miningConfig.asicQuantity || 1) * 3.5 +
      (miningConfig.gpuEnabled ? (miningConfig.gpuQuantity || 1) * (miningConfig.gpuRigCount || 1) * 0.35 : 0) : 0;

    const totalDemand = fleetDemand + facilityBaseLoadKw + miningPower;
    const gridNeeded = Math.max(0, totalDemand - solarOutput);
    totalCost += gridNeeded * avgRate;
  }

  return totalCost;
}

/**
 * Main optimizer calculation function
 */
export function calculateEnergyOptimization(
  optimizerConfig: OptimizerConfig,
  solarConfig: SolarConfig,
  batteryConfig: BatteryConfig,
  energyConfig: EnergyConfig,
  miningConfig: MiningConfig,
  vehicleConfig: VehicleConfig
): OptimizerCalculation {
  if (!optimizerConfig.enabled) {
    return getEmptyOptimizerCalculation();
  }

  // Run 24-hour simulation
  const simulation = simulate24Hours(
    optimizerConfig,
    solarConfig,
    batteryConfig,
    energyConfig,
    miningConfig,
    vehicleConfig
  );

  // Calculate hourly allocations
  const batteryCapacity = batteryConfig.enabled ? batteryConfig.capacityKwh * batteryConfig.quantity : 0;
  let batterySoC = 50;

  const hourlyAllocations: AllocationPlan[] = [];

  for (let hour = 0; hour < 24; hour++) {
    const allocation = calculateHourlyAllocation(
      hour,
      optimizerConfig,
      solarConfig,
      batteryConfig,
      energyConfig,
      miningConfig,
      vehicleConfig,
      { soc: batterySoC, capacity: batteryCapacity }
    );
    hourlyAllocations.push(allocation);

    // Update battery SoC
    if (allocation.allocations.batteryCharging > 0) {
      batterySoC += (allocation.allocations.batteryCharging / batteryCapacity) * 100;
    }
    if (allocation.sources.battery > 0) {
      batterySoC -= (allocation.sources.battery / batteryCapacity) * 100;
    }
    batterySoC = Math.max(0, Math.min(100, batterySoC));
  }

  // Calculate daily totals
  const dailyTotals = {
    solarGeneration: simulation.reduce((sum, h) => sum + h.solarOutput, 0),
    batteryThroughput: simulation.reduce((sum, h) => sum + h.batteryKw, 0),
    gridImport: simulation.reduce((sum, h) => sum + h.gridImport, 0),
    gridExport: simulation.reduce((sum, h) => sum + h.gridExport, 0),
    fleetCharging: simulation.reduce((sum, h) => sum + h.fleetDemand, 0),
    facilityOps: simulation.reduce((sum, h) => sum + h.facilityDemand, 0),
    miningConsumption: simulation.reduce((sum, h) => sum + h.miningDemand, 0),
  };

  // Calculate costs
  const totalGridCost = hourlyAllocations.reduce((sum, a) => sum + a.costs.gridCost, 0);
  const totalExportRevenue = hourlyAllocations.reduce((sum, a) => sum + a.costs.exportRevenue, 0);
  const netEnergyCost = totalGridCost - totalExportRevenue;

  // Calculate baseline and savings
  const baselineCost = calculateBaselineCost(
    solarConfig,
    energyConfig,
    vehicleConfig,
    miningConfig,
    optimizerConfig.facilityBaseLoadKw
  );
  const savingsVsBaseline = baselineCost - netEnergyCost;
  const optimizationEfficiency = baselineCost > 0 ? (savingsVsBaseline / baselineCost) * 100 : 0;

  // Current hour allocation
  const currentHour = new Date().getHours();
  const currentAllocation = hourlyAllocations[currentHour] || hourlyAllocations[0];

  // Battery cycles (simplified)
  const cyclesUsedToday = dailyTotals.batteryThroughput / (batteryCapacity * 2 || 1);

  return {
    currentAllocation,
    hourlyAllocations,
    dailyTotals,
    costs: {
      totalGridCost,
      totalExportRevenue,
      netEnergyCost,
      savingsVsBaseline,
      optimizationEfficiency,
    },
    batteryState: {
      currentSoC: batterySoC,
      projectedEndOfDaySoC: batterySoC,
      cyclesUsedToday,
    },
    fleetReadiness: {
      vehiclesAtTargetSoC: Math.floor(vehicleConfig.quantity * 0.9), // Estimate
      totalVehicles: vehicleConfig.quantity,
      averageSoC: 85, // Estimate
    },
  };
}

/**
 * Get optimization recommendations
 */
export function getOptimizationRecommendations(
  calc: OptimizerCalculation,
  optimizerConfig: OptimizerConfig
): string[] {
  const recommendations: string[] = [];

  // Check if optimization is saving money
  if (calc.costs.savingsVsBaseline > 0) {
    recommendations.push(
      `Optimization is saving $${calc.costs.savingsVsBaseline.toFixed(2)}/day vs baseline.`
    );
  }

  // Check battery utilization
  if (calc.batteryState.cyclesUsedToday < 0.5) {
    recommendations.push(
      "Battery utilization is low. Consider enabling auto-arbitrage to maximize savings."
    );
  }

  // Check for unmet demand
  const totalUnmet = calc.hourlyAllocations.reduce((sum, a) => sum + a.unmetDemand, 0);
  if (totalUnmet > 0) {
    recommendations.push(
      `${totalUnmet.toFixed(1)} kWh of demand went unmet. Consider increasing grid import limit.`
    );
  }

  // Check export revenue
  if (calc.costs.totalExportRevenue > 0) {
    recommendations.push(
      `Earned $${calc.costs.totalExportRevenue.toFixed(2)} from grid export today.`
    );
  }

  // Check peak hour usage
  const peakHours = calc.hourlyAllocations.filter((a) => a.period === "peak");
  const peakGridImport = peakHours.reduce((sum, a) => sum + a.sources.grid, 0);
  if (peakGridImport > calc.dailyTotals.gridImport * 0.3) {
    recommendations.push(
      "High grid usage during peak hours. Consider shifting loads to off-peak."
    );
  }

  return recommendations;
}
