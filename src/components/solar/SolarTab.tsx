"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Toggle, ToggleGroup } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { RoofMapper } from "./RoofMapper";
import { MonthlyEnergyChart, EnergyChartSummary } from "@/components/charts/MonthlyEnergyChart";
import { OutputRow } from "@/components/ui/InfoTooltip";
import { formatCurrency, formatNumber, calculateMonthlyEnergyData } from "@/calculations";
import { Location, RoofPolygon } from "@/types/solar";

export function SolarTab() {
  const { config, calculations, toggleSolar, updateSolar } = useScenario();

  const handleLocationChange = (location: Location) => {
    updateSolar({ location });
  };

  const handlePolygonsChange = (polygons: RoofPolygon[]) => {
    updateSolar({ polygons });
  };

  const handleAreaChange = (totalAreaSqFt: number) => {
    // Calculate system size based on area (assume 17 sq ft per panel, 400W per panel)
    const panelCount = Math.floor(totalAreaSqFt / 17);
    const systemSizeKw = (panelCount * 400) / 1000;
    updateSolar({ systemSizeKw: Math.max(1, Math.min(50, systemSizeKw)) });
  };

  const handleInputModeChange = (mode: string) => {
    updateSolar({ useManualEntry: mode === "manual" });
  };

  // Calculate monthly data for chart
  const monthlyData = config.solar.enabled
    ? calculateMonthlyEnergyData(
        calculations.revenue.totalMiles,
        config.vehicle.vehicle.efficiencyMiPerKwh,
        config.solar,
        config.energy,
        config.battery
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar Configuration */}
        <Card title="Solar Configuration">
          <div className="space-y-4">
            <Toggle
              label="Enable Solar"
              checked={config.solar.enabled}
              onChange={toggleSolar}
              description="Add solar panels to offset energy costs"
            />

            {config.solar.enabled && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <ToggleGroup
                  label="Input Method"
                  value={config.solar.useManualEntry ? "manual" : "map"}
                  onChange={handleInputModeChange}
                  options={[
                    { value: "manual", label: "Manual Entry" },
                    { value: "map", label: "Use Map" },
                  ]}
                />

                {config.solar.useManualEntry ? (
                  <Slider
                    label="System Size"
                    value={config.solar.systemSizeKw}
                    onChange={(v) => updateSolar({ systemSizeKw: v })}
                    min={1}
                    max={50}
                    unit=" kW"
                    tooltip="Total solar panel capacity in kilowatts (DC). 1kW = ~3 panels. Average home: 6-12kW. Commercial fleet depot: 20-50kW+."
                  />
                ) : (
                  <RoofMapper
                    location={config.solar.location}
                    polygons={config.solar.polygons}
                    onLocationChange={handleLocationChange}
                    onPolygonsChange={handlePolygonsChange}
                    onAreaChange={handleAreaChange}
                  />
                )}

                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Estimated Annual Output
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber(config.solar.systemSizeKw * 1500)} kWh/year
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    ~{formatNumber((config.solar.systemSizeKw * 1500) / 12)}{" "}
                    kWh/month
                  </p>
                  {config.solar.location && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      Location: {config.solar.location.address}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Installation Costs */}
        {config.solar.enabled && (
          <Card title="Installation Costs">
            <div className="space-y-4">
              <Input
                label="Cost per Watt"
                value={config.solar.costPerWatt}
                onChange={(v) => updateSolar({ costPerWatt: Number(v) })}
                prefix="$"
                step={0.25}
                tooltip="Total installed cost per watt including panels, inverters, and labor. US average: $2.50-3.50/W residential, $1.50-2.50/W commercial."
              />

              <Slider
                label="Federal ITC"
                value={config.solar.federalItcPercent * 100}
                onChange={(v) =>
                  updateSolar({ federalItcPercent: v / 100 })
                }
                min={0}
                max={30}
                step={1}
                unit="%"
                tooltip="Federal Investment Tax Credit. Currently 30% through 2032, then steps down. Reduces your federal tax liability."
              />

              <Input
                label="State Rebate"
                value={config.solar.stateRebate}
                onChange={(v) => updateSolar({ stateRebate: Number(v) })}
                prefix="$"
                tooltip="Additional state or local solar rebates. Check DSIRE database for available incentives in your area."
              />

              <Input
                label="Permit Fees"
                value={config.solar.permitFees}
                onChange={(v) => updateSolar({ permitFees: Number(v) })}
                prefix="$"
                tooltip="Local building permits, inspections, and interconnection fees. Typically $500-2,000 depending on jurisdiction."
              />

              <Slider
                label="Annual Production Factor"
                value={config.solar.annualProductionFactor}
                onChange={(v) => updateSolar({ annualProductionFactor: v })}
                min={800}
                max={2200}
                step={50}
                unit=" kWh/kW"
                tooltip="Annual kWh produced per kW installed. Varies by location: Southwest 1800, California 1650, Southeast 1400, Midwest 1300, Northeast 1200, Northwest 1100."
              />

              <Slider
                label="Amortization Period"
                value={config.solar.amortizationYears}
                onChange={(v) => updateSolar({ amortizationYears: v })}
                min={10}
                max={30}
                step={5}
                unit=" years"
                tooltip="Period over which solar cost is spread. Typically matches panel warranty (25 years). Shorter period = higher monthly cost but faster payback tracking."
              />
            </div>
          </Card>
        )}

        {/* Cost Summary */}
        {config.solar.enabled && (
          <Card title="Cost Summary">
            <div className="space-y-3">
              <OutputRow
                label="System Size"
                value={`${config.solar.systemSizeKw} kW`}
                tooltip="Total solar capacity. 1 kW = ~3 standard panels. Output depends on location, tilt, and shading."
              />
              <OutputRow
                label="Gross Cost"
                value={formatCurrency(calculations.solarCosts.grossCost)}
                tooltip="Total installation cost before incentives: (system kW × cost/watt × 1000) + permit fees."
              />
              <OutputRow
                label="Federal Tax Credit"
                value={`-${formatCurrency(calculations.solarCosts.federalCredit)}`}
                tooltip="Federal ITC reduces tax liability: gross cost × ITC percentage. Currently 30% through 2032."
                valueClassName="text-green-600 dark:text-green-400"
              />
              {config.solar.stateRebate > 0 && (
                <OutputRow
                  label="State Rebate"
                  value={`-${formatCurrency(config.solar.stateRebate)}`}
                  tooltip="Additional state/local incentive applied directly to reduce system cost."
                  valueClassName="text-green-600 dark:text-green-400"
                />
              )}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="font-medium text-slate-900 dark:text-white">
                  Net Cost
                </span>
                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {formatCurrency(calculations.solarCosts.netCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">
                  Amortized over {config.solar.amortizationYears} years
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {formatCurrency(calculations.solarCosts.monthlyAmortizedCost)}
                  /mo
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Energy Offset */}
        {config.solar.enabled && (
          <Card title="Energy Impact">
            <div className="space-y-3">
              <OutputRow
                label="Vehicle Energy Need"
                value={`${formatNumber(calculations.energy.monthlyVehicleKwh)} kWh/mo`}
                tooltip="Monthly electricity needed to charge your fleet: total miles / vehicle efficiency (mi/kWh)."
              />
              <OutputRow
                label="Solar Generation"
                value={`${formatNumber(calculations.energy.monthlySolarKwh)} kWh/mo`}
                tooltip="Average monthly solar output: system size × annual production factor / 12."
              />
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <OutputRow
                  label="Grid Import (remaining)"
                  value={`${formatNumber(calculations.energy.monthlyGridImportKwh)} kWh/mo`}
                  tooltip="Electricity still needed from the grid after solar and battery offsets. This is what you pay for."
                />
                {calculations.energy.monthlyExcessSolarKwh > 0 && (
                  <OutputRow
                    label="Excess Solar (export)"
                    value={`${formatNumber(calculations.energy.monthlyExcessSolarKwh)} kWh/mo`}
                    tooltip="Solar energy exported to the grid. Earns credit if net metering is enabled."
                    valueClassName="text-green-600 dark:text-green-400"
                    className="mt-2"
                  />
                )}
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <OutputRow
                  label="Solar Offset"
                  value={`${formatNumber(
                    calculations.energy.monthlyVehicleKwh > 0
                      ? ((calculations.energy.monthlyVehicleKwh -
                          calculations.energy.monthlyGridImportKwh) /
                          calculations.energy.monthlyVehicleKwh) *
                          100
                      : 0,
                    0
                  )}%`}
                  tooltip="Percentage of vehicle energy needs covered by solar. 100% means fully solar-powered fleet charging."
                  valueClassName="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
          </Card>
        )}

        {/* No Solar Message */}
        {!config.solar.enabled && (
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
                Solar Not Enabled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Enable solar to offset your energy costs and see the impact on
                your break-even timeline.
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Monthly Energy Chart */}
      {config.solar.enabled && monthlyData.length > 0 && (
        <Card title="Monthly Energy Production">
          <MonthlyEnergyChart
            data={monthlyData}
            showBattery={config.battery?.enabled}
          />
          <EnergyChartSummary data={monthlyData} />
        </Card>
      )}
    </div>
  );
}
