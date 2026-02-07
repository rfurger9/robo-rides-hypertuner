export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface RoofPolygon {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  areaSqFt: number;
  tiltDegrees: number; // Default: 20
  azimuthDegrees: number; // Default: 180 (south-facing)
}

export interface SolarConfig {
  enabled: boolean;
  useManualEntry: boolean; // Toggle between map/manual input
  location: Location | null;
  polygons: RoofPolygon[];
  systemSizeKw: number;
  annualOutputKwh: number;
  monthlyOutputKwh: number[]; // 12 months from PVWatts or calculated
  costPerWatt: number; // Default: $2.75
  federalItcPercent: number; // Default: 0.30
  stateRebate: number; // Default: $0
  permitFees: number; // Default: $500
  panelWattage: number; // Default: 400W
  panelSqFt: number; // Default: 17.5
  annualProductionFactor: number; // kWh per kW per year (default: 1500)
  amortizationYears: number; // Default: 25
}

export interface SolarCostCalculation {
  grossCost: number;
  federalCredit: number;
  netCost: number;
  monthlyAmortizedCost: number; // Net cost / (25 years * 12)
}

export interface SolarOutputCalculation {
  monthlyOutputKwh: number[]; // 12 months
  annualOutputKwh: number;
  averageDailyKwh: number;
}

export interface PVWattsResponse {
  outputs: {
    ac_monthly: number[]; // 12 monthly values in kWh
    ac_annual: number; // Total annual kWh
    solrad_monthly: number[]; // Solar radiation data
  };
  station_info?: {
    city: string;
    state: string;
  };
}

// Monthly solar production factors (normalized to sum to 1.0)
// Based on typical northern hemisphere patterns
export const MONTHLY_SOLAR_FACTORS = [
  0.055, // Jan
  0.065, // Feb
  0.085, // Mar
  0.095, // Apr
  0.105, // May
  0.11, // Jun
  0.115, // Jul
  0.105, // Aug
  0.09, // Sep
  0.075, // Oct
  0.055, // Nov
  0.045, // Dec
];

// Regional annual solar factors (kWh per kW installed)
export const REGIONAL_SOLAR_FACTORS: Record<string, number> = {
  southwest: 1800, // AZ, NV, SoCal
  california: 1650, // NorCal, Central CA
  southeast: 1400, // FL, TX, GA
  midwest: 1300, // IL, OH, MI
  northeast: 1200, // NY, MA, PA
  northwest: 1100, // WA, OR
  default: 1500,
};

export const defaultSolarConfig: SolarConfig = {
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
};
