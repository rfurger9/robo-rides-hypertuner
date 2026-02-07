"use client";

import { useState, useEffect, useCallback } from "react";
import { useScenario } from "@/context/ScenarioContext";
import { Header } from "@/components/layout/Header";
import { TabNav, TabId } from "@/components/layout/TabNav";
import { Dashboard } from "@/components/layout/Dashboard";
import { VehicleTab } from "@/components/vehicles/VehicleTab";
import { RevenueTab } from "@/components/revenue/RevenueTab";
import { SolarTab } from "@/components/solar/SolarTab";
import { BatteryTab } from "@/components/battery/BatteryTab";
import { EnergyTab } from "@/components/energy/EnergyTab";
import { MiningTab } from "@/components/mining/MiningTab";
import { HumanoidTab } from "@/components/humanoid/HumanoidTab";
import { OptimizerTab } from "@/components/optimizer/OptimizerTab";
import { BreakEvenChart } from "@/components/charts/BreakEvenChart";
import { ScenarioTable } from "@/components/charts/ScenarioTable";
import {
  saveScenario,
  getSavedScenarios,
  loadScenario,
  saveCurrentScenario,
  loadCurrentScenario,
} from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("vehicles");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const { config, loadScenario: loadScenarioToContext } = useScenario();

  // Auto-save on config change
  useEffect(() => {
    saveCurrentScenario(config);
  }, [config]);

  // Auto-load on mount
  useEffect(() => {
    const saved = loadCurrentScenario();
    if (saved) {
      loadScenarioToContext(saved);
    }
  }, [loadScenarioToContext]);

  const handleSave = useCallback(() => {
    if (scenarioName.trim()) {
      saveScenario(scenarioName.trim(), config);
      setShowSaveModal(false);
      setScenarioName("");
    }
  }, [scenarioName, config]);

  const handleLoad = useCallback(
    (id: string) => {
      const scenario = loadScenario(id);
      if (scenario) {
        loadScenarioToContext(scenario.config);
        setShowLoadModal(false);
      }
    },
    [loadScenarioToContext]
  );

  const savedScenarios = getSavedScenarios();

  const renderTabContent = () => {
    switch (activeTab) {
      case "vehicles":
        return <VehicleTab />;
      case "revenue":
        return <RevenueTab />;
      case "solar":
        return <SolarTab />;
      case "battery":
        return <BatteryTab />;
      case "energy":
        return <EnergyTab />;
      case "mining":
        return <MiningTab />;
      case "humanoids":
        return <HumanoidTab />;
      case "optimizer":
        return <OptimizerTab />;
      default:
        return <VehicleTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header
        onSave={() => setShowSaveModal(true)}
        onLoad={() => setShowLoadModal(true)}
      />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Dashboard />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Content */}
        <div className="mb-8">{renderTabContent()}</div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BreakEvenChart />
          <ScenarioTable />
        </div>
      </main>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Save Scenario
            </h2>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!scenarioName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Load Scenario
            </h2>
            {savedScenarios.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No saved scenarios yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleLoad(scenario.id)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {scenario.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(scenario.updatedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowLoadModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
