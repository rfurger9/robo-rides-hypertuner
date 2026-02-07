"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { ToggleGroup } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { OutputRow } from "@/components/ui/InfoTooltip";
import { formatCurrency, formatNumber } from "@/calculations";
import { PricingModel, PlatformMode } from "@/types";

export function RevenueTab() {
  const { config, calculations, updateRevenue } = useScenario();

  const handlePricingModelChange = (model: string) => {
    updateRevenue({ pricingModel: model as PricingModel });
  };

  const handlePlatformChange = (mode: string) => {
    const feePercent =
      mode === "own_platform" ? 0 : mode === "hybrid" ? 0.15 : 0.25;
    updateRevenue({
      platform: {
        ...config.revenue.platform,
        mode: mode as PlatformMode,
        feePercent,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Model */}
        <Card title="Pricing Model">
          <div className="space-y-4">
            <ToggleGroup
              label="Revenue Model"
              value={config.revenue.pricingModel}
              onChange={handlePricingModelChange}
              options={[
                { value: "ride_hail", label: "Ride-Hail" },
                { value: "flat_rate", label: "Flat Rate" },
                { value: "subscription", label: "Subscription" },
              ]}
            />

            {config.revenue.pricingModel === "ride_hail" && (
              <div className="space-y-4 pt-4">
                <Input
                  label="Base Fare"
                  value={config.revenue.rideHailPricing.baseFare}
                  onChange={(v) =>
                    updateRevenue({
                      rideHailPricing: {
                        ...config.revenue.rideHailPricing,
                        baseFare: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  step={0.25}
                  tooltip="Fixed charge at the start of each ride. Uber/Lyft base fares typically range from $1-3 depending on market."
                />
                <Input
                  label="Per Mile Rate"
                  value={config.revenue.rideHailPricing.perMileRate}
                  onChange={(v) =>
                    updateRevenue({
                      rideHailPricing: {
                        ...config.revenue.rideHailPricing,
                        perMileRate: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  step={0.1}
                  tooltip="Charge per mile driven during the trip. Typical rates range from $0.80-2.00/mile depending on market and service level."
                />
                <Input
                  label="Per Minute Rate"
                  value={config.revenue.rideHailPricing.perMinuteRate}
                  onChange={(v) =>
                    updateRevenue({
                      rideHailPricing: {
                        ...config.revenue.rideHailPricing,
                        perMinuteRate: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  step={0.05}
                  tooltip="Charge per minute of trip duration. Accounts for traffic and wait time. Typical rates range from $0.15-0.40/min."
                />
                <Input
                  label="Booking Fee"
                  value={config.revenue.rideHailPricing.bookingFee}
                  onChange={(v) =>
                    updateRevenue({
                      rideHailPricing: {
                        ...config.revenue.rideHailPricing,
                        bookingFee: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  step={0.5}
                  tooltip="Fixed service fee added to each ride. Covers dispatch costs and insurance. Typically $2-3 per ride."
                />
                <Slider
                  label="Average Trip Miles"
                  value={config.revenue.rideHailPricing.avgTripMiles}
                  onChange={(v) =>
                    updateRevenue({
                      rideHailPricing: {
                        ...config.revenue.rideHailPricing,
                        avgTripMiles: v,
                      },
                    })
                  }
                  min={1}
                  max={30}
                  step={0.5}
                  unit=" mi"
                  tooltip="Average distance per passenger trip. Urban areas average 3-5 miles. Suburban/airport trips average 10-20 miles."
                />
                <Slider
                  label="Average Trip Minutes"
                  value={config.revenue.rideHailPricing.avgTripMinutes}
                  onChange={(v) =>
                    updateRevenue({
                      rideHailPricing: {
                        ...config.revenue.rideHailPricing,
                        avgTripMinutes: v,
                      },
                    })
                  }
                  min={5}
                  max={60}
                  step={1}
                  unit=" min"
                  tooltip="Average duration per trip including traffic. Affects per-minute revenue component. Typical urban trip is 15-25 minutes."
                />
              </div>
            )}

            {config.revenue.pricingModel === "flat_rate" && (
              <div className="space-y-4 pt-4">
                <Input
                  label="Route Name"
                  type="text"
                  value={config.revenue.flatRatePricing.routeName}
                  onChange={(v) =>
                    updateRevenue({
                      flatRatePricing: {
                        ...config.revenue.flatRatePricing,
                        routeName: String(v),
                      },
                    })
                  }
                  tooltip="Name or description of the fixed route (e.g., 'Airport Shuttle', 'Downtown Loop')."
                />
                <Input
                  label="Flat Fare"
                  value={config.revenue.flatRatePricing.flatFare}
                  onChange={(v) =>
                    updateRevenue({
                      flatRatePricing: {
                        ...config.revenue.flatRatePricing,
                        flatFare: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  tooltip="Fixed price per trip regardless of duration or traffic. Good for predictable routes like airport transfers."
                />
                <Input
                  label="Route Miles"
                  value={config.revenue.flatRatePricing.routeMiles}
                  onChange={(v) =>
                    updateRevenue({
                      flatRatePricing: {
                        ...config.revenue.flatRatePricing,
                        routeMiles: Number(v),
                      },
                    })
                  }
                  suffix="mi"
                  tooltip="One-way distance of the fixed route. Used to calculate energy and maintenance costs per trip."
                />
              </div>
            )}

            {config.revenue.pricingModel === "subscription" && (
              <div className="space-y-4 pt-4">
                <Input
                  label="Monthly Fee"
                  value={config.revenue.subscriptionPricing.monthlyFee}
                  onChange={(v) =>
                    updateRevenue({
                      subscriptionPricing: {
                        ...config.revenue.subscriptionPricing,
                        monthlyFee: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  tooltip="Fixed monthly subscription charge for unlimited or capped rides. Provides predictable recurring revenue."
                />
                <Input
                  label="Included Miles"
                  value={config.revenue.subscriptionPricing.includedMiles}
                  onChange={(v) =>
                    updateRevenue({
                      subscriptionPricing: {
                        ...config.revenue.subscriptionPricing,
                        includedMiles: Number(v),
                      },
                    })
                  }
                  suffix="mi"
                  tooltip="Miles included in the monthly subscription before overage charges apply. Set high for 'unlimited' plans."
                />
                <Input
                  label="Overage Per Mile"
                  value={config.revenue.subscriptionPricing.overagePerMile}
                  onChange={(v) =>
                    updateRevenue({
                      subscriptionPricing: {
                        ...config.revenue.subscriptionPricing,
                        overagePerMile: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  step={0.1}
                  tooltip="Additional charge per mile beyond the included miles. Discourages excessive usage while adding revenue."
                />
              </div>
            )}
          </div>
        </Card>

        {/* Utilization */}
        <Card title="Utilization">
          <div className="space-y-4">
            <Slider
              label="Operating Hours per Day"
              value={config.revenue.utilization.operatingHoursPerDay}
              onChange={(v) =>
                updateRevenue({
                  utilization: {
                    ...config.revenue.utilization,
                    operatingHoursPerDay: v,
                  },
                })
              }
              min={1}
              max={24}
              unit=" hrs"
              tooltip="Hours per day the vehicle is actively taking trips. Autonomous vehicles can run 20+ hours. Account for charging time."
            />
            <Slider
              label="Trips per Hour"
              value={config.revenue.utilization.tripsPerHour}
              onChange={(v) =>
                updateRevenue({
                  utilization: {
                    ...config.revenue.utilization,
                    tripsPerHour: v,
                  },
                })
              }
              min={0.5}
              max={6}
              step={0.25}
              formatValue={(v) => v.toFixed(1)}
              tooltip="Average completed trips per operating hour. Depends on demand density and trip length. Urban areas: 2-4/hr, suburban: 1-2/hr."
            />
            <Slider
              label="Operating Days per Month"
              value={config.revenue.utilization.operatingDaysPerMonth}
              onChange={(v) =>
                updateRevenue({
                  utilization: {
                    ...config.revenue.utilization,
                    operatingDaysPerMonth: v,
                  },
                })
              }
              min={1}
              max={31}
              unit=" days"
              tooltip="Days per month the vehicle is in service. Account for maintenance, weather, and scheduled downtime. Typical: 26-30 days."
            />
            <Slider
              label="Deadhead Percentage"
              value={config.revenue.utilization.deadheadPercent * 100}
              onChange={(v) =>
                updateRevenue({
                  utilization: {
                    ...config.revenue.utilization,
                    deadheadPercent: v / 100,
                  },
                })
              }
              min={0}
              max={50}
              step={5}
              unit="%"
              tooltip="Percentage of miles driven without passengers (returning to pickup, repositioning). Industry average: 20-40%. Affects energy costs."
            />
          </div>
        </Card>

        {/* Platform */}
        <Card title="Platform">
          <div className="space-y-4">
            <ToggleGroup
              label="Rideshare Platform"
              value={config.revenue.platform.mode}
              onChange={handlePlatformChange}
              options={[
                { value: "own_platform", label: "Own App" },
                { value: "uber", label: "Uber" },
                { value: "lyft", label: "Lyft" },
              ]}
            />

            <div className="pt-4 space-y-4">
              <Slider
                label="Platform Fee"
                value={config.revenue.platform.feePercent * 100}
                onChange={(v) =>
                  updateRevenue({
                    platform: {
                      ...config.revenue.platform,
                      feePercent: v / 100,
                    },
                  })
                }
                min={0}
                max={40}
                step={1}
                unit="%"
                tooltip="Percentage of each fare taken by the rideshare platform. Uber/Lyft typically charge 20-30%. Own platform = 0%."
              />
              {config.revenue.platform.mode === "own_platform" && (
                <Input
                  label="Own Platform Costs"
                  value={config.revenue.platform.ownPlatformCostsMonthly}
                  onChange={(v) =>
                    updateRevenue({
                      platform: {
                        ...config.revenue.platform,
                        ownPlatformCostsMonthly: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  suffix="/mo"
                  tooltip="Monthly cost for your own dispatch app, server hosting, customer support, and marketing. Typically $2,000-10,000/month."
                />
              )}
            </div>
          </div>
        </Card>

        {/* Per-Trip Profitability */}
        <Card title="Per-Trip Profitability">
          <div className="space-y-4">
            {/* Fare Breakdown */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">Trip Details</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-slate-500">Distance</p>
                  <p className="font-semibold">{formatNumber(calculations.revenue.avgTripMiles, 1)} mi</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="font-semibold">{formatNumber(calculations.revenue.avgTripMinutes, 0)} min</p>
                </div>
              </div>
            </div>

            {/* Revenue Per Trip */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Fare (before fees)</span>
                <span className="font-medium">{formatCurrency(calculations.revenue.avgFare)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Platform Fee ({(config.revenue.platform.feePercent * 100).toFixed(0)}%)</span>
                <span className="font-medium text-red-500">
                  -{formatCurrency(calculations.revenue.avgFare * config.revenue.platform.feePercent)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-600">
                <span className="text-slate-700 dark:text-slate-300">Net Revenue per Trip</span>
                <span className="font-semibold">{formatCurrency(calculations.revenue.revenuePerTrip)}</span>
              </div>
            </div>

            {/* Costs Per Trip */}
            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Variable Costs</p>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Energy ({formatNumber(calculations.revenue.avgTripMiles * (1 + config.revenue.utilization.deadheadPercent) / config.vehicle.vehicle.efficiencyMiPerKwh, 2)} kWh)</span>
                <span className="font-medium text-red-500">
                  -{formatCurrency(calculations.revenue.energyCostPerTrip)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Maintenance ({formatNumber(calculations.revenue.avgTripMiles * (1 + config.revenue.utilization.deadheadPercent), 1)} mi total)</span>
                <span className="font-medium text-red-500">
                  -{formatCurrency(calculations.revenue.maintenanceCostPerTrip)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span className="text-slate-600 dark:text-slate-400">Total Variable Cost</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(calculations.revenue.variableCostPerTrip)}
                </span>
              </div>
            </div>

            {/* Profit Per Trip */}
            <div className={`rounded-lg p-4 ${calculations.revenue.profitPerTrip >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Profit per Trip</p>
                  <p className={`text-2xl font-bold ${calculations.revenue.profitPerTrip >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.revenue.profitPerTrip)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Margin</p>
                  <p className={`text-xl font-bold ${calculations.revenue.profitMarginPerTrip >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatNumber(calculations.revenue.profitMarginPerTrip, 1)}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Variable costs only. Fixed costs (insurance, depreciation, etc.) reduce overall margin.
              </p>
            </div>
          </div>
        </Card>

        {/* Revenue Summary */}
        <Card title="Revenue Summary">
          <div className="space-y-3">
            <OutputRow
              label="Average Fare"
              value={formatCurrency(calculations.revenue.avgFare)}
              tooltip="Average fare per trip calculated from: base fare + (per mile × avg miles) + (per minute × avg minutes) + booking fee."
            />
            <OutputRow
              label="Trips per Day"
              value={formatNumber(calculations.revenue.tripsPerDay, 1)}
              tooltip="Trips completed per day per vehicle: operating hours × trips per hour. Higher utilization = more revenue potential."
            />
            <OutputRow
              label="Monthly Trips"
              value={formatNumber(calculations.revenue.monthlyTrips)}
              tooltip="Total trips across all vehicles: trips/day × operating days × fleet size. This drives total revenue."
            />
            <OutputRow
              label="Revenue Miles"
              value={`${formatNumber(calculations.revenue.revenueMiles)} mi`}
              tooltip="Miles driven with paying passengers: monthly trips × avg trip miles. These miles generate revenue."
            />
            <OutputRow
              label="Total Miles (incl. deadhead)"
              value={`${formatNumber(calculations.revenue.totalMiles)} mi`}
              tooltip="All miles driven including deadhead (empty repositioning). Total = revenue miles × (1 + deadhead %). Used for energy and maintenance costs."
            />
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <OutputRow
                label="Gross Revenue"
                value={formatCurrency(calculations.revenue.grossRevenue)}
                tooltip="Total fare revenue before platform fees: monthly trips × average fare. This is the top-line revenue."
              />
              <OutputRow
                label="Platform Fees"
                value={`-${formatCurrency(calculations.revenue.platformFees)}`}
                tooltip="Amount taken by rideshare platform (Uber/Lyft): gross revenue × platform fee %. Own platform = $0 but has operating costs."
                className="mt-1"
                valueClassName="text-red-600 dark:text-red-400"
              />
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span className="font-medium text-slate-900 dark:text-white">
                Net Revenue
              </span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                {formatCurrency(calculations.revenue.netRevenue)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
