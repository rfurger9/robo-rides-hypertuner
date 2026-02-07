import { VehicleConfig, VehicleCostCalculation } from "./vehicle";
import { RevenueConfig, RevenueCalculation } from "./revenue";
import {
  SolarConfig,
  SolarCostCalculation,
  MONTHLY_SOLAR_FACTORS,
} from "./solar";
import { EnergyConfig, EnergyCalculation } from "./energy";
import {
  BatteryConfig,
  BatteryCostCalculation,
  defaultBatteryConfig,
} from "./battery";
import {
  MiningConfig,
  MiningRevenue,
  defaultMiningConfig,
} from "./mining";
import {
  HumanoidConfig,
  HumanoidCalculation,
  defaultHumanoidConfig,
} from "./humanoid";
import {
  OptimizerConfig,
  OptimizerCalculation,
  defaultOptimizerConfig,
} from "./optimizer";
import {
  MonthlyCosts,
  MonthlyRevenue,
  BreakEvenAnalysis,
  ScenarioComparison,
} from "./financial";

export interface ScenarioConfig {
  name: string;
  description?: string;
  vehicle: VehicleConfig;
  revenue: RevenueConfig;
  solar: SolarConfig;
  battery: BatteryConfig;
  energy: EnergyConfig;
  mining: MiningConfig;
  humanoid: HumanoidConfig;
  optimizer: OptimizerConfig;
}

export interface ScenarioCalculations {
  vehicleCosts: VehicleCostCalculation;
  revenue: RevenueCalculation;
  solarCosts: SolarCostCalculation;
  batteryCosts: BatteryCostCalculation;
  energy: EnergyCalculation;
  mining: MiningRevenue;
  humanoid: HumanoidCalculation;
  optimizer: OptimizerCalculation;
  monthlyCosts: MonthlyCosts;
  monthlyRevenue: MonthlyRevenue;
  breakEven: BreakEvenAnalysis;
  comparison: ScenarioComparison;
}

export interface Scenario {
  id?: string;
  config: ScenarioConfig;
  calculations: ScenarioCalculations;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default scenario configuration
export const defaultScenarioConfig: ScenarioConfig = {
  name: "New Scenario",
  vehicle: {
    vehicle: {
      id: "",
      vehicleKey: "tesla_model3_lr",
      displayName: "Tesla Model 3 Long Range",
      manufacturer: "Tesla",
      msrp: 42490,
      batteryKwh: 82,
      efficiencyMiPerKwh: 4.2,
      rangeMiles: 341,
      modelYear: 2024,
      isDefault: true,
    },
    quantity: 1,
    financingMode: "cash",
    loanDetails: {
      downPayment: 10000,
      loanTermMonths: 60,
      interestRateApr: 0.06,
    },
    leaseDetails: {
      monthlyLease: 500,
      leaseTermMonths: 36,
      residualValue: 25000,
    },
    capitalCosts: {
      purchasePrice: 42490,
      taxesFees: 4249, // 10%
      avHardwareRetrofit: 0,
      brandingWrap: 3000,
      initialAccessories: 500,
    },
    operatingCosts: {
      insuranceMonthly: 350,
      maintenancePerMile: 0.05,
      cleaningPerDay: 15,
      connectivityMonthly: 100,
      softwareSubscription: 200,
      parkingMonthly: 0,
      registrationAnnual: 500,
    },
    depreciationYears: 5,
    taxFeePercent: 0.1,
  },
  revenue: {
    pricingModel: "ride_hail",
    rideHailPricing: {
      baseFare: 2.5,
      perMileRate: 0.3,
      perMinuteRate: 0,
      bookingFee: 2.0,
      avgTripMiles: 5.0,
      avgTripMinutes: 15,
    },
    flatRatePricing: {
      routeName: "Airport Shuttle",
      flatFare: 35,
      routeMiles: 20,
      routeMinutes: 35,
    },
    subscriptionPricing: {
      monthlyFee: 299,
      includedMiles: 500,
      overagePerMile: 0.5,
      avgMemberUsageMiles: 400,
    },
    utilization: {
      operatingHoursPerDay: 12,
      tripsPerHour: 2.0,
      operatingDaysPerMonth: 28,
      deadheadPercent: 0.2,
    },
    platform: {
      mode: "own_platform",
      feePercent: 0,
      ownPlatformCostsMonthly: 500,
    },
  },
  solar: {
    enabled: false,
    useManualEntry: true,
    location: null,
    polygons: [],
    systemSizeKw: 10,
    annualOutputKwh: 15000,
    monthlyOutputKwh: MONTHLY_SOLAR_FACTORS.map((f) => f * 15000),
    costPerWatt: 2.75,
    federalItcPercent: 0.3,
    stateRebate: 0,
    permitFees: 500,
    panelWattage: 400,
    panelSqFt: 17.5,
    annualProductionFactor: 1500,
    amortizationYears: 25,
  },
  battery: defaultBatteryConfig,
  energy: {
    rateMode: "flat",
    flatRate: {
      ratePerKwh: 0.25,
    },
    touRate: {
      offPeakRate: 0.15,
      offPeakHours: "12am-6am",
      partialPeakRate: 0.3,
      partialPeakHours: "6am-4pm, 9pm-12am",
      onPeakRate: 0.45,
      onPeakHours: "4pm-9pm",
    },
    netMetering: {
      enabled: true,
      exportRatePercent: 0.75,
      annualTrueUp: true,
    },
  },
  mining: defaultMiningConfig,
  humanoid: defaultHumanoidConfig,
  optimizer: defaultOptimizerConfig,
};
