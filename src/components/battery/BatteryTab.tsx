"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { Toggle, ToggleGroup } from "@/components/ui/Toggle";
import { formatCurrency, formatNumber } from "@/calculations";
import { OutputRow } from "@/components/ui/InfoTooltip";
import {
  BatteryStrategy,
  BATTERY_PRESETS,
  BatteryUnit,
} from "@/types/battery";

export function BatteryTab() {
  const { config, calculations, updateBattery } = useScenario();

  const handlePresetChange = (unitId: string) => {
    const preset = BATTERY_PRESETS.find((p) => p.id === unitId);
    if (preset) {
      updateBattery({
        unitId: preset.id,
        unitName: preset.name,
        capacityKwh: preset.capacityKwh,
        continuousPowerKw: preset.continuousPowerKw,
        roundTripEfficiency: preset.roundTripEfficiency,
        unitCostInstalled: preset.costInstalled,
      });
    }
  };

  const handleStrategyChange = (strategy: string) => {
    updateBattery({ strategy: strategy as BatteryStrategy });
  };

  const presetOptions = BATTERY_PRESETS.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.capacityKwh} kWh)`,
  }));

  const totalCapacity = config.battery.capacityKwh * config.battery.quantity;
  const usableCapacity = totalCapacity * config.battery.roundTripEfficiency;
  const totalCost = config.battery.unitCostInstalled * config.battery.quantity;
  const monthlyAmortized = totalCost / (config.battery.amortizationYears * 12);

  // Calculate TOU arbitrage value (simplified)
  const touSpread =
    config.energy.rateMode === "tou"
      ? config.energy.touRate.onPeakRate - config.energy.touRate.offPeakRate
      : 0;
  const dailyArbitrageValue =
    config.battery.strategy === "tou_arbitrage"
      ? usableCapacity * touSpread * config.battery.arbitrageUtilization
      : 0;
  const monthlyArbitrageValue = dailyArbitrageValue * 30;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Battery Configuration */}
        <Card title="Battery Storage">
          <div className="space-y-4">
            <Toggle
              label="Enable Battery Storage"
              checked={config.battery.enabled}
              onChange={(enabled) => updateBattery({ enabled })}
              description="Add battery storage for energy management"
            />

            {config.battery.enabled && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Select
                  label="Battery System"
                  value={config.battery.unitId}
                  onChange={handlePresetChange}
                  options={presetOptions}
                />

                <Slider
                  label="Number of Units"
                  value={config.battery.quantity}
                  onChange={(quantity) => updateBattery({ quantity })}
                  min={1}
                  max={10}
                  unit=" units"
                  tooltip="Stack multiple battery units for more capacity. Each unit adds capacity and power output."
                />

                <Slider
                  label="Amortization Period"
                  value={config.battery.amortizationYears}
                  onChange={(v) => updateBattery({ amortizationYears: v })}
                  min={5}
                  max={15}
                  step={1}
                  unit=" years"
                  tooltip="Period over which battery cost is amortized. Matches warranty (typically 10 years). Shorter = higher monthly cost."
                />

                <Slider
                  label="Arbitrage Utilization"
                  value={config.battery.arbitrageUtilization * 100}
                  onChange={(v) => updateBattery({ arbitrageUtilization: v / 100 })}
                  min={50}
                  max={100}
                  step={5}
                  unit="%"
                  tooltip="Percentage of usable battery capacity cycled daily for TOU arbitrage. Higher = more savings but more wear. 80% is conservative."
                />

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Total Capacity
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatNumber(totalCapacity, 1)} kWh
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Usable Capacity
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatNumber(usableCapacity, 1)} kWh
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Continuous Power
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatNumber(
                        config.battery.continuousPowerKw * config.battery.quantity,
                        1
                      )}{" "}
                      kW
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Usage Strategy */}
        {config.battery.enabled && (
          <Card title="Usage Strategy">
            <div className="space-y-4">
              <ToggleGroup
                label="Battery Strategy"
                value={config.battery.strategy}
                onChange={handleStrategyChange}
                options={[
                  { value: "self_consumption", label: "Self Use" },
                  { value: "tou_arbitrage", label: "TOU Arbitrage" },
                  { value: "backup_only", label: "Backup Only" },
                ]}
              />

              <div className="pt-4 space-y-3">
                {config.battery.strategy === "self_consumption" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                      Self-Consumption Mode
                    </h4>
                    <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                      Store excess solar during the day and use it at night.
                      Maximizes solar self-consumption and reduces grid imports.
                    </p>
                  </div>
                )}

                {config.battery.strategy === "tou_arbitrage" && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">
                      TOU Arbitrage Mode
                    </h4>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      Charge during off-peak hours, discharge during on-peak
                      hours. Saves money by buying low and avoiding high rates.
                    </p>
                    {config.energy.rateMode !== "tou" && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                        Note: Enable TOU rates in Energy tab to use this feature.
                      </p>
                    )}
                  </div>
                )}

                {config.battery.strategy === "backup_only" && (
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Backup Only Mode
                    </h4>
                    <p className="text-sm text-slate-600/80 dark:text-slate-400/80">
                      Reserve battery for power outages. No daily cycling means
                      longer battery life but no energy cost savings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Cost Summary */}
        {config.battery.enabled && (
          <Card title="Cost Summary">
            <div className="space-y-3">
              <OutputRow
                label="Unit Cost (installed)"
                value={formatCurrency(config.battery.unitCostInstalled)}
                tooltip="Fully installed cost per battery unit including inverter, wiring, and labor."
              />
              <OutputRow
                label="Quantity"
                value={`${config.battery.quantity} units`}
                tooltip="Number of battery units stacked together. More units = more capacity and power."
              />
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="font-medium text-slate-900 dark:text-white">
                  Total Cost
                </span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalCost)}
                </span>
              </div>
              <OutputRow
                label={`Monthly (${config.battery.amortizationYears}yr amortization)`}
                value={`${formatCurrency(monthlyAmortized)}/mo`}
                tooltip={`Total cost spread over ${config.battery.amortizationYears} years: ${formatCurrency(totalCost)} / ${config.battery.amortizationYears * 12} months.`}
              />
            </div>
          </Card>
        )}

        {/* Value Analysis */}
        {config.battery.enabled && config.battery.strategy !== "backup_only" && (
          <Card title="Value Analysis">
            <div className="space-y-3">
              {config.battery.strategy === "tou_arbitrage" && (
                <>
                  <OutputRow
                    label="TOU Rate Spread"
                    value={`$${touSpread.toFixed(2)}/kWh`}
                    tooltip="Difference between on-peak and off-peak rates. Larger spread = more arbitrage profit per cycle."
                  />
                  <OutputRow
                    label="Daily Arbitrage Value"
                    value={`${formatCurrency(dailyArbitrageValue)}/day`}
                    tooltip="Daily savings from buying low (off-peak) and discharging high (on-peak): usable capacity × rate spread × utilization."
                    valueClassName="text-green-600 dark:text-green-400"
                  />
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">
                      Monthly Savings
                    </span>
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(monthlyArbitrageValue)}/mo
                    </span>
                  </div>
                  <OutputRow
                    label="Net Monthly Cost"
                    value={`${formatCurrency(monthlyAmortized - monthlyArbitrageValue)}/mo`}
                    tooltip="Battery amortization minus arbitrage savings. Negative means the battery pays for itself and then some."
                    valueClassName={
                      monthlyArbitrageValue > monthlyAmortized
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-700 dark:text-slate-300"
                    }
                  />
                </>
              )}

              {config.battery.strategy === "self_consumption" && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Self-consumption value depends on your solar production and
                    usage patterns. The battery stores excess solar to use when
                    the sun isn&apos;t shining.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* No Battery Message */}
        {!config.battery.enabled && (
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Battery Storage Not Enabled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Enable battery storage to maximize solar utilization and take
                advantage of TOU rate arbitrage.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
