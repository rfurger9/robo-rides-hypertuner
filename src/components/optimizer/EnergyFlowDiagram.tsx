"use client";

import { AllocationPlan, TOUPeriod } from "@/types/optimizer";
import { formatNumber } from "@/calculations";

interface EnergyFlowDiagramProps {
  allocation: AllocationPlan;
}

const periodColors: Record<TOUPeriod, { bg: string; text: string; label: string }> = {
  superOffPeak: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Super Off-Peak" },
  offPeak: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Off-Peak" },
  peak: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Peak" },
};

export function EnergyFlowDiagram({ allocation }: EnergyFlowDiagramProps) {
  const periodStyle = periodColors[allocation.period];

  // Calculate flow widths (max 100%)
  const maxFlow = Math.max(
    allocation.sources.total,
    allocation.demands.total,
    1
  );

  const getFlowWidth = (value: number) => {
    return Math.max(5, (value / maxFlow) * 100);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      {/* Header with time period */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Energy Flow
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${periodStyle.bg} ${periodStyle.text}`}>
          {periodStyle.label} ({allocation.hourOfDay}:00)
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Sources Column */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Sources
          </h4>

          {/* Solar */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Solar</p>
                <p className="text-lg font-bold text-yellow-600">{formatNumber(allocation.sources.solar, 1)} kW</p>
              </div>
            </div>
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 h-2 bg-yellow-400 rounded-r"
              style={{ width: `${getFlowWidth(allocation.sources.solar)}%`, maxWidth: "50%" }}
            />
          </div>

          {/* Battery */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm16 3v4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Battery</p>
                <p className="text-lg font-bold text-purple-600">{formatNumber(allocation.sources.battery, 1)} kW</p>
              </div>
            </div>
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 h-2 bg-purple-400 rounded-r"
              style={{ width: `${getFlowWidth(allocation.sources.battery)}%`, maxWidth: "50%" }}
            />
          </div>

          {/* Grid */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Grid</p>
                <p className="text-lg font-bold text-slate-600 dark:text-slate-400">{formatNumber(allocation.sources.grid, 1)} kW</p>
              </div>
            </div>
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 h-2 bg-slate-400 rounded-r"
              style={{ width: `${getFlowWidth(allocation.sources.grid)}%`, maxWidth: "50%" }}
            />
          </div>
        </div>

        {/* Center - Optimizer */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <svg className="w-8 h-8 text-white mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="text-xs font-medium text-white">Optimizer</p>
            </div>
          </div>
          <div className="mt-3 text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatNumber(allocation.sources.total, 1)} kW
            </p>
            <p className="text-sm text-slate-500">Total Available</p>
          </div>
        </div>

        {/* Consumers Column */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 text-right">
            Consumers
          </h4>

          {/* Fleet Charging */}
          <div className="relative">
            <div className="flex items-center gap-2 justify-end">
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Fleet</p>
                <p className="text-lg font-bold text-blue-600">{formatNumber(allocation.allocations.fleetCharging, 1)} kW</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h.01M16 17h.01M12 11v4m-4-1a4 4 0 01-4-4V9a4 4 0 014-4h8a4 4 0 014 4v1a4 4 0 01-4 4H8z" />
                </svg>
              </div>
            </div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-blue-400 rounded-l"
              style={{ width: `${getFlowWidth(allocation.allocations.fleetCharging)}%`, maxWidth: "50%" }}
            />
          </div>

          {/* Facility */}
          <div className="relative">
            <div className="flex items-center gap-2 justify-end">
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Facility</p>
                <p className="text-lg font-bold text-green-600">{formatNumber(allocation.allocations.facilityOps, 1)} kW</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-green-400 rounded-l"
              style={{ width: `${getFlowWidth(allocation.allocations.facilityOps)}%`, maxWidth: "50%" }}
            />
          </div>

          {/* Mining */}
          <div className="relative">
            <div className="flex items-center gap-2 justify-end">
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">Mining</p>
                <p className="text-lg font-bold text-orange-600">{formatNumber(allocation.allocations.cryptoMining, 1)} kW</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-orange-400 rounded-l"
              style={{ width: `${getFlowWidth(allocation.allocations.cryptoMining)}%`, maxWidth: "50%" }}
            />
          </div>

          {/* Grid Export */}
          {allocation.allocations.gridExport > 0 && (
            <div className="relative">
              <div className="flex items-center gap-2 justify-end">
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Export</p>
                  <p className="text-lg font-bold text-emerald-600">{formatNumber(allocation.allocations.gridExport, 1)} kW</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-emerald-400 rounded-l"
                style={{ width: `${getFlowWidth(allocation.allocations.gridExport)}%`, maxWidth: "50%" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Cost Summary */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-slate-500">Grid Cost</p>
          <p className="text-lg font-bold text-red-600">${allocation.costs.gridCost.toFixed(2)}/hr</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500">Export Revenue</p>
          <p className="text-lg font-bold text-green-600">${allocation.costs.exportRevenue.toFixed(2)}/hr</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500">Net Cost</p>
          <p className={`text-lg font-bold ${allocation.costs.netCost >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            ${allocation.costs.netCost.toFixed(2)}/hr
          </p>
        </div>
      </div>
    </div>
  );
}
