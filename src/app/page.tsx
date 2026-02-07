"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  exportScenarios,
  importScenarios,
  deleteScenario,
  exportSingleScenario,
} from "@/lib/storage";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("vehicles");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [scenarioList, setScenarioList] = useState(getSavedScenarios());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { config, loadScenario: loadScenarioToContext } = useScenario();

  const refreshScenarios = useCallback(() => {
    setScenarioList(getSavedScenarios());
  }, []);

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
      refreshScenarios();
    }
  }, [scenarioName, config, refreshScenarios]);

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

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this scenario?")) {
      deleteScenario(id);
      refreshScenarios();
    }
  }, [refreshScenarios]);

  const handleExport = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    exportSingleScenario(id);
  }, []);

  const handleExportAll = useCallback(() => {
    exportScenarios();
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importScenarios(file);

    if (result.imported > 0) {
      setImportMessage({ type: "success", text: `Imported ${result.imported} scenario(s)` });
      refreshScenarios();
    } else {
      setImportMessage({ type: "error", text: result.errors.join(", ") || "No scenarios imported" });
    }

    // Clear the input so the same file can be selected again
    e.target.value = "";

    // Clear message after 3 seconds
    setTimeout(() => setImportMessage(null), 3000);
  }, [refreshScenarios]);

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
              Manage Scenarios
            </h2>

            {/* Import/Export Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={handleImportClick}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </button>
              <button
                onClick={handleExportAll}
                disabled={scenarioList.length === 0}
                className="flex-1 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 border border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export All
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            {/* Import message */}
            {importMessage && (
              <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${
                importMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              }`}>
                {importMessage.text}
              </div>
            )}

            {/* Scenario List */}
            {scenarioList.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No saved scenarios yet. Import a file or save your current configuration.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {scenarioList.map((scenario) => (
                  <div
                    key={scenario.id}
                    onClick={() => handleLoad(scenario.id)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {scenario.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(scenario.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleExport(scenario.id, e)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                        title="Export"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDelete(scenario.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
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
