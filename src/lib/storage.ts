import { ScenarioConfig } from "@/types";

const STORAGE_KEY = "robo-rides-scenarios";
const CURRENT_SCENARIO_KEY = "robo-rides-current";

interface SavedScenario {
  id: string;
  name: string;
  config: ScenarioConfig;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all saved scenarios from localStorage
 */
export function getSavedScenarios(): SavedScenario[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading scenarios:", error);
    return [];
  }
}

/**
 * Save a scenario to localStorage
 */
export function saveScenario(
  name: string,
  config: ScenarioConfig
): SavedScenario {
  const scenarios = getSavedScenarios();

  const newScenario: SavedScenario = {
    id: crypto.randomUUID(),
    name,
    config: { ...config, name },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  scenarios.push(newScenario);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));

  return newScenario;
}

/**
 * Update an existing scenario
 */
export function updateScenario(
  id: string,
  config: ScenarioConfig
): SavedScenario | null {
  const scenarios = getSavedScenarios();
  const index = scenarios.findIndex((s) => s.id === id);

  if (index === -1) return null;

  scenarios[index] = {
    ...scenarios[index],
    config,
    name: config.name,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  return scenarios[index];
}

/**
 * Delete a scenario
 */
export function deleteScenario(id: string): boolean {
  const scenarios = getSavedScenarios();
  const filtered = scenarios.filter((s) => s.id !== id);

  if (filtered.length === scenarios.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Load a scenario by ID
 */
export function loadScenario(id: string): SavedScenario | null {
  const scenarios = getSavedScenarios();
  return scenarios.find((s) => s.id === id) || null;
}

/**
 * Save current working scenario (auto-save)
 */
export function saveCurrentScenario(config: ScenarioConfig): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CURRENT_SCENARIO_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving current scenario:", error);
  }
}

/**
 * Load current working scenario (auto-load)
 */
export function loadCurrentScenario(): ScenarioConfig | null {
  if (typeof window === "undefined") return null;

  try {
    const data = localStorage.getItem(CURRENT_SCENARIO_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading current scenario:", error);
    return null;
  }
}

/**
 * Clear current working scenario
 */
export function clearCurrentScenario(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_SCENARIO_KEY);
}

/**
 * Export all scenarios to a JSON file
 */
export function exportScenarios(): void {
  const scenarios = getSavedScenarios();
  const currentScenario = loadCurrentScenario();

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    scenarios,
    currentScenario,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `robo-rides-scenarios-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export a single scenario to a JSON file
 */
export function exportSingleScenario(id: string): void {
  const scenario = loadScenario(id);
  if (!scenario) return;

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    scenario,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${scenario.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import scenarios from a JSON file
 * Returns the number of scenarios imported
 */
export function importScenarios(file: File): Promise<{ imported: number; errors: string[] }> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const errors: string[] = [];
        let imported = 0;

        // Handle single scenario export
        if (data.scenario) {
          const scenario = data.scenario;
          if (scenario.config && scenario.name) {
            saveScenario(scenario.name, scenario.config);
            imported++;
          } else {
            errors.push("Invalid scenario format");
          }
        }

        // Handle multiple scenarios export
        if (data.scenarios && Array.isArray(data.scenarios)) {
          for (const scenario of data.scenarios) {
            if (scenario.config && scenario.name) {
              saveScenario(scenario.name, scenario.config);
              imported++;
            } else {
              errors.push(`Skipped invalid scenario`);
            }
          }
        }

        // Optionally restore current scenario
        if (data.currentScenario) {
          saveCurrentScenario(data.currentScenario);
        }

        resolve({ imported, errors });
      } catch (error) {
        resolve({ imported: 0, errors: ["Failed to parse JSON file"] });
      }
    };

    reader.onerror = () => {
      resolve({ imported: 0, errors: ["Failed to read file"] });
    };

    reader.readAsText(file);
  });
}
