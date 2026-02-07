"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { ToggleGroup } from "@/components/ui/Toggle";
import { OutputRow } from "@/components/ui/InfoTooltip";
import { formatCurrency, formatNumber } from "@/calculations";
import { RateMode } from "@/types";

export function EnergyTab() {
  const { config, calculations, updateEnergy } = useScenario();

  const handleRateModeChange = (mode: string) => {
    updateEnergy({ rateMode: mode as RateMode });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Structure */}
        <Card title="Utility Rate Structure">
          <div className="space-y-4">
            <ToggleGroup
              label="Rate Type"
              value={config.energy.rateMode}
              onChange={handleRateModeChange}
              options={[
                { value: "flat", label: "Flat Rate" },
                { value: "tou", label: "Time-of-Use" },
              ]}
            />

            {config.energy.rateMode === "flat" && (
              <div className="pt-4">
                <Input
                  label="Rate per kWh"
                  value={config.energy.flatRate.ratePerKwh}
                  onChange={(v) =>
                    updateEnergy({
                      flatRate: { ratePerKwh: Number(v) },
                    })
                  }
                  prefix="$"
                  step={0.01}
                  tooltip="Your utility's flat electricity rate per kilowatt-hour. US average is $0.12-0.15/kWh. California averages $0.25-0.35/kWh."
                />
              </div>
            )}

            {config.energy.rateMode === "tou" && (
              <div className="space-y-4 pt-4">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Off-Peak (12am-6am)
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Cheapest
                      </span>
                    </div>
                    <Input
                      label=""
                      value={config.energy.touRate.offPeakRate}
                      onChange={(v) =>
                        updateEnergy({
                          touRate: {
                            ...config.energy.touRate,
                            offPeakRate: Number(v),
                          },
                        })
                      }
                      prefix="$"
                      step={0.01}
                      tooltip="Lowest overnight rate when grid demand is minimal. Ideal for EV charging. Typically 40-60% cheaper than on-peak."
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Partial-Peak (6am-4pm, 9pm-12am)
                      </span>
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">
                        Mid
                      </span>
                    </div>
                    <Input
                      label=""
                      value={config.energy.touRate.partialPeakRate}
                      onChange={(v) =>
                        updateEnergy({
                          touRate: {
                            ...config.energy.touRate,
                            partialPeakRate: Number(v),
                          },
                        })
                      }
                      prefix="$"
                      step={0.01}
                      tooltip="Mid-tier rate during moderate demand hours. Daytime hours when solar is generating but before evening peak."
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        On-Peak (4pm-9pm)
                      </span>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Expensive
                      </span>
                    </div>
                    <Input
                      label=""
                      value={config.energy.touRate.onPeakRate}
                      onChange={(v) =>
                        updateEnergy({
                          touRate: {
                            ...config.energy.touRate,
                            onPeakRate: Number(v),
                          },
                        })
                      }
                      prefix="$"
                      step={0.01}
                      tooltip="Highest rate during evening peak demand. Avoid charging during these hours. Use battery storage to offset."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Net Metering */}
        <Card title="Net Metering">
          <div className="space-y-4">
            <Toggle
              label="Enable Net Metering"
              checked={config.energy.netMetering.enabled}
              onChange={(v) =>
                updateEnergy({
                  netMetering: {
                    ...config.energy.netMetering,
                    enabled: v,
                  },
                })
              }
              description="Get credit for excess solar exported to grid"
            />

            {config.energy.netMetering.enabled && (
              <div className="pt-4 space-y-4">
                <Input
                  label="Export Rate (% of retail)"
                  value={config.energy.netMetering.exportRatePercent * 100}
                  onChange={(v) =>
                    updateEnergy({
                      netMetering: {
                        ...config.energy.netMetering,
                        exportRatePercent: Number(v) / 100,
                      },
                    })
                  }
                  suffix="%"
                  min={0}
                  max={100}
                  tooltip="Credit received for exported solar as percentage of retail rate. NEM 2.0: ~75%, NEM 3.0: varies by time (often much lower)."
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  NEM 2.0 typically offers 75% of retail rate. NEM 3.0 may offer
                  lower rates.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Energy Balance */}
        <Card title="Monthly Energy Balance">
          <div className="space-y-3">
            <OutputRow
              label="Vehicle Energy Need"
              value={`${formatNumber(calculations.energy.monthlyVehicleKwh)} kWh`}
              tooltip="Monthly electricity needed for fleet charging: total miles / vehicle efficiency (mi/kWh). Driven by fleet size, trips, and deadhead."
            />
            {config.solar.enabled && (
              <OutputRow
                label="Solar Generation"
                value={`${formatNumber(calculations.energy.monthlySolarKwh)} kWh`}
                tooltip="Monthly solar output: system size × annual production factor / 12. Varies by season and location."
                valueClassName="text-green-600 dark:text-green-400"
              />
            )}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <OutputRow
                label="Grid Import"
                value={`${formatNumber(calculations.energy.monthlyGridImportKwh)} kWh`}
                tooltip="Electricity purchased from grid after solar and battery offsets. This is what you pay for at your utility rate."
              />
              {config.solar.enabled &&
                calculations.energy.monthlyExcessSolarKwh > 0 && (
                  <OutputRow
                    label="Excess Solar Export"
                    value={`${formatNumber(calculations.energy.monthlyExcessSolarKwh)} kWh`}
                    tooltip="Solar energy exported back to grid. Earns credit based on net metering export rate percentage."
                    valueClassName="text-green-600 dark:text-green-400"
                    className="mt-2"
                  />
                )}
            </div>
          </div>
        </Card>

        {/* Cost Summary */}
        <Card title="Energy Cost Summary">
          <div className="space-y-3">
            <OutputRow
              label="Grid Energy Cost"
              value={formatCurrency(calculations.energy.monthlyGridCost)}
              tooltip="Monthly cost for grid electricity: grid import kWh × energy rate. Reduced by solar and battery offsets."
            />
            {config.solar.enabled && config.energy.netMetering.enabled && (
              <OutputRow
                label="Export Credit"
                value={`-${formatCurrency(calculations.energy.monthlyExportCredit)}`}
                tooltip="Monthly credit for exported solar: excess kWh × retail rate × export rate %. Reduces your energy bill."
                valueClassName="text-green-600 dark:text-green-400"
              />
            )}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span className="font-medium text-slate-900 dark:text-white">
                Net Energy Cost
              </span>
              <span
                className={`font-bold text-lg ${
                  calculations.energy.monthlyNetEnergyCost <= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {formatCurrency(calculations.energy.monthlyNetEnergyCost)}
              </span>
            </div>
            {config.solar.enabled && (
              <div className="pt-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Monthly Savings with Solar:</strong>{" "}
                    {formatCurrency(
                      calculations.energy.monthlyGridCost *
                        (calculations.energy.monthlySolarKwh /
                          calculations.energy.monthlyVehicleKwh) -
                        calculations.energy.monthlyExportCredit
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
