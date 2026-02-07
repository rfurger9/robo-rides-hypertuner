"use client";

import { useScenario } from "@/context/ScenarioContext";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Slider } from "@/components/ui/Slider";
import { ToggleGroup } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { OutputRow } from "@/components/ui/InfoTooltip";
import { formatCurrency, formatNumber } from "@/calculations";
import { Vehicle, FinancingMode } from "@/types";
import { TeslaIntegration } from "./TeslaIntegration";

// Default vehicles (from database)
const defaultVehicles: Vehicle[] = [
  {
    id: "1",
    vehicleKey: "tesla_model3_lr",
    displayName: "Tesla Model 3 Long Range",
    manufacturer: "Tesla",
    msrp: 42490,
    batteryKwh: 82,
    efficiencyMiPerKwh: 4.2,
    rangeMiles: 341,
    modelYear: 2024,
    isDefault: true,
  },
  {
    id: "2",
    vehicleKey: "tesla_modely_lr",
    displayName: "Tesla Model Y Long Range",
    manufacturer: "Tesla",
    msrp: 45490,
    batteryKwh: 82,
    efficiencyMiPerKwh: 3.8,
    rangeMiles: 310,
    modelYear: 2024,
    isDefault: false,
  },
  {
    id: "3",
    vehicleKey: "tesla_cybertruck",
    displayName: "Tesla Cybertruck",
    manufacturer: "Tesla",
    msrp: 79990,
    batteryKwh: 123,
    efficiencyMiPerKwh: 2.9,
    rangeMiles: 340,
    modelYear: 2024,
    isDefault: false,
  },
];

export function VehicleTab() {
  const { config, calculations, setVehicle, setFleetSize, updateVehicle } =
    useScenario();

  const vehicleOptions = defaultVehicles.map((v) => ({
    value: v.vehicleKey,
    label: `${v.displayName} - ${formatCurrency(v.msrp)}`,
  }));

  const handleVehicleChange = (vehicleKey: string) => {
    const vehicle = defaultVehicles.find((v) => v.vehicleKey === vehicleKey);
    if (vehicle) {
      setVehicle(vehicle);
    }
  };

  const handleFinancingChange = (mode: string) => {
    updateVehicle({ financingMode: mode as FinancingMode });
  };

  return (
    <div className="space-y-6">
      {/* Tesla Integration */}
      <TeslaIntegration />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Selection */}
        <Card title="Vehicle Selection">
          <div className="space-y-4">
            <Select
              label="Vehicle Model"
              value={config.vehicle.vehicle.vehicleKey}
              onChange={handleVehicleChange}
              options={vehicleOptions}
            />

            <Slider
              label="Fleet Size"
              value={config.vehicle.quantity}
              onChange={setFleetSize}
              min={1}
              max={20}
              unit=" vehicles"
              tooltip="Number of vehicles in your robotaxi fleet. Affects total capital costs, operating costs, and potential revenue."
            />

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Battery
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {config.vehicle.vehicle.batteryKwh} kWh
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Range
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {config.vehicle.vehicle.rangeMiles} mi
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Efficiency
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {config.vehicle.vehicle.efficiencyMiPerKwh} mi/kWh
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Year
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {config.vehicle.vehicle.modelYear}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Financing Options */}
        <Card title="Financing">
          <div className="space-y-4">
            <ToggleGroup
              label="Payment Method"
              value={config.vehicle.financingMode}
              onChange={handleFinancingChange}
              options={[
                { value: "cash", label: "Cash" },
                { value: "loan", label: "Loan" },
                { value: "lease", label: "Lease" },
              ]}
            />

            {config.vehicle.financingMode === "loan" && (
              <div className="space-y-4 pt-4">
                <Input
                  label="Down Payment"
                  value={config.vehicle.loanDetails.downPayment}
                  onChange={(v) =>
                    updateVehicle({
                      loanDetails: {
                        ...config.vehicle.loanDetails,
                        downPayment: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  min={0}
                  tooltip="Initial upfront payment reducing the loan principal. Higher down payment = lower monthly payments and less interest paid over time."
                />
                <Slider
                  label="Loan Term"
                  value={config.vehicle.loanDetails.loanTermMonths}
                  onChange={(v) =>
                    updateVehicle({
                      loanDetails: {
                        ...config.vehicle.loanDetails,
                        loanTermMonths: v,
                      },
                    })
                  }
                  min={24}
                  max={84}
                  step={12}
                  unit=" months"
                  tooltip="Duration of the loan. Longer terms = lower monthly payments but more total interest paid."
                />
                <Slider
                  label="Interest Rate (APR)"
                  value={config.vehicle.loanDetails.interestRateApr * 100}
                  onChange={(v) =>
                    updateVehicle({
                      loanDetails: {
                        ...config.vehicle.loanDetails,
                        interestRateApr: v / 100,
                      },
                    })
                  }
                  min={0}
                  max={15}
                  step={0.25}
                  unit="%"
                  tooltip="Annual Percentage Rate for the loan. Current auto loan rates typically range from 5-10% depending on credit score."
                />
              </div>
            )}

            {config.vehicle.financingMode === "lease" && (
              <div className="space-y-4 pt-4">
                <Input
                  label="Monthly Lease Payment"
                  value={config.vehicle.leaseDetails.monthlyLease}
                  onChange={(v) =>
                    updateVehicle({
                      leaseDetails: {
                        ...config.vehicle.leaseDetails,
                        monthlyLease: Number(v),
                      },
                    })
                  }
                  prefix="$"
                  min={0}
                  tooltip="Fixed monthly payment for vehicle lease. Check Tesla's website for current lease offers on each model."
                />
                <Slider
                  label="Lease Term"
                  value={config.vehicle.leaseDetails.leaseTermMonths}
                  onChange={(v) =>
                    updateVehicle({
                      leaseDetails: {
                        ...config.vehicle.leaseDetails,
                        leaseTermMonths: v,
                      },
                    })
                  }
                  min={24}
                  max={48}
                  step={12}
                  unit=" months"
                  tooltip="Duration of the lease agreement. At end of term, vehicle is returned or purchased at residual value."
                />
              </div>
            )}
          </div>
        </Card>

        {/* Capital Assumptions */}
        <Card title="Capital Assumptions">
          <div className="space-y-4">
            <Slider
              label="Tax & Fees"
              value={config.vehicle.taxFeePercent * 100}
              onChange={(v) =>
                updateVehicle({
                  taxFeePercent: v / 100,
                  capitalCosts: {
                    ...config.vehicle.capitalCosts,
                    taxesFees: config.vehicle.vehicle.msrp * (v / 100),
                  },
                })
              }
              min={0}
              max={20}
              step={1}
              unit="%"
              tooltip="Sales tax, registration, and doc fees as percentage of MSRP. Varies by state: 0% (MT) to 10%+ (CA, TX). Default 10%."
            />
            <Slider
              label="Depreciation Period"
              value={config.vehicle.depreciationYears}
              onChange={(v) => updateVehicle({ depreciationYears: v })}
              min={3}
              max={10}
              step={1}
              unit=" years"
              tooltip="Years over which vehicle cost is depreciated. Affects monthly capital cost. Tesla EVs hold value well (5-7 years typical)."
            />
          </div>
        </Card>

        {/* Operating Costs */}
        <Card title="Monthly Operating Costs">
          <div className="space-y-4">
            <Input
              label="Insurance"
              value={config.vehicle.operatingCosts.insuranceMonthly}
              onChange={(v) =>
                updateVehicle({
                  operatingCosts: {
                    ...config.vehicle.operatingCosts,
                    insuranceMonthly: Number(v),
                  },
                })
              }
              prefix="$"
              suffix="/mo"
              tooltip="Monthly commercial auto insurance premium per vehicle. Rideshare coverage typically costs $150-300/month."
            />
            <Input
              label="Connectivity (LTE/5G)"
              value={config.vehicle.operatingCosts.connectivityMonthly}
              onChange={(v) =>
                updateVehicle({
                  operatingCosts: {
                    ...config.vehicle.operatingCosts,
                    connectivityMonthly: Number(v),
                  },
                })
              }
              prefix="$"
              suffix="/mo"
              tooltip="Cellular data connectivity for vehicle telematics, navigation, and remote control. Tesla Premium Connectivity is $9.99/month."
            />
            <Input
              label="Software/FSD Subscription"
              value={config.vehicle.operatingCosts.softwareSubscription}
              onChange={(v) =>
                updateVehicle({
                  operatingCosts: {
                    ...config.vehicle.operatingCosts,
                    softwareSubscription: Number(v),
                  },
                })
              }
              prefix="$"
              suffix="/mo"
              tooltip="Tesla Full Self-Driving (FSD) subscription cost. Currently $199/month or $99/month with a Tesla account."
            />
            <Input
              label="Maintenance per Mile"
              value={config.vehicle.operatingCosts.maintenancePerMile}
              onChange={(v) =>
                updateVehicle({
                  operatingCosts: {
                    ...config.vehicle.operatingCosts,
                    maintenancePerMile: Number(v),
                  },
                })
              }
              prefix="$"
              step={0.01}
              tooltip="Average maintenance cost per mile driven. EVs typically cost $0.03-0.06/mile vs $0.08-0.12/mile for gas vehicles."
            />
          </div>
        </Card>

        {/* Cost Summary */}
        <Card title="Cost Summary">
          <div className="space-y-3">
            <OutputRow
              label="Total Capital Cost"
              value={formatCurrency(calculations.vehicleCosts.totalCapitalCost)}
              tooltip="Total upfront cost for all vehicles: MSRP + taxes/fees + accessories + AV hardware (if any). This is the initial investment."
            />
            <OutputRow
              label="Monthly Payment"
              value={formatCurrency(calculations.vehicleCosts.monthlyPayment)}
              tooltip="Monthly financing payment based on loan/lease terms. For cash purchase, this is the amortized capital cost spread over the depreciation period."
            />
            <OutputRow
              label="Monthly Fixed Costs"
              value={formatCurrency(calculations.vehicleCosts.monthlyFixedCost)}
              tooltip="Monthly fixed operating costs: insurance + connectivity + software subscription. These costs don't vary with miles driven."
            />
            <OutputRow
              label="Depreciation/Month"
              value={formatCurrency(calculations.vehicleCosts.depreciationMonthly)}
              tooltip="Monthly vehicle depreciation based on MSRP and depreciation period (default 5 years). Represents the loss in vehicle value over time."
            />
            <OutputRow
              label="Cost per Mile"
              value={`$${calculations.vehicleCosts.costPerMile.toFixed(3)}`}
              tooltip="Total cost per mile driven: (monthly costs / monthly miles). Lower is better. Industry target for profitability is under $0.50/mile."
            />
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <span className="font-medium text-slate-900 dark:text-white">
                Total Monthly Vehicle Cost
              </span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {formatCurrency(calculations.vehicleCosts.totalMonthlyVehicleCost)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
