"use client";

import { useScenario } from "@/context/ScenarioContext";
import { KPICard } from "@/components/ui/Card";
import { formatCurrency, formatNumber } from "@/calculations";

export function Dashboard() {
  const { calculations, config } = useScenario();

  // Include humanoid costs, mining profits, and optimizer savings in the total
  const humanoidCost = config.humanoid.enabled ? calculations.humanoid.totalMonthlyCost : 0;
  const miningProfit = config.mining.enabled ? calculations.mining.monthlyNetProfit : 0;
  const humanoidSavings = config.humanoid.enabled && config.humanoid.laborComparisonEnabled
    ? calculations.humanoid.laborComparison.monthlySavings
    : 0;
  const optimizerSavings = config.optimizer.enabled
    ? calculations.optimizer.costs.savingsVsBaseline * 30 // Daily to monthly
    : 0;
  const batterySavings = config.battery.enabled ? calculations.energy.monthlyBatterySavings : 0;
  const batteryCost = config.battery.enabled ? calculations.batteryCosts.monthlyAmortizedCost : 0;

  const monthlyProfit =
    calculations.monthlyRevenue.totalMonthlyRevenue -
    calculations.monthlyCosts.totalMonthlyCost -
    humanoidCost -
    batteryCost +
    humanoidSavings +
    miningProfit +
    optimizerSavings +
    batterySavings;

  const breakEvenMonths = calculations.breakEven.breakEvenMonths;
  const breakEvenDisplay =
    breakEvenMonths <= 0 || breakEvenMonths === Infinity
      ? "N/A"
      : `${Math.ceil(breakEvenMonths)} mo`;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
          <KPICard
            label="Monthly Revenue"
            value={formatCurrency(calculations.monthlyRevenue.totalMonthlyRevenue + miningProfit)}
            subtext={`${formatNumber(calculations.revenue.monthlyTrips)} trips`}
            tooltip="Total monthly income from ride fares plus mining revenue. Calculated as: (trips/day × days/month × avg fare) + mining profits."
          />
          <KPICard
            label="Monthly Costs"
            value={formatCurrency(calculations.monthlyCosts.totalMonthlyCost + humanoidCost)}
            subtext="all expenses"
            tooltip="All monthly expenses: vehicle payments, insurance, maintenance, energy, platform fees, solar/battery amortization, and robot operating costs."
          />
          <KPICard
            label="Monthly Profit"
            value={formatCurrency(monthlyProfit)}
            subtext={
              monthlyProfit >= 0
                ? `${formatNumber((monthlyProfit / (calculations.monthlyRevenue.totalMonthlyRevenue + miningProfit)) * 100, 1)}% margin`
                : "negative"
            }
            trend={monthlyProfit >= 0 ? "up" : "down"}
            tooltip="Net profit after all costs. Includes: ride revenue, mining profit, optimizer savings, humanoid labor savings, minus all operating and capital costs."
          />
          <KPICard
            label="Break-Even"
            value={breakEvenDisplay}
            subtext="to profitability"
            tooltip="Months until total profits exceed total initial investment (vehicles, solar, battery, mining hardware, robots). Assumes constant monthly profit."
          />
          <KPICard
            label="Fleet Size"
            value={`${config.vehicle.quantity}`}
            subtext={`${config.vehicle.vehicle.displayName.split(" ").slice(1, 3).join(" ")}`}
            tooltip="Number of vehicles in your robotaxi fleet. More vehicles = more revenue capacity but higher capital and operating costs."
          />
          <KPICard
            label="Solar"
            value={config.solar.enabled ? `${config.solar.systemSizeKw} kW` : "Off"}
            subtext={
              config.solar.enabled
                ? `${formatNumber(config.solar.annualOutputKwh / 12)} kWh/mo`
                : "not enabled"
            }
            tooltip="Solar panel system size and estimated monthly generation. Offsets grid electricity costs for vehicle charging and mining operations."
          />
          <KPICard
            label="Mining"
            value={config.mining.enabled ? formatCurrency(miningProfit) : "Off"}
            subtext={
              config.mining.enabled
                ? `${formatNumber(calculations.mining.totalHashrateTh, 1)} TH/s`
                : "not enabled"
            }
            trend={config.mining.enabled && miningProfit > 0 ? "up" : undefined}
            tooltip="Crypto mining net profit (revenue minus energy and maintenance costs). Uses excess solar or off-peak power to generate additional income."
          />
          <KPICard
            label="Robots"
            value={config.humanoid.enabled ? `${calculations.humanoid.totalPlatforms}` : "Off"}
            subtext={
              config.humanoid.enabled
                ? humanoidSavings >= 0
                  ? `+${formatCurrency(humanoidSavings)}/mo`
                  : `${formatCurrency(humanoidSavings)}/mo`
                : "not enabled"
            }
            trend={config.humanoid.enabled && humanoidSavings > 0 ? "up" : undefined}
            tooltip="Humanoid robot fleet count and monthly labor savings vs human employees. Savings = human labor cost - robot operating cost."
          />
          <KPICard
            label="Optimizer"
            value={config.optimizer.enabled ? `${formatNumber(calculations.optimizer.costs.optimizationEfficiency, 0)}%` : "Off"}
            subtext={
              config.optimizer.enabled
                ? optimizerSavings >= 0
                  ? `+${formatCurrency(optimizerSavings)}/mo`
                  : `${formatCurrency(optimizerSavings)}/mo`
                : "not enabled"
            }
            trend={config.optimizer.enabled && optimizerSavings > 0 ? "up" : undefined}
            tooltip="Energy optimizer efficiency and monthly savings. Coordinates solar, battery, fleet charging, and mining to minimize energy costs via TOU arbitrage."
          />
        </div>
      </div>
    </div>
  );
}
