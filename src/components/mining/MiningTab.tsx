"use client";

import { useState, useEffect } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Toggle, ToggleGroup } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import {
  ASIC_MINERS,
  GPU_MINERS,
  COOLING_PRESETS,
  CoolingType,
  MiningStrategy,
  TargetCrypto,
  Algorithm,
} from "@/types/mining";
import { formatCurrency, formatNumber } from "@/calculations";
import { OutputRow } from "@/components/ui/InfoTooltip";

interface CryptoPrices {
  bitcoin: number;
  litecoin: number;
  ravencoin: number;
  ergo: number;
  flux: number;
  source: string;
}

export function MiningTab() {
  const { config, calculations, toggleMining, updateMining } = useScenario();
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);

  // Fetch crypto prices on mount
  useEffect(() => {
    async function fetchPrices() {
      setPricesLoading(true);
      try {
        const res = await fetch("/api/crypto?type=prices");
        const data = await res.json();
        setPrices(data);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      } finally {
        setPricesLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const selectedAsic = ASIC_MINERS.find((m) => m.id === config.mining.asicModel);
  const selectedGpu = GPU_MINERS.find((m) => m.id === config.mining.gpuModel);
  const selectedCooling = COOLING_PRESETS[config.mining.coolingType];

  const miningCalcs = calculations.mining;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mining Enable/Strategy */}
        <Card title="Mining Configuration">
          <div className="space-y-4">
            <Toggle
              label="Enable Cryptocurrency Mining"
              checked={config.mining.enabled}
              onChange={toggleMining}
              description="Use excess solar energy or off-peak power to mine crypto"
            />

            {config.mining.enabled && (
              <>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <ToggleGroup
                    label="Mining Strategy"
                    value={config.mining.miningStrategy}
                    onChange={(v) =>
                      updateMining({ miningStrategy: v as MiningStrategy })
                    }
                    options={[
                      { value: "excess_solar", label: "Excess Solar" },
                      { value: "tou_arbitrage", label: "TOU Arbitrage" },
                      { value: "continuous", label: "24/7" },
                    ]}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {config.mining.miningStrategy === "excess_solar" &&
                      "Mine only when solar production exceeds vehicle charging needs."}
                    {config.mining.miningStrategy === "tou_arbitrage" &&
                      "Mine during off-peak hours when electricity is cheapest."}
                    {config.mining.miningStrategy === "continuous" &&
                      "Maximum mining output, but highest energy costs."}
                  </p>
                  {config.mining.miningStrategy === "excess_solar" && !config.solar.enabled && (
                    <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        <strong>Warning:</strong> Solar is not enabled. Enable solar in the Solar tab or switch to a different strategy to see mining profits.
                      </p>
                    </div>
                  )}
                </div>

                <Slider
                  label="Pool Fee"
                  value={config.mining.poolFeePercent}
                  onChange={(v) => updateMining({ poolFeePercent: v })}
                  min={0.5}
                  max={3}
                  step={0.5}
                  unit="%"
                  tooltip="Mining pool fee percentage. Most pools charge 1-2%. Lower fees = more profit, but smaller pools may have higher variance."
                />

                <div className="flex items-center gap-4 pt-2">
                  <Toggle
                    label="Model Difficulty Increases"
                    checked={config.mining.modelDifficultyIncreases}
                    onChange={(v) => updateMining({ modelDifficultyIncreases: v })}
                    description=""
                  />
                </div>

                {config.mining.modelDifficultyIncreases && (
                  <Slider
                    label="Annual Difficulty Growth"
                    value={config.mining.annualDifficultyGrowthPercent}
                    onChange={(v) =>
                      updateMining({ annualDifficultyGrowthPercent: v })
                    }
                    min={0}
                    max={50}
                    step={5}
                    unit="%"
                    tooltip="Expected yearly increase in network difficulty. Bitcoin historically: 30-50%/year. Higher difficulty = lower future earnings."
                  />
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Slider
                    label="Facility Base Load"
                    value={config.mining.facilityBaseLoadKw}
                    onChange={(v) => updateMining({ facilityBaseLoadKw: v })}
                    min={0}
                    max={50}
                    step={1}
                    unit=" kW"
                    formatValue={(v) => `${v} kW`}
                    tooltip="Constant power draw for facility operations (HVAC, lighting, equipment). Solar covers this + fleet charging before mining."
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    HVAC, lighting, office equipment, etc. Solar must cover this + fleet charging before mining gets any.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Live Prices */}
        {config.mining.enabled && (
          <Card title="Live Crypto Prices">
            <div className="space-y-3">
              {pricesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : prices ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        Bitcoin (BTC)
                      </p>
                      <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                        {formatCurrency(prices.bitcoin)}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Litecoin (LTC)
                      </p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                        {formatCurrency(prices.litecoin)}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Ravencoin (RVN)
                      </p>
                      <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                        ${prices.ravencoin.toFixed(4)}
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Ergo (ERG)
                      </p>
                      <p className="text-xl font-bold text-green-700 dark:text-green-300">
                        ${prices.ergo.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Source: {prices.source} | Updates every minute
                  </p>
                </>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                  Unable to load prices
                </p>
              )}
            </div>
          </Card>
        )}

        {/* ASIC Configuration */}
        {config.mining.enabled && (
          <Card title="ASIC Miner (Bitcoin)">
            <div className="space-y-4">
              <Select
                label="ASIC Model"
                value={config.mining.asicModel}
                onChange={(v) => updateMining({ asicModel: v })}
                options={ASIC_MINERS.map((m) => ({
                  value: m.id,
                  label: `${m.displayName} (${m.hashrateTh} TH/s)`,
                }))}
              />

              {selectedAsic && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Hashrate:</span>{" "}
                      <span className="font-medium">{selectedAsic.hashrateTh} TH/s</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Power:</span>{" "}
                      <span className="font-medium">{selectedAsic.powerWatts}W</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Efficiency:</span>{" "}
                      <span className="font-medium">{selectedAsic.efficiencyJTh} J/TH</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Price:</span>{" "}
                      <span className="font-medium">{formatCurrency(selectedAsic.msrpUsd)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Slider
                label="Quantity"
                value={config.mining.asicQuantity}
                onChange={(v) => updateMining({ asicQuantity: v })}
                min={1}
                max={10}
                step={1}
                unit=" units"
                tooltip="Number of ASIC miners to operate. Scale based on available power and cooling capacity."
              />

              <Slider
                label="Overclock"
                value={config.mining.asicOverclockPercent}
                onChange={(v) => updateMining({ asicOverclockPercent: v })}
                min={-10}
                max={15}
                step={5}
                unit="%"
                formatValue={(v) => (v > 0 ? `+${v}%` : `${v}%`)}
                tooltip="Adjust hashrate vs power consumption. Underclocking (-10%) improves efficiency, overclocking (+15%) max power but less efficient."
              />
            </div>
          </Card>
        )}

        {/* GPU Configuration */}
        {config.mining.enabled && (
          <Card title="GPU Mining (Altcoins)">
            <div className="space-y-4">
              <Toggle
                label="Enable GPU Mining"
                checked={config.mining.gpuEnabled}
                onChange={(v) => updateMining({ gpuEnabled: v })}
                description="Mine altcoins with GPUs for diversification"
              />

              {config.mining.gpuEnabled && (
                <>
                  <Select
                    label="GPU Model"
                    value={config.mining.gpuModel}
                    onChange={(v) => updateMining({ gpuModel: v })}
                    options={GPU_MINERS.map((g) => ({
                      value: g.id,
                      label: `${g.displayName} (${g.vramGb}GB)`,
                    }))}
                  />

                  <Select
                    label="Target Coin"
                    value={config.mining.gpuTargetCoin}
                    onChange={(v) => updateMining({ gpuTargetCoin: v as TargetCrypto })}
                    options={[
                      { value: "RVN", label: "Ravencoin (RVN)" },
                      { value: "ERGO", label: "Ergo (ERG)" },
                      { value: "FLUX", label: "Flux (FLUX)" },
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Slider
                      label="GPUs per Rig"
                      value={config.mining.gpuQuantity}
                      onChange={(v) => updateMining({ gpuQuantity: v })}
                      min={1}
                      max={8}
                      step={1}
                      unit=""
                      tooltip="GPUs per mining rig. Standard mining rigs support 6-8 GPUs. More GPUs = more hashrate per rig."
                    />
                    <Slider
                      label="Number of Rigs"
                      value={config.mining.gpuRigCount}
                      onChange={(v) => updateMining({ gpuRigCount: v })}
                      min={1}
                      max={5}
                      step={1}
                      unit=""
                      tooltip="Total mining rigs to operate. Each rig needs its own motherboard, PSU, and cooling."
                    />
                  </div>

                  {selectedGpu && (
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm">
                      <p className="font-medium mb-1">
                        Total: {config.mining.gpuQuantity * config.mining.gpuRigCount} GPUs
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                        <div>Power: {selectedGpu.powerWattsMining * config.mining.gpuQuantity * config.mining.gpuRigCount}W</div>
                        <div>Cost: {formatCurrency(selectedGpu.msrpUsd * config.mining.gpuQuantity * config.mining.gpuRigCount)}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        )}

        {/* Cooling Configuration */}
        {config.mining.enabled && (
          <Card title="Cooling Infrastructure">
            <div className="space-y-4">
              <ToggleGroup
                label="Cooling Type"
                value={config.mining.coolingType}
                onChange={(v) => {
                  const cooling = COOLING_PRESETS[v as CoolingType];
                  updateMining({
                    coolingType: v as CoolingType,
                    coolingPowerWatts: cooling.powerWatts,
                    coolingInstallCost: cooling.installCost,
                  });
                }}
                options={[
                  { value: "portable_ac", label: "Portable AC" },
                  { value: "mini_split", label: "Mini Split" },
                  { value: "industrial", label: "Industrial" },
                  { value: "immersion", label: "Immersion" },
                ]}
              />

              {selectedCooling && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Capacity:</span>{" "}
                      <span className="font-medium">{selectedCooling.capacityKw} kW</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Power Draw:</span>{" "}
                      <span className="font-medium">{selectedCooling.powerWatts}W</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500">Install Cost:</span>{" "}
                      <span className="font-medium">{formatCurrency(selectedCooling.installCost)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Profitability Summary */}
        {config.mining.enabled && (
          <Card title="Mining Profitability">
            <div className="space-y-4">
              {/* Hashrate */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-orange-600 dark:text-orange-400">Total Hashrate</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {formatNumber(miningCalcs.totalHashrateTh, 1)} TH/s
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  Network share: {(miningCalcs.minerShare * 100).toExponential(2)}%
                </p>
              </div>

              {/* Revenue */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-slate-500">Daily BTC</p>
                  <p className="text-lg font-semibold">
                    {miningCalcs.dailyCryptoNet.toFixed(8)} BTC
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Daily Revenue</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(miningCalcs.dailyUsdRevenue)}
                  </p>
                </div>
              </div>

              {/* Energy Source Breakdown */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Energy Sources ({formatNumber(miningCalcs.effectiveHoursPerDay, 1)} hrs/day)
                </p>
                <div className="space-y-2">
                  {miningCalcs.energyFromSolarKwh > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600 dark:text-yellow-400">Solar</span>
                      <span className="font-medium">
                        {formatNumber(miningCalcs.energyFromSolarKwh, 0)} kWh ({formatNumber(miningCalcs.solarOffsetPercent, 0)}%)
                      </span>
                    </div>
                  )}
                  {miningCalcs.energyFromBatteryKwh > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-600 dark:text-purple-400">Battery</span>
                      <span className="font-medium">
                        {formatNumber(miningCalcs.energyFromBatteryKwh, 0)} kWh
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Grid</span>
                    <span className="font-medium">
                      {formatNumber(miningCalcs.energyFromGridKwh, 0)} kWh
                    </span>
                  </div>
                </div>
                {miningCalcs.monthlySolarSavings > 0 && (
                  <div className="mt-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Solar/Battery Savings</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(miningCalcs.monthlySolarSavings)}/mo
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Breakdown */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <OutputRow
                  label="Monthly Revenue"
                  value={formatCurrency(miningCalcs.monthlyGrossRevenue)}
                  tooltip="Gross monthly mining income: daily crypto earned × 30 × current crypto price, after pool fees."
                  valueClassName="text-green-600"
                />
                <OutputRow
                  label={`Energy Cost (${formatNumber(miningCalcs.monthlyEnergyKwh, 0)} kWh)`}
                  value={`-${formatCurrency(miningCalcs.monthlyEnergyCost)}`}
                  tooltip="Monthly electricity cost for mining rigs + cooling. Reduced by solar/battery offsets based on strategy."
                  valueClassName="text-red-600"
                />
                {miningCalcs.energyCostWithoutSolar > miningCalcs.monthlyEnergyCost && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 italic">Without solar/battery:</span>
                    <span className="text-slate-400 italic line-through">
                      {formatCurrency(miningCalcs.energyCostWithoutSolar)}
                    </span>
                  </div>
                )}
                <OutputRow
                  label="Maintenance"
                  value={`-${formatCurrency(miningCalcs.monthlyMaintenanceCost)}`}
                  tooltip="Monthly maintenance costs for mining hardware: cleaning, thermal paste, fan replacement, etc."
                  valueClassName="text-red-600"
                />
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-600">
                  <span className="font-medium">Monthly Profit</span>
                  <span className={`font-bold ${miningCalcs.monthlyNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(miningCalcs.monthlyNetProfit)}
                  </span>
                </div>
              </div>

              {/* Payback */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Hardware Investment</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(miningCalcs.totalHardwareCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Payback Period</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {miningCalcs.paybackMonths === Infinity
                        ? "N/A"
                        : `${formatNumber(miningCalcs.paybackMonths, 1)} months`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Disabled State */}
        {!config.mining.enabled && (
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Mining Not Enabled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Enable cryptocurrency mining to utilize excess solar energy and see the impact on your overall profitability.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
