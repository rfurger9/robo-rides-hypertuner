"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MonthlyEnergyData } from "@/types/energy";

interface MonthlyEnergyChartProps {
  data: MonthlyEnergyData[];
  showBattery?: boolean;
}

export function MonthlyEnergyChart({
  data,
  showBattery = true,
}: MonthlyEnergyChartProps) {
  const formatKwh = (value: number) => `${value.toLocaleString()} kWh`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-slate-900 dark:text-white mb-2">
          {label}
        </p>
        <div className="space-y-1 text-sm">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 dark:text-slate-400">
                {entry.name}:
              </span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatKwh(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Determine if we have any battery data
  const hasBatteryData =
    showBattery && data.some((d) => d.batteryCharge > 0 || d.batteryDischarge > 0);

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-slate-200 dark:stroke-slate-700"
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "currentColor" }}
            className="text-slate-600 dark:text-slate-400"
          />
          <YAxis
            tick={{ fill: "currentColor" }}
            className="text-slate-600 dark:text-slate-400"
            tickFormatter={(value) => `${value}`}
            label={{
              value: "kWh",
              angle: -90,
              position: "insideLeft",
              style: { fill: "currentColor" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
            }}
          />

          {/* Stacked bars for energy sources */}
          <Bar
            dataKey="solarGeneration"
            name="Solar Generation"
            stackId="generation"
            fill="#22c55e"
            radius={[0, 0, 0, 0]}
          />

          <Bar
            dataKey="gridImport"
            name="Grid Import"
            stackId="consumption"
            fill="#ef4444"
            radius={[0, 0, 0, 0]}
          />

          {hasBatteryData && (
            <>
              <Bar
                dataKey="batteryDischarge"
                name="Battery Discharge"
                stackId="consumption"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="batteryCharge"
                name="Battery Charge"
                stackId="storage"
                fill="#8b5cf6"
                radius={[0, 0, 0, 0]}
              />
            </>
          )}

          {/* Line overlay for vehicle consumption */}
          <Line
            type="monotone"
            dataKey="vehicleConsumption"
            name="Vehicle Consumption"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

interface EnergyChartSummaryProps {
  data: MonthlyEnergyData[];
}

export function EnergyChartSummary({ data }: EnergyChartSummaryProps) {
  const totals = data.reduce(
    (acc, month) => ({
      solar: acc.solar + month.solarGeneration,
      grid: acc.grid + month.gridImport,
      export: acc.export + month.gridExport,
      vehicle: acc.vehicle + month.vehicleConsumption,
      batteryCharge: acc.batteryCharge + month.batteryCharge,
      batteryDischarge: acc.batteryDischarge + month.batteryDischarge,
    }),
    { solar: 0, grid: 0, export: 0, vehicle: 0, batteryCharge: 0, batteryDischarge: 0 }
  );

  const selfSufficiency =
    totals.vehicle > 0
      ? ((totals.solar + totals.batteryDischarge - totals.export) / totals.vehicle) * 100
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
        <p className="text-xs text-green-600 dark:text-green-400">
          Annual Solar
        </p>
        <p className="text-lg font-semibold text-green-700 dark:text-green-300">
          {totals.solar.toLocaleString()} kWh
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
        <p className="text-xs text-red-600 dark:text-red-400">Grid Import</p>
        <p className="text-lg font-semibold text-red-700 dark:text-red-300">
          {totals.grid.toLocaleString()} kWh
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Vehicle Consumption
        </p>
        <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">
          {totals.vehicle.toLocaleString()} kWh
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Self-Sufficiency
        </p>
        <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
          {Math.min(100, selfSufficiency).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
