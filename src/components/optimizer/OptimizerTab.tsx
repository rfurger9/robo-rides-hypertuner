"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Toggle } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import { EnergyFlowDiagram } from "./EnergyFlowDiagram";
import {
  CONSUMER_LABELS,
  EnergyConsumerType,
  getPriorityLabel,
} from "@/types/optimizer";
import { formatCurrency, formatNumber, getOptimizationRecommendations } from "@/calculations";

export function OptimizerTab() {
  const { config, calculations, toggleOptimizer, updateOptimizer } = useScenario();

  const optimizerCalcs = calculations.optimizer;
  const recommendations = getOptimizationRecommendations(optimizerCalcs, config.optimizer);

  // Priority options
  const priorityOptions = [
    { value: "1", label: "1 - Critical" },
    { value: "2", label: "2 - High" },
    { value: "3", label: "3 - Medium" },
    { value: "4", label: "4 - Low" },
    { value: "5", label: "5 - Optional" },
  ];

  const updatePriority = (consumer: keyof typeof config.optimizer.priorities, value: string) => {
    updateOptimizer({
      priorities: {
        ...config.optimizer.priorities,
        [consumer]: parseInt(value),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enable/Configuration */}
        <Card title="Energy Optimizer">
          <div className="space-y-4">
            <Toggle
              label="Enable Energy Optimization"
              checked={config.optimizer.enabled}
              onChange={toggleOptimizer}
              description="Intelligently allocate power across all consumers"
            />

            {config.optimizer.enabled && (
              <>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Automation Settings
                  </h4>

                  <Toggle
                    label="Auto Battery Arbitrage"
                    checked={config.optimizer.autoArbitrage}
                    onChange={(v) => updateOptimizer({ autoArbitrage: v })}
                    description="Buy low, sell high with TOU rates"
                  />

                  <Toggle
                    label="Auto Mining Allocation"
                    checked={config.optimizer.autoMining}
                    onChange={(v) => updateOptimizer({ autoMining: v })}
                    description="Use excess power for crypto mining"
                  />

                  <Toggle
                    label="Auto Grid Export"
                    checked={config.optimizer.autoExport}
                    onChange={(v) => updateOptimizer({ autoExport: v })}
                    description="Sell excess power to the grid"
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Priority Configuration */}
        {config.optimizer.enabled && (
          <Card title="Consumer Priorities">
            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set priority levels for energy allocation. Lower numbers = higher priority.
              </p>

              {(Object.keys(CONSUMER_LABELS) as EnergyConsumerType[])
                .filter((key) => key !== "gridExport")
                .map((consumer) => (
                  <div key={consumer} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {CONSUMER_LABELS[consumer]}
                    </span>
                    <Select
                      label=""
                      value={String(config.optimizer.priorities[consumer as keyof typeof config.optimizer.priorities])}
                      onChange={(v) => updatePriority(consumer as keyof typeof config.optimizer.priorities, v)}
                      options={priorityOptions}
                    />
                  </div>
                ))}
            </div>
          </Card>
        )}

        {/* Constraints */}
        {config.optimizer.enabled && (
          <Card title="Constraints">
            <div className="space-y-4">
              <Slider
                label="Minimum Fleet SoC"
                value={config.optimizer.minFleetSoC}
                onChange={(v) => updateOptimizer({ minFleetSoC: v })}
                min={50}
                max={100}
                step={5}
                unit="%"
              />

              <Slider
                label="Max Grid Import"
                value={config.optimizer.maxGridImportKw}
                onChange={(v) => updateOptimizer({ maxGridImportKw: v })}
                min={10}
                max={200}
                step={10}
                unit=" kW"
              />

              <Slider
                label="Battery Reserve"
                value={config.optimizer.reserveBatteryPercent}
                onChange={(v) => updateOptimizer({ reserveBatteryPercent: v })}
                min={0}
                max={50}
                step={5}
                unit="%"
              />

              <Slider
                label="Facility Base Load"
                value={config.optimizer.facilityBaseLoadKw}
                onChange={(v) => updateOptimizer({ facilityBaseLoadKw: v })}
                min={1}
                max={20}
                step={1}
                unit=" kW"
              />
            </div>
          </Card>
        )}

        {/* TOU Schedule */}
        {config.optimizer.enabled && (
          <Card title="Time-of-Use Schedule">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Peak Start"
                  value={config.optimizer.peakHoursStart}
                  onChange={(v) => updateOptimizer({ peakHoursStart: v })}
                  min={12}
                  max={20}
                  step={1}
                  unit=""
                  formatValue={(v) => `${v}:00`}
                />
                <Slider
                  label="Peak End"
                  value={config.optimizer.peakHoursEnd}
                  onChange={(v) => updateOptimizer({ peakHoursEnd: v })}
                  min={17}
                  max={23}
                  step={1}
                  unit=""
                  formatValue={(v) => `${v}:00`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Super Off-Peak Start"
                  value={config.optimizer.superOffPeakStart}
                  onChange={(v) => updateOptimizer({ superOffPeakStart: v })}
                  min={0}
                  max={6}
                  step={1}
                  unit=""
                  formatValue={(v) => `${v}:00`}
                />
                <Slider
                  label="Super Off-Peak End"
                  value={config.optimizer.superOffPeakEnd}
                  onChange={(v) => updateOptimizer({ superOffPeakEnd: v })}
                  min={6}
                  max={12}
                  step={1}
                  unit=""
                  formatValue={(v) => `${v}:00`}
                />
              </div>

              {/* TOU Visual */}
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Schedule Preview</p>
                <div className="flex h-8 rounded-lg overflow-hidden">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    let bgColor = "bg-blue-400"; // Off-peak
                    if (hour >= config.optimizer.superOffPeakStart && hour < config.optimizer.superOffPeakEnd) {
                      bgColor = "bg-green-400";
                    } else if (hour >= config.optimizer.peakHoursStart && hour < config.optimizer.peakHoursEnd) {
                      bgColor = "bg-red-400";
                    }
                    return (
                      <div
                        key={hour}
                        className={`flex-1 ${bgColor} border-r border-white/20 last:border-r-0`}
                        title={`${hour}:00`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>12am</span>
                  <span>6am</span>
                  <span>12pm</span>
                  <span>6pm</span>
                  <span>12am</span>
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-400"></div>
                    <span className="text-slate-500">Super Off-Peak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-400"></div>
                    <span className="text-slate-500">Off-Peak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-400"></div>
                    <span className="text-slate-500">Peak</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Live Energy Flow */}
        {config.optimizer.enabled && (
          <div className="lg:col-span-2">
            <EnergyFlowDiagram allocation={optimizerCalcs.currentAllocation} />
          </div>
        )}

        {/* Daily Summary */}
        {config.optimizer.enabled && (
          <Card title="Daily Energy Summary">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Solar Generation</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {formatNumber(optimizerCalcs.dailyTotals.solarGeneration, 0)} kWh
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Grid Import</p>
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    {formatNumber(optimizerCalcs.dailyTotals.gridImport, 0)} kWh
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-sm text-blue-600 dark:text-blue-400">Fleet Charging</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {formatNumber(optimizerCalcs.dailyTotals.fleetCharging, 0)} kWh
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Grid Export</p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatNumber(optimizerCalcs.dailyTotals.gridExport, 0)} kWh
                  </p>
                </div>
              </div>

              {/* Mining and Facility */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Mining Consumption</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatNumber(optimizerCalcs.dailyTotals.miningConsumption, 0)} kWh
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Facility Operations</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatNumber(optimizerCalcs.dailyTotals.facilityOps, 0)} kWh
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Cost Analysis */}
        {config.optimizer.enabled && (
          <Card title="Cost Analysis">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Daily Grid Cost</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(optimizerCalcs.costs.totalGridCost)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Daily Export Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(optimizerCalcs.costs.totalExportRevenue)}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Net Daily Energy Cost</p>
                    <p className={`text-2xl font-bold ${optimizerCalcs.costs.netEnergyCost >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(optimizerCalcs.costs.netEnergyCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Monthly Projection</p>
                    <p className={`text-2xl font-bold ${optimizerCalcs.costs.netEnergyCost >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(optimizerCalcs.costs.netEnergyCost * 30)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Savings */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Daily Savings vs Baseline</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(optimizerCalcs.costs.savingsVsBaseline)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600 dark:text-green-400">Optimization Efficiency</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatNumber(optimizerCalcs.costs.optimizationEfficiency, 1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Battery & Fleet Status */}
        {config.optimizer.enabled && (
          <Card title="System Status">
            <div className="space-y-4">
              {/* Battery */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Battery State of Charge</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatNumber(optimizerCalcs.batteryState.currentSoC, 0)}%
                  </p>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${optimizerCalcs.batteryState.currentSoC}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Cycles used today: {formatNumber(optimizerCalcs.batteryState.cyclesUsedToday, 2)}
                </p>
              </div>

              {/* Fleet */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Fleet Readiness</p>
                  <p className="text-lg font-bold text-blue-600">
                    {optimizerCalcs.fleetReadiness.vehiclesAtTargetSoC}/{optimizerCalcs.fleetReadiness.totalVehicles}
                  </p>
                </div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(optimizerCalcs.fleetReadiness.vehiclesAtTargetSoC / Math.max(optimizerCalcs.fleetReadiness.totalVehicles, 1)) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Average fleet SoC: {formatNumber(optimizerCalcs.fleetReadiness.averageSoC, 0)}%
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Recommendations */}
        {config.optimizer.enabled && recommendations.length > 0 && (
          <Card title="Optimization Insights">
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Disabled State */}
        {!config.optimizer.enabled && (
          <Card>
            <div className="text-center py-8">
              <svg
                className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Optimizer Not Enabled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Enable the energy optimizer to intelligently allocate power across fleet charging,
                facility operations, crypto mining, and grid export based on TOU rates.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
