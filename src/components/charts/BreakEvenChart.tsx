"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/calculations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export function BreakEvenChart() {
  const { calculations } = useScenario();

  // Generate chart data for 60 months
  const data = [];
  const vehiclesOnlyInvestment = calculations.comparison.vehiclesOnly.totalInvestment;
  const vehiclesPlusSolarInvestment = calculations.comparison.vehiclesPlusSolar.totalInvestment;
  const vehiclesOnlyProfit = calculations.comparison.vehiclesOnly.monthlyProfit;
  const vehiclesPlusSolarProfit = calculations.comparison.vehiclesPlusSolar.monthlyProfit;

  for (let month = 0; month <= 60; month++) {
    const vehiclesOnlyCumulative = vehiclesOnlyProfit * month - vehiclesOnlyInvestment;
    const vehiclesPlusSolarCumulative =
      vehiclesPlusSolarProfit * month - vehiclesPlusSolarInvestment;

    data.push({
      month,
      vehiclesOnly: Math.round(vehiclesOnlyCumulative),
      vehiclesPlusSolar: Math.round(vehiclesPlusSolarCumulative),
    });
  }

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: number;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-slate-900 dark:text-white mb-2">
            Month {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="text-sm"
            >
              {entry.dataKey === "vehiclesOnly" ? "Vehicles Only" : "Vehicles + Solar"}:{" "}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Break-Even Analysis">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              tickFormatter={(value) => `M${value}`}
            />
            <YAxis
              stroke="#64748b"
              tickFormatter={(value) =>
                value >= 1000 || value <= -1000
                  ? `$${(value / 1000).toFixed(0)}k`
                  : `$${value}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="5 5" />
            <Line
              type="monotone"
              dataKey="vehiclesOnly"
              name="Vehicles Only"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="vehiclesPlusSolar"
              name="Vehicles + Solar"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">
            Vehicles Only
          </h4>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {calculations.comparison.vehiclesOnly.breakEvenMonths
              ? `${Math.ceil(calculations.comparison.vehiclesOnly.breakEvenMonths)} months`
              : "Never"}
          </p>
          <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
            {formatCurrency(calculations.comparison.vehiclesOnly.monthlyProfit)}/mo
            profit
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
            Vehicles + Solar
          </h4>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {calculations.comparison.vehiclesPlusSolar.breakEvenMonths
              ? `${Math.ceil(calculations.comparison.vehiclesPlusSolar.breakEvenMonths)} months`
              : "Never"}
          </p>
          <p className="text-xs text-green-600/80 dark:text-green-400/80">
            {formatCurrency(calculations.comparison.vehiclesPlusSolar.monthlyProfit)}
            /mo profit
          </p>
        </div>
      </div>
    </Card>
  );
}
