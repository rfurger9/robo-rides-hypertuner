export type PricingModel = "ride_hail" | "flat_rate" | "subscription";

export type PlatformMode = "own_platform" | "uber" | "lyft" | "hybrid";

export interface RideHailPricing {
  baseFare: number; // Default: $2.50
  perMileRate: number; // Default: $1.50
  perMinuteRate: number; // Default: $0.30
  bookingFee: number; // Default: $2.00
  avgTripMiles: number; // Default: 5.0
  avgTripMinutes: number; // Default: 15
}

export interface FlatRatePricing {
  routeName: string;
  flatFare: number; // Default: $35.00
  routeMiles: number; // Default: 20
  routeMinutes: number; // Default: 35
}

export interface SubscriptionPricing {
  monthlyFee: number; // Default: $299
  includedMiles: number; // Default: 500
  overagePerMile: number; // Default: $0.50
  avgMemberUsageMiles: number; // Default: 400
}

export interface Utilization {
  operatingHoursPerDay: number; // Default: 12, Range: 1-24
  tripsPerHour: number; // Default: 2.0, Range: 0.5-6
  operatingDaysPerMonth: number; // Default: 28, Range: 1-31
  deadheadPercent: number; // Default: 0.20, Range: 0-0.5
}

export interface PlatformConfig {
  mode: PlatformMode;
  feePercent: number; // 0% own, 25% uber/lyft
  ownPlatformCostsMonthly: number; // Default: $500
}

export interface RevenueConfig {
  pricingModel: PricingModel;
  rideHailPricing: RideHailPricing;
  flatRatePricing: FlatRatePricing;
  subscriptionPricing: SubscriptionPricing;
  utilization: Utilization;
  platform: PlatformConfig;
}

export interface RevenueCalculation {
  avgFare: number;
  tripsPerDay: number;
  monthlyTrips: number;
  grossRevenue: number;
  platformFees: number;
  netRevenue: number;
  revenueMiles: number;
  totalMiles: number; // Including deadhead

  // Per-trip breakdown
  avgTripMiles: number;
  avgTripMinutes: number;
  revenuePerTrip: number; // Fare after platform fees
  energyCostPerTrip: number;
  maintenanceCostPerTrip: number;
  variableCostPerTrip: number; // Energy + maintenance
  profitPerTrip: number; // Revenue - variable costs
  profitMarginPerTrip: number; // Profit / Fare (percentage)
}
