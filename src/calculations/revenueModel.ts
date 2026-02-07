import {
  RevenueConfig,
  RevenueCalculation,
  RideHailPricing,
  FlatRatePricing,
  SubscriptionPricing,
  Utilization,
} from "@/types/revenue";

/**
 * Calculate average fare for ride-hail pricing
 */
export function calculateRideHailFare(pricing: RideHailPricing): number {
  return (
    pricing.baseFare +
    pricing.perMileRate * pricing.avgTripMiles +
    pricing.perMinuteRate * pricing.avgTripMinutes +
    pricing.bookingFee
  );
}

/**
 * Calculate average fare for flat rate pricing
 */
export function calculateFlatRateFare(pricing: FlatRatePricing): number {
  return pricing.flatFare;
}

/**
 * Calculate average monthly revenue per subscriber
 */
export function calculateSubscriptionRevenue(
  pricing: SubscriptionPricing
): number {
  const overageMiles = Math.max(
    0,
    pricing.avgMemberUsageMiles - pricing.includedMiles
  );
  return pricing.monthlyFee + overageMiles * pricing.overagePerMile;
}

/**
 * Calculate average fare based on pricing model
 */
export function calculateAverageFare(config: RevenueConfig): number {
  switch (config.pricingModel) {
    case "ride_hail":
      return calculateRideHailFare(config.rideHailPricing);
    case "flat_rate":
      return calculateFlatRateFare(config.flatRatePricing);
    case "subscription":
      // For subscription, return equivalent per-trip value
      // Assuming average trips based on miles / avg trip distance
      const avgTripsPerMember = config.subscriptionPricing.avgMemberUsageMiles / 5;
      return calculateSubscriptionRevenue(config.subscriptionPricing) / avgTripsPerMember;
    default:
      return 0;
  }
}

/**
 * Calculate average trip miles based on pricing model
 */
export function getAverageTripMiles(config: RevenueConfig): number {
  switch (config.pricingModel) {
    case "ride_hail":
      return config.rideHailPricing.avgTripMiles;
    case "flat_rate":
      return config.flatRatePricing.routeMiles;
    case "subscription":
      return 5; // Assume 5 miles average for subscription
    default:
      return 5;
  }
}

/**
 * Calculate trips per day
 */
export function calculateTripsPerDay(utilization: Utilization): number {
  return utilization.operatingHoursPerDay * utilization.tripsPerHour;
}

/**
 * Calculate monthly trips for the fleet
 */
export function calculateMonthlyTrips(
  utilization: Utilization,
  fleetSize: number
): number {
  const tripsPerDay = calculateTripsPerDay(utilization);
  return tripsPerDay * utilization.operatingDaysPerMonth * fleetSize;
}

/**
 * Calculate revenue miles (paid miles)
 */
export function calculateRevenueMiles(
  monthlyTrips: number,
  avgTripMiles: number
): number {
  return monthlyTrips * avgTripMiles;
}

/**
 * Calculate total miles including deadhead
 */
export function calculateTotalMiles(
  revenueMiles: number,
  deadheadPercent: number
): number {
  return revenueMiles * (1 + deadheadPercent);
}

/**
 * Calculate platform fees
 */
export function calculatePlatformFees(
  grossRevenue: number,
  feePercent: number
): number {
  return grossRevenue * feePercent;
}

/**
 * Get average trip minutes based on pricing model
 */
export function getAverageTripMinutes(config: RevenueConfig): number {
  switch (config.pricingModel) {
    case "ride_hail":
      return config.rideHailPricing.avgTripMinutes;
    case "flat_rate":
      return config.flatRatePricing.routeMinutes;
    case "subscription":
      return 15; // Assume 15 minutes average for subscription
    default:
      return 15;
  }
}

/**
 * Calculate all revenue metrics including per-trip profitability
 */
export function calculateRevenue(
  config: RevenueConfig,
  fleetSize: number,
  energyRatePerKwh: number = 0.15,
  efficiencyMiPerKwh: number = 3.5,
  maintenancePerMile: number = 0.05
): RevenueCalculation {
  const avgFare = calculateAverageFare(config);
  const avgTripMiles = getAverageTripMiles(config);
  const avgTripMinutes = getAverageTripMinutes(config);
  const tripsPerDay = calculateTripsPerDay(config.utilization);
  const monthlyTrips = calculateMonthlyTrips(config.utilization, fleetSize);
  const grossRevenue = monthlyTrips * avgFare;
  const platformFees = calculatePlatformFees(
    grossRevenue,
    config.platform.feePercent
  );
  const netRevenue = grossRevenue - platformFees;
  const revenueMiles = calculateRevenueMiles(monthlyTrips, avgTripMiles);
  const totalMiles = calculateTotalMiles(
    revenueMiles,
    config.utilization.deadheadPercent
  );

  // Per-trip calculations
  // Include deadhead miles in per-trip cost calculation
  const totalTripMiles = avgTripMiles * (1 + config.utilization.deadheadPercent);
  const tripKwh = totalTripMiles / efficiencyMiPerKwh;
  const energyCostPerTrip = tripKwh * energyRatePerKwh;
  const maintenanceCostPerTrip = totalTripMiles * maintenancePerMile;
  const variableCostPerTrip = energyCostPerTrip + maintenanceCostPerTrip;

  const revenuePerTrip = avgFare * (1 - config.platform.feePercent);
  const profitPerTrip = revenuePerTrip - variableCostPerTrip;
  const profitMarginPerTrip = avgFare > 0 ? (profitPerTrip / avgFare) * 100 : 0;

  return {
    avgFare,
    tripsPerDay,
    monthlyTrips,
    grossRevenue,
    platformFees,
    netRevenue,
    revenueMiles,
    totalMiles,

    // Per-trip breakdown
    avgTripMiles,
    avgTripMinutes,
    revenuePerTrip,
    energyCostPerTrip,
    maintenanceCostPerTrip,
    variableCostPerTrip,
    profitPerTrip,
    profitMarginPerTrip,
  };
}
