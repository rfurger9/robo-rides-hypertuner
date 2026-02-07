"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  ScenarioConfig,
  ScenarioCalculations,
  defaultScenarioConfig,
  VehicleConfig,
  RevenueConfig,
  SolarConfig,
  EnergyConfig,
  Vehicle,
  MiningConfig,
  HumanoidConfig,
  OptimizerConfig,
} from "@/types";
import { BatteryConfig } from "@/types/battery";
import {
  calculateVehicleCosts,
  calculateRevenue,
  calculateSolarCost,
  calculateEnergyBalance,
  calculateBatteryCost,
  getEffectiveEnergyRate,
  calculateMonthlyCosts,
  calculateMonthlyRevenue,
  calculateBreakEven,
  calculateTotalInvestment,
  calculateScenarioComparison,
  calculateMiningProfitability,
  calculateHumanoidEconomics,
  calculateEnergyOptimization,
} from "@/calculations";

// Action types
type ScenarioAction =
  | { type: "SET_CONFIG"; payload: ScenarioConfig }
  | { type: "UPDATE_VEHICLE"; payload: Partial<VehicleConfig> }
  | { type: "SELECT_VEHICLE"; payload: Vehicle }
  | { type: "UPDATE_REVENUE"; payload: Partial<RevenueConfig> }
  | { type: "UPDATE_SOLAR"; payload: Partial<SolarConfig> }
  | { type: "UPDATE_ENERGY"; payload: Partial<EnergyConfig> }
  | { type: "UPDATE_BATTERY"; payload: Partial<BatteryConfig> }
  | { type: "UPDATE_MINING"; payload: Partial<MiningConfig> }
  | { type: "TOGGLE_MINING"; payload: boolean }
  | { type: "UPDATE_HUMANOID"; payload: Partial<HumanoidConfig> }
  | { type: "TOGGLE_HUMANOID"; payload: boolean }
  | { type: "UPDATE_OPTIMIZER"; payload: Partial<OptimizerConfig> }
  | { type: "TOGGLE_OPTIMIZER"; payload: boolean }
  | { type: "SET_FLEET_SIZE"; payload: number }
  | { type: "TOGGLE_SOLAR"; payload: boolean }
  | { type: "RESET" };

// Reducer
function scenarioReducer(
  state: ScenarioConfig,
  action: ScenarioAction
): ScenarioConfig {
  switch (action.type) {
    case "SET_CONFIG":
      return action.payload;

    case "UPDATE_VEHICLE":
      return {
        ...state,
        vehicle: { ...state.vehicle, ...action.payload },
      };

    case "SELECT_VEHICLE":
      return {
        ...state,
        vehicle: {
          ...state.vehicle,
          vehicle: action.payload,
          capitalCosts: {
            ...state.vehicle.capitalCosts,
            purchasePrice: action.payload.msrp,
            taxesFees: action.payload.msrp * state.vehicle.taxFeePercent,
          },
        },
      };

    case "UPDATE_REVENUE":
      return {
        ...state,
        revenue: { ...state.revenue, ...action.payload },
      };

    case "UPDATE_SOLAR":
      const newSolar = { ...state.solar, ...action.payload };
      // Auto-calculate annual output when system size or production factor changes
      if (action.payload.systemSizeKw !== undefined || action.payload.annualProductionFactor !== undefined) {
        newSolar.annualOutputKwh = newSolar.systemSizeKw * newSolar.annualProductionFactor;
      }
      return {
        ...state,
        solar: newSolar,
      };

    case "UPDATE_ENERGY":
      return {
        ...state,
        energy: { ...state.energy, ...action.payload },
      };

    case "UPDATE_BATTERY":
      return {
        ...state,
        battery: { ...state.battery, ...action.payload },
      };

    case "UPDATE_MINING":
      return {
        ...state,
        mining: { ...state.mining, ...action.payload },
      };

    case "TOGGLE_MINING":
      return {
        ...state,
        mining: { ...state.mining, enabled: action.payload },
      };

    case "UPDATE_HUMANOID":
      return {
        ...state,
        humanoid: { ...state.humanoid, ...action.payload },
      };

    case "TOGGLE_HUMANOID":
      return {
        ...state,
        humanoid: { ...state.humanoid, enabled: action.payload },
      };

    case "UPDATE_OPTIMIZER":
      return {
        ...state,
        optimizer: { ...state.optimizer, ...action.payload },
      };

    case "TOGGLE_OPTIMIZER":
      return {
        ...state,
        optimizer: { ...state.optimizer, enabled: action.payload },
      };

    case "SET_FLEET_SIZE":
      return {
        ...state,
        vehicle: { ...state.vehicle, quantity: action.payload },
      };

    case "TOGGLE_SOLAR":
      return {
        ...state,
        solar: { ...state.solar, enabled: action.payload },
      };

    case "RESET":
      return defaultScenarioConfig;

    default:
      return state;
  }
}

// Context type
interface ScenarioContextType {
  config: ScenarioConfig;
  calculations: ScenarioCalculations;
  dispatch: React.Dispatch<ScenarioAction>;
  // Convenience methods
  setVehicle: (vehicle: Vehicle) => void;
  setFleetSize: (size: number) => void;
  toggleSolar: (enabled: boolean) => void;
  toggleMining: (enabled: boolean) => void;
  updateVehicle: (updates: Partial<VehicleConfig>) => void;
  updateRevenue: (updates: Partial<RevenueConfig>) => void;
  updateSolar: (updates: Partial<SolarConfig>) => void;
  updateEnergy: (updates: Partial<EnergyConfig>) => void;
  updateBattery: (updates: Partial<BatteryConfig>) => void;
  updateMining: (updates: Partial<MiningConfig>) => void;
  updateHumanoid: (updates: Partial<HumanoidConfig>) => void;
  toggleHumanoid: (enabled: boolean) => void;
  updateOptimizer: (updates: Partial<OptimizerConfig>) => void;
  toggleOptimizer: (enabled: boolean) => void;
  resetScenario: () => void;
  loadScenario: (config: ScenarioConfig) => void;
}

// Create context
const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined
);

// Provider component
export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [config, dispatch] = useReducer(scenarioReducer, defaultScenarioConfig);

  // Calculate all derived values
  const calculations = useMemo((): ScenarioCalculations => {
    const energyRate = getEffectiveEnergyRate(config.energy);
    const vehicleCosts = calculateVehicleCosts(config.vehicle, energyRate);
    const revenue = calculateRevenue(
      config.revenue,
      config.vehicle.quantity,
      energyRate,
      config.vehicle.vehicle.efficiencyMiPerKwh,
      config.vehicle.operatingCosts.maintenancePerMile
    );
    const solarCosts = calculateSolarCost(config.solar);
    const batteryCosts = config.battery.enabled
      ? calculateBatteryCost(config.battery)
      : { totalCapacity: 0, usableCapacity: 0, totalCost: 0, monthlyAmortizedCost: 0, dailyCycleValue: 0 };
    // Calculate fleet charging needs for mining solar offset calculation
    const dailyMiles = revenue.totalMiles / 30;
    const fleetChargingKwhPerDay = dailyMiles / config.vehicle.vehicle.efficiencyMiPerKwh;
    const miningConfigWithFleet = {
      ...config.mining,
      fleetChargingKwhPerDay,
    };
    const mining = calculateMiningProfitability(miningConfigWithFleet, config.energy, config.solar, config.battery);
    const humanoid = calculateHumanoidEconomics(config.humanoid, config.vehicle.quantity);
    const optimizer = calculateEnergyOptimization(
      config.optimizer,
      config.solar,
      config.battery,
      config.energy,
      config.mining,
      config.vehicle
    );
    const energy = calculateEnergyBalance(
      revenue.totalMiles,
      config.vehicle.vehicle.efficiencyMiPerKwh,
      config.solar,
      config.energy,
      config.battery
    );
    const monthlyCosts = calculateMonthlyCosts(
      config.vehicle,
      vehicleCosts,
      config.revenue,
      config.solar,
      solarCosts,
      energy,
      revenue
    );
    const monthlyRevenue = calculateMonthlyRevenue(revenue, energy);

    // Total investment includes all capital costs
    let totalInvestment = calculateTotalInvestment(
      config.vehicle,
      config.solar,
      solarCosts
    ) + batteryCosts.totalCost;

    // Add mining hardware cost if enabled
    if (config.mining.enabled) {
      totalInvestment += mining.totalHardwareCost;
    }

    // Add humanoid capital cost if enabled
    if (config.humanoid.enabled) {
      totalInvestment += humanoid.totalCapitalCost;
    }

    // Monthly profit includes all revenue streams and costs
    let monthlyProfit =
      monthlyRevenue.totalMonthlyRevenue -
      monthlyCosts.totalMonthlyCost -
      batteryCosts.monthlyAmortizedCost +
      energy.monthlyBatterySavings;

    // Add optimizer savings (daily savings * 30 days)
    if (config.optimizer.enabled) {
      monthlyProfit += optimizer.costs.savingsVsBaseline * 30;
    }

    // Add mining net profit if enabled
    if (config.mining.enabled) {
      monthlyProfit += mining.monthlyNetProfit;
    }

    // Add humanoid labor savings if enabled and comparing to human labor
    if (config.humanoid.enabled && config.humanoid.laborComparisonEnabled) {
      monthlyProfit += humanoid.laborComparison.monthlySavings;
    }

    const breakEven = calculateBreakEven(totalInvestment, monthlyProfit);
    const comparison = calculateScenarioComparison(
      config.vehicle,
      config.revenue,
      config.solar,
      config.energy
    );

    return {
      vehicleCosts,
      revenue,
      solarCosts,
      batteryCosts,
      energy,
      mining,
      humanoid,
      optimizer,
      monthlyCosts,
      monthlyRevenue,
      breakEven,
      comparison,
    };
  }, [config]);

  // Convenience methods
  const setVehicle = useCallback((vehicle: Vehicle) => {
    dispatch({ type: "SELECT_VEHICLE", payload: vehicle });
  }, []);

  const setFleetSize = useCallback((size: number) => {
    dispatch({ type: "SET_FLEET_SIZE", payload: size });
  }, []);

  const toggleSolar = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_SOLAR", payload: enabled });
  }, []);

  const updateVehicle = useCallback((updates: Partial<VehicleConfig>) => {
    dispatch({ type: "UPDATE_VEHICLE", payload: updates });
  }, []);

  const updateRevenue = useCallback((updates: Partial<RevenueConfig>) => {
    dispatch({ type: "UPDATE_REVENUE", payload: updates });
  }, []);

  const updateSolar = useCallback((updates: Partial<SolarConfig>) => {
    dispatch({ type: "UPDATE_SOLAR", payload: updates });
  }, []);

  const updateEnergy = useCallback((updates: Partial<EnergyConfig>) => {
    dispatch({ type: "UPDATE_ENERGY", payload: updates });
  }, []);

  const updateBattery = useCallback((updates: Partial<BatteryConfig>) => {
    dispatch({ type: "UPDATE_BATTERY", payload: updates });
  }, []);

  const updateMining = useCallback((updates: Partial<MiningConfig>) => {
    dispatch({ type: "UPDATE_MINING", payload: updates });
  }, []);

  const toggleMining = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_MINING", payload: enabled });
  }, []);

  const updateHumanoid = useCallback((updates: Partial<HumanoidConfig>) => {
    dispatch({ type: "UPDATE_HUMANOID", payload: updates });
  }, []);

  const toggleHumanoid = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_HUMANOID", payload: enabled });
  }, []);

  const updateOptimizer = useCallback((updates: Partial<OptimizerConfig>) => {
    dispatch({ type: "UPDATE_OPTIMIZER", payload: updates });
  }, []);

  const toggleOptimizer = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_OPTIMIZER", payload: enabled });
  }, []);

  const resetScenario = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const loadScenario = useCallback((newConfig: ScenarioConfig) => {
    dispatch({ type: "SET_CONFIG", payload: newConfig });
  }, []);

  const value = useMemo(
    () => ({
      config,
      calculations,
      dispatch,
      setVehicle,
      setFleetSize,
      toggleSolar,
      toggleMining,
      toggleHumanoid,
      toggleOptimizer,
      updateVehicle,
      updateRevenue,
      updateSolar,
      updateEnergy,
      updateBattery,
      updateMining,
      updateHumanoid,
      updateOptimizer,
      resetScenario,
      loadScenario,
    }),
    [
      config,
      calculations,
      setVehicle,
      setFleetSize,
      toggleSolar,
      toggleMining,
      toggleHumanoid,
      toggleOptimizer,
      updateVehicle,
      updateRevenue,
      updateSolar,
      updateEnergy,
      updateBattery,
      updateMining,
      updateHumanoid,
      updateOptimizer,
      resetScenario,
      loadScenario,
    ]
  );

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

// Hook to use the context
export function useScenario() {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
