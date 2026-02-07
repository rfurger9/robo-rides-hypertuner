"use client";

import { useState } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Toggle, ToggleGroup } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import {
  HUMANOID_PLATFORMS,
  TASK_DEFINITIONS,
  TASK_CATEGORY_LABELS,
  TaskCategory,
  AcquisitionType,
  getPlatformById,
  canPerformTask,
  getTaskCapabilityScore,
} from "@/types/humanoid";
import { formatCurrency, formatNumber } from "@/calculations";
import { OutputRow } from "@/components/ui/InfoTooltip";

export function HumanoidTab() {
  const { config, calculations, toggleHumanoid, updateHumanoid } = useScenario();
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>("vehicle_turnaround");

  const humanoidCalcs = calculations.humanoid;
  const laborComp = humanoidCalcs.laborComparison;

  // Get unique platform IDs currently selected
  const selectedPlatformIds = config.humanoid.platforms.map((p) => p.platformId);

  // Add a platform selection
  const addPlatform = (platformId: string) => {
    const existing = config.humanoid.platforms.find((p) => p.platformId === platformId);
    if (existing) {
      // Increment quantity
      updateHumanoid({
        platforms: config.humanoid.platforms.map((p) =>
          p.platformId === platformId ? { ...p, quantity: p.quantity + 1 } : p
        ),
      });
    } else {
      // Add new
      updateHumanoid({
        platforms: [
          ...config.humanoid.platforms,
          { platformId, quantity: 1, acquisitionType: "purchase" as AcquisitionType },
        ],
      });
    }
  };

  // Remove a platform selection
  const removePlatform = (platformId: string) => {
    const existing = config.humanoid.platforms.find((p) => p.platformId === platformId);
    if (existing && existing.quantity > 1) {
      updateHumanoid({
        platforms: config.humanoid.platforms.map((p) =>
          p.platformId === platformId ? { ...p, quantity: p.quantity - 1 } : p
        ),
      });
    } else {
      updateHumanoid({
        platforms: config.humanoid.platforms.filter((p) => p.platformId !== platformId),
      });
    }
  };

  // Update acquisition type
  const updateAcquisitionType = (platformId: string, acquisitionType: AcquisitionType) => {
    updateHumanoid({
      platforms: config.humanoid.platforms.map((p) =>
        p.platformId === platformId ? { ...p, acquisitionType } : p
      ),
    });
  };

  // Get tasks by category
  const tasksInCategory = TASK_DEFINITIONS.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enable/Configuration */}
        <Card title="Humanoid Robotics">
          <div className="space-y-4">
            <Toggle
              label="Enable Humanoid Labor"
              checked={config.humanoid.enabled}
              onChange={toggleHumanoid}
              description="Deploy humanoid robots for vehicle operations"
            />

            {config.humanoid.enabled && (
              <>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Select Platforms
                  </h4>
                  <div className="space-y-3">
                    {HUMANOID_PLATFORMS.map((platform) => {
                      const selection = config.humanoid.platforms.find(
                        (p) => p.platformId === platform.id
                      );
                      const isSelected = !!selection;

                      return (
                        <div
                          key={platform.id}
                          className={`border rounded-lg p-3 transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 dark:text-white">
                                {platform.displayName}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {platform.manufacturer} | {platform.availability}
                              </p>
                              <div className="flex gap-4 mt-1 text-xs text-slate-500">
                                <span>{platform.runtimeHours}h runtime</span>
                                <span>{platform.payloadCapacityKg}kg payload</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected ? (
                                <>
                                  <button
                                    onClick={() => removePlatform(platform.id)}
                                    className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center font-medium">
                                    {selection.quantity}
                                  </span>
                                  <button
                                    onClick={() => addPlatform(platform.id)}
                                    className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => addPlatform(platform.id)}
                                  className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 flex items-center gap-4">
                              <span className="text-sm text-slate-500">Acquire via:</span>
                              <ToggleGroup
                                label=""
                                value={selection.acquisitionType}
                                onChange={(v) =>
                                  updateAcquisitionType(platform.id, v as AcquisitionType)
                                }
                                options={[
                                  {
                                    value: "purchase",
                                    label: `Buy ${formatCurrency(platform.estimatedMsrp)}`,
                                  },
                                  {
                                    value: "lease",
                                    label: `Lease ${formatCurrency(platform.monthlyLeaseEstimate)}/mo`,
                                  },
                                ]}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Labor Comparison Settings */}
        {config.humanoid.enabled && (
          <Card title="Human Labor Comparison">
            <div className="space-y-4">
              <Toggle
                label="Compare vs Human Labor"
                checked={config.humanoid.laborComparisonEnabled}
                onChange={(v) => updateHumanoid({ laborComparisonEnabled: v })}
                description="Calculate savings vs traditional staffing"
              />

              {config.humanoid.laborComparisonEnabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Slider
                      label="Human FTE Count"
                      value={config.humanoid.humanFteCount}
                      onChange={(v) => updateHumanoid({ humanFteCount: v })}
                      min={1}
                      max={20}
                      step={1}
                      unit=" employees"
                      tooltip="Number of full-time equivalent employees needed for current operations without robots."
                    />
                    <Slider
                      label="Weekly Hours per FTE"
                      value={config.humanoid.humanWeeklyHours}
                      onChange={(v) => updateHumanoid({ humanWeeklyHours: v })}
                      min={20}
                      max={60}
                      step={5}
                      unit=" hrs"
                      tooltip="Average hours per week each employee works. Standard full-time is 40 hours."
                    />
                  </div>

                  <Slider
                    label="Hourly Wage"
                    value={config.humanoid.humanHourlyWage}
                    onChange={(v) => updateHumanoid({ humanHourlyWage: v })}
                    min={12}
                    max={50}
                    step={1}
                    unit=""
                    formatValue={(v) => `$${v}/hr`}
                    tooltip="Base hourly wage before benefits. US minimum wage varies by state ($7.25-16+). Fleet operations typically $15-25/hr."
                  />

                  <Slider
                    label="Benefits Overhead"
                    value={config.humanoid.humanBenefitsPercent}
                    onChange={(v) => updateHumanoid({ humanBenefitsPercent: v })}
                    min={0}
                    max={50}
                    step={5}
                    unit="%"
                    tooltip="Additional cost for benefits (health insurance, 401k, payroll taxes). Typically 25-40% of base wage."
                  />

                  {/* Human Labor Cost Summary */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                      <p className="text-sm text-orange-600 dark:text-orange-400">Current Human Labor Cost</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {formatCurrency(laborComp.humanTotalAnnualCost)}/year
                      </p>
                      <p className="text-xs text-orange-500 mt-1">
                        {formatCurrency(laborComp.humanTotalAnnualCost / 12)}/month | {laborComp.humanWeeklyCoverageHours} hrs/week coverage
                      </p>
                    </div>
                    {config.humanoid.platforms.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-center">
                        Add robot platforms above to compare costs
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>
        )}

        {/* Operating Costs */}
        {config.humanoid.enabled && config.humanoid.platforms.length > 0 && (
          <Card title="Operating Costs (Per Robot/Month)">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Energy"
                  value={config.humanoid.energyCostMonthly}
                  onChange={(v) => updateHumanoid({ energyCostMonthly: v })}
                  min={20}
                  max={150}
                  step={5}
                  unit=""
                  formatValue={(v) => `$${v}`}
                  tooltip="Monthly electricity cost for charging. Depends on runtime hours and local energy rates."
                />
                <Slider
                  label="Maintenance"
                  value={config.humanoid.maintenanceCostMonthly}
                  onChange={(v) => updateHumanoid({ maintenanceCostMonthly: v })}
                  min={50}
                  max={500}
                  step={25}
                  unit=""
                  formatValue={(v) => `$${v}`}
                  tooltip="Routine maintenance costs including cleaning, calibration, and preventive service."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Slider
                  label="Parts & Repairs"
                  value={config.humanoid.partsCostMonthly}
                  onChange={(v) => updateHumanoid({ partsCostMonthly: v })}
                  min={25}
                  max={300}
                  step={25}
                  unit=""
                  formatValue={(v) => `$${v}`}
                  tooltip="Replacement parts budget for wear items like grippers, joints, and sensors."
                />
                <Slider
                  label="Software/AI"
                  value={config.humanoid.softwareCostMonthly}
                  onChange={(v) => updateHumanoid({ softwareCostMonthly: v })}
                  min={50}
                  max={400}
                  step={25}
                  unit=""
                  formatValue={(v) => `$${v}`}
                  tooltip="AI/ML model licensing, cloud computing for task planning, and software updates."
                />
              </div>
              <Slider
                label="Insurance"
                value={config.humanoid.insuranceCostMonthly}
                onChange={(v) => updateHumanoid({ insuranceCostMonthly: v })}
                min={25}
                max={300}
                step={25}
                unit=""
                formatValue={(v) => `$${v}`}
                tooltip="Liability and equipment insurance for robot operations. Covers accidents and damage."
              />
            </div>
          </Card>
        )}

        {/* Task Capabilities */}
        {config.humanoid.enabled && config.humanoid.platforms.length > 0 && (
          <Card title="Task Capabilities">
            <div className="space-y-4">
              <Select
                label="Task Category"
                value={selectedCategory}
                onChange={(v) => setSelectedCategory(v as TaskCategory)}
                options={Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />

              <div className="space-y-2">
                {tasksInCategory.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {task.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {task.description}
                        </p>
                        <div className="flex gap-3 mt-1 text-xs text-slate-400">
                          <span>{task.durationMinutes} min</span>
                          <span>{task.frequency}</span>
                          <span className="capitalize">{task.skillLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Platform compatibility */}
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex flex-wrap gap-2">
                        {config.humanoid.platforms.map((selection) => {
                          const platform = getPlatformById(selection.platformId);
                          if (!platform) return null;
                          const capable = canPerformTask(platform, task);
                          const score = getTaskCapabilityScore(platform, task);

                          return (
                            <div
                              key={platform.id}
                              className={`px-2 py-1 rounded text-xs ${
                                capable
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {platform.displayName.split(" ")[0]}: {score.toFixed(1)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Economics Summary */}
        {config.humanoid.enabled && config.humanoid.platforms.length > 0 && (
          <Card title="Humanoid Economics">
            <div className="space-y-4">
              {/* Fleet Summary */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400">Robot Fleet</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {humanoidCalcs.totalPlatforms} Units
                </p>
                <p className="text-xs text-purple-500 mt-1">
                  {formatNumber(humanoidCalcs.totalWeeklyCoverageHours, 0)} coverage hrs/week
                </p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2">
                <OutputRow
                  label="Capital Investment"
                  value={formatCurrency(humanoidCalcs.totalCapitalCost)}
                  tooltip="Total upfront cost for all robot platforms: sum of (unit MSRP × quantity) for purchased units."
                />
                <OutputRow
                  label="Monthly Amortized Capital"
                  value={formatCurrency(humanoidCalcs.monthlyAmortizedCapital)}
                  tooltip="Purchase cost spread over expected robot lifespan (typically 5-7 years). Lease payments shown directly for leased units."
                />
                <OutputRow
                  label="Monthly Operating"
                  value={formatCurrency(humanoidCalcs.totalMonthlyOperating)}
                  tooltip="Total monthly operating costs across all robots: energy + maintenance + parts + software + insurance per unit × quantity."
                />
                <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-600">
                  <span className="font-medium">Total Monthly Cost</span>
                  <span className="font-bold text-purple-600">
                    {formatCurrency(humanoidCalcs.totalMonthlyCost)}
                  </span>
                </div>
              </div>

              {/* Labor Comparison */}
              {config.humanoid.laborComparisonEnabled && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    vs Human Labor
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Human Cost/Year</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(laborComp.humanTotalAnnualCost)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {laborComp.humanWeeklyCoverageHours} hrs/week
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Robot Cost/Year</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(laborComp.humanoidAnnualCost)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatNumber(laborComp.humanoidWeeklyCoverageHours, 0)} hrs/week
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div
                      className={`rounded-lg p-3 ${
                        laborComp.annualSavings >= 0
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400">Annual Savings</p>
                      <p
                        className={`text-lg font-bold ${
                          laborComp.annualSavings >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(laborComp.annualSavings)}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Payback Period</p>
                      <p className="text-lg font-bold text-blue-600">
                        {laborComp.paybackMonths === Infinity
                          ? "N/A"
                          : `${formatNumber(laborComp.paybackMonths, 1)} mo`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <OutputRow
                      label="Coverage Multiplier"
                      value={`${formatNumber(laborComp.coverageMultiplier, 1)}x`}
                      tooltip="Robot coverage hours / human coverage hours. >1x means robots provide more operational coverage."
                    />
                    <OutputRow
                      label="Cost/Hour (Human)"
                      value={formatCurrency(laborComp.costPerHourHuman)}
                      tooltip="Fully loaded human labor cost per hour: (hourly wage × (1 + benefits %))."
                    />
                    <OutputRow
                      label="Cost/Hour (Robot)"
                      value={formatCurrency(laborComp.costPerHourHumanoid)}
                      tooltip="Total robot cost per operational hour: (monthly cost / monthly coverage hours). Decreases as utilization increases."
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Disabled State */}
        {!config.humanoid.enabled && (
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Humanoid Labor Not Enabled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Enable humanoid robots to automate vehicle operations and compare costs against
                traditional human labor.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
