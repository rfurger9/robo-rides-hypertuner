"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/calculations";

export function ScenarioTable() {
  const { calculations } = useScenario();

  const scenarios = [
    {
      ...calculations.comparison.vehiclesOnly,
      color: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-700 dark:text-orange-300",
    },
    {
      ...calculations.comparison.vehiclesPlusSolar,
      color: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-300",
    },
  ];

  return (
    <Card title="Scenario Comparison">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">
                Scenario
              </th>
              <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">
                Investment
              </th>
              <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">
                Monthly Revenue
              </th>
              <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">
                Monthly Costs
              </th>
              <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">
                Monthly Profit
              </th>
              <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">
                Break-Even
              </th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario, index) => (
              <tr
                key={scenario.name}
                className={`${scenario.color} ${index < scenarios.length - 1 ? "border-b border-slate-200 dark:border-slate-700" : ""}`}
              >
                <td className={`py-3 px-2 font-medium ${scenario.textColor}`}>
                  {scenario.name}
                </td>
                <td className="py-3 px-2 text-right text-slate-900 dark:text-white">
                  {formatCurrency(scenario.totalInvestment)}
                </td>
                <td className="py-3 px-2 text-right text-slate-900 dark:text-white">
                  {formatCurrency(scenario.monthlyRevenue)}
                </td>
                <td className="py-3 px-2 text-right text-slate-900 dark:text-white">
                  {formatCurrency(scenario.monthlyCosts)}
                </td>
                <td
                  className={`py-3 px-2 text-right font-semibold ${
                    scenario.monthlyProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(scenario.monthlyProfit)}
                </td>
                <td className="py-3 px-2 text-right text-slate-900 dark:text-white">
                  {scenario.breakEvenMonths
                    ? `${Math.ceil(scenario.breakEvenMonths)} mo`
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
