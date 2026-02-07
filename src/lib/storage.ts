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
