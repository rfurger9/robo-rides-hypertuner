export interface Vehicle {
  id: string;
  vehicleKey: string;
  displayName: string;
  manufacturer: string | null;
  msrp: number;
  batteryKwh: number;
  efficiencyMiPerKwh: number;
  rangeMiles: number;
  modelYear: number;
  isDefault: boolean;
}

export type FinancingMode = "cash" | "loan" | "lease";

export interface LoanDetails {
  downPayment: number;
  loanTermMonths: number;
  interestRateApr: number;
}

export interface LeaseDetails {
  monthlyLease: number;
  leaseTermMonths: number;
  residualValue: number;
}

export interface VehicleCapitalCosts {
  purchasePrice: number;
  taxesFees: number; // Default: 10% of MSRP
  avHardwareRetrofit: number; // Default: $0
  brandingWrap: number; // Default: $3,000
  initialAccessories: number; // Default: $500
}

export interface VehicleOperatingCosts {
  insuranceMonthly: number; // Default: $350
  maintenancePerMile: number; // Default: $0.05
  cleaningPerDay: number; // Default: $15
  connectivityMonthly: number; // Default: $100
  softwareSubscription: number; // Default: $200
  parkingMonthly: number; // Default: $0
  registrationAnnual: number; // Default: $500
}

export interface VehicleConfig {
  vehicle: Vehicle;
  quantity: number;
  financingMode: FinancingMode;
  loanDetails: LoanDetails;
  leaseDetails: LeaseDetails;
  capitalCosts: VehicleCapitalCosts;
  operatingCosts: VehicleOperatingCosts;
  depreciationYears: number; // Default: 5
  taxFeePercent: number; // Default: 0.10 (10%)
}

export interface VehicleCostCalculation {
  totalCapitalCost: number;
  monthlyFixedCost: number;
  costPerMile: number;
  amortizedCapitalMonthly: number;
  depreciationMonthly: number;
  monthlyPayment: number; // For loan/lease
  totalMonthlyVehicleCost: number;
}
