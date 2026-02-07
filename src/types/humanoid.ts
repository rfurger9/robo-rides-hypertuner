// Humanoid Robotics Types

export type AcquisitionType = "purchase" | "lease";
export type TaskCategory =
  | "vehicle_turnaround"
  | "charging_ops"
  | "maintenance"
  | "passenger_assist"
  | "security"
  | "mining_support"
  | "facility";

export type SkillLevel = "basic" | "intermediate" | "advanced";

// Humanoid Platform Definition
export interface HumanoidPlatform {
  id: string;
  displayName: string;
  manufacturer: string;
  heightCm: number;
  weightKg: number;
  payloadCapacityKg: number;
  batteryKwh: number;
  runtimeHours: number;
  chargeTimeHours: number;
  walkingSpeedKph: number;
  estimatedMsrp: number;
  monthlyLeaseEstimate: number;
  availability: string;
  capabilities: CapabilityRating;
}

// Capability ratings (1-10 scale)
export interface CapabilityRating {
  fineManipulation: number;
  heavyLifting: number;
  mobility: number;
  outdoorOperation: number;
  vehicleInterior: number;
  chargingOps: number;
  humanInteraction: number;
  runtimeEfficiency: number;
}

// Task definition
export interface TaskDefinition {
  id: string;
  category: TaskCategory;
  name: string;
  description: string;
  durationMinutes: number;
  frequency: string;
  skillLevel: SkillLevel;
  requiredCapabilities: (keyof CapabilityRating)[];
  minCapabilityScore: number;
}

// Platform selection in config
export interface PlatformSelection {
  platformId: string;
  quantity: number;
  acquisitionType: AcquisitionType;
}

// Task allocation
export interface TaskAllocation {
  taskId: string;
  platformId: string;
  hoursPerDay: number;
  robotsAssigned: number;
}

// Humanoid configuration in scenario
export interface HumanoidConfig {
  enabled: boolean;
  platforms: PlatformSelection[];
  taskAllocations: TaskAllocation[];

  // Labor comparison settings
  laborComparisonEnabled: boolean;
  humanHourlyWage: number;
  humanBenefitsPercent: number;
  humanFteCount: number;
  humanWeeklyHours: number;

  // Operating costs per unit (monthly)
  energyCostMonthly: number;
  maintenanceCostMonthly: number;
  partsCostMonthly: number;
  softwareCostMonthly: number;
  insuranceCostMonthly: number;

  // Capital cost additions per unit
  customizationCost: number;
  chargingStationCost: number;
  safetySystemsCost: number;
  installationCost: number;

  // Depreciation
  depreciationYears: number;
}

// Labor comparison calculation result
export interface LaborComparison {
  // Human costs
  humanAnnualCostPerFte: number;
  humanTotalAnnualCost: number;
  humanWeeklyCoverageHours: number;

  // Humanoid costs
  humanoidQuantity: number;
  humanoidCapitalTotal: number;
  humanoidAnnualCapital: number;
  humanoidAnnualOperating: number;
  humanoidWeeklyCoverageHours: number;
  humanoidAnnualCost: number;

  // Comparison
  annualSavings: number;
  monthlySavings: number;
  coverageMultiplier: number;
  paybackMonths: number;
  costPerHourHuman: number;
  costPerHourHumanoid: number;
}

// Humanoid revenue/cost calculation result
export interface HumanoidCalculation {
  // Fleet summary
  totalPlatforms: number;
  totalCapitalCost: number;
  totalMonthlyOperating: number;
  monthlyAmortizedCapital: number;
  totalMonthlyCost: number;

  // Coverage
  totalWeeklyCoverageHours: number;
  coveragePerVehicle: number;

  // Labor comparison
  laborComparison: LaborComparison;
}

// Humanoid Platform Database
export const HUMANOID_PLATFORMS: HumanoidPlatform[] = [
  {
    id: "tesla_optimus",
    displayName: "Tesla Optimus Gen 2",
    manufacturer: "Tesla",
    heightCm: 173,
    weightKg: 57,
    payloadCapacityKg: 20,
    batteryKwh: 2.3,
    runtimeHours: 5,
    chargeTimeHours: 2,
    walkingSpeedKph: 5,
    estimatedMsrp: 25000,
    monthlyLeaseEstimate: 800,
    availability: "2025-2026",
    capabilities: {
      fineManipulation: 8,
      heavyLifting: 7,
      mobility: 6,
      outdoorOperation: 7,
      vehicleInterior: 8,
      chargingOps: 9,
      humanInteraction: 7,
      runtimeEfficiency: 8,
    },
  },
  {
    id: "figure_02",
    displayName: "Figure 02",
    manufacturer: "Figure AI",
    heightCm: 170,
    weightKg: 60,
    payloadCapacityKg: 25,
    batteryKwh: 2.0,
    runtimeHours: 5,
    chargeTimeHours: 2,
    walkingSpeedKph: 4.5,
    estimatedMsrp: 50000,
    monthlyLeaseEstimate: 1500,
    availability: "2025",
    capabilities: {
      fineManipulation: 9,
      heavyLifting: 8,
      mobility: 7,
      outdoorOperation: 6,
      vehicleInterior: 9,
      chargingOps: 8,
      humanInteraction: 8,
      runtimeEfficiency: 7,
    },
  },
  {
    id: "1x_neo",
    displayName: "1X Neo",
    manufacturer: "1X Technologies",
    heightCm: 165,
    weightKg: 30,
    payloadCapacityKg: 15,
    batteryKwh: 1.5,
    runtimeHours: 4,
    chargeTimeHours: 1.5,
    walkingSpeedKph: 4,
    estimatedMsrp: 30000,
    monthlyLeaseEstimate: 950,
    availability: "2025",
    capabilities: {
      fineManipulation: 7,
      heavyLifting: 5,
      mobility: 8,
      outdoorOperation: 7,
      vehicleInterior: 7,
      chargingOps: 7,
      humanInteraction: 8,
      runtimeEfficiency: 8,
    },
  },
  {
    id: "agility_digit",
    displayName: "Agility Digit",
    manufacturer: "Agility Robotics",
    heightCm: 175,
    weightKg: 65,
    payloadCapacityKg: 35,
    batteryKwh: 2.5,
    runtimeHours: 4,
    chargeTimeHours: 2.5,
    walkingSpeedKph: 5.5,
    estimatedMsrp: 40000,
    monthlyLeaseEstimate: 1200,
    availability: "Available",
    capabilities: {
      fineManipulation: 5,
      heavyLifting: 9,
      mobility: 8,
      outdoorOperation: 8,
      vehicleInterior: 5,
      chargingOps: 8,
      humanInteraction: 6,
      runtimeEfficiency: 6,
    },
  },
  {
    id: "unitree_h1",
    displayName: "Unitree H1",
    manufacturer: "Unitree Robotics",
    heightCm: 180,
    weightKg: 47,
    payloadCapacityKg: 10,
    batteryKwh: 1.8,
    runtimeHours: 3,
    chargeTimeHours: 2,
    walkingSpeedKph: 6,
    estimatedMsrp: 90000,
    monthlyLeaseEstimate: 2500,
    availability: "Available",
    capabilities: {
      fineManipulation: 5,
      heavyLifting: 4,
      mobility: 9,
      outdoorOperation: 8,
      vehicleInterior: 4,
      chargingOps: 5,
      humanInteraction: 5,
      runtimeEfficiency: 5,
    },
  },
];

// Task Definitions
export const TASK_DEFINITIONS: TaskDefinition[] = [
  // Vehicle Turnaround
  {
    id: "interior_wipedown",
    category: "vehicle_turnaround",
    name: "Interior Wipe-down",
    description: "Quick cleaning of seats, surfaces, and touchpoints",
    durationMinutes: 5,
    frequency: "Every ride",
    skillLevel: "basic",
    requiredCapabilities: ["fineManipulation", "vehicleInterior"],
    minCapabilityScore: 6,
  },
  {
    id: "deep_clean",
    category: "vehicle_turnaround",
    name: "Deep Clean",
    description: "Thorough interior cleaning including vacuum and sanitize",
    durationMinutes: 20,
    frequency: "Daily",
    skillLevel: "intermediate",
    requiredCapabilities: ["fineManipulation", "vehicleInterior"],
    minCapabilityScore: 7,
  },
  {
    id: "exterior_wash",
    category: "vehicle_turnaround",
    name: "Exterior Wash",
    description: "Full exterior vehicle wash",
    durationMinutes: 15,
    frequency: "Weekly",
    skillLevel: "basic",
    requiredCapabilities: ["outdoorOperation", "mobility"],
    minCapabilityScore: 6,
  },
  {
    id: "trash_removal",
    category: "vehicle_turnaround",
    name: "Trash Removal",
    description: "Remove trash and debris from vehicle",
    durationMinutes: 3,
    frequency: "Every ride",
    skillLevel: "basic",
    requiredCapabilities: ["fineManipulation", "vehicleInterior"],
    minCapabilityScore: 5,
  },
  // Charging Operations
  {
    id: "cable_connect",
    category: "charging_ops",
    name: "Cable Connection",
    description: "Connect charging cable to vehicle",
    durationMinutes: 2,
    frequency: "Per charge",
    skillLevel: "intermediate",
    requiredCapabilities: ["fineManipulation", "chargingOps"],
    minCapabilityScore: 7,
  },
  {
    id: "cable_disconnect",
    category: "charging_ops",
    name: "Cable Disconnection",
    description: "Disconnect charging cable from vehicle",
    durationMinutes: 1,
    frequency: "Per charge",
    skillLevel: "basic",
    requiredCapabilities: ["fineManipulation", "chargingOps"],
    minCapabilityScore: 6,
  },
  {
    id: "charge_monitoring",
    category: "charging_ops",
    name: "Charge Monitoring",
    description: "Monitor charging status and report issues",
    durationMinutes: 0,
    frequency: "Continuous",
    skillLevel: "basic",
    requiredCapabilities: ["chargingOps"],
    minCapabilityScore: 5,
  },
  // Maintenance Support
  {
    id: "visual_inspection",
    category: "maintenance",
    name: "Visual Inspection",
    description: "Inspect vehicle for damage or issues",
    durationMinutes: 10,
    frequency: "Daily",
    skillLevel: "intermediate",
    requiredCapabilities: ["vehicleInterior", "outdoorOperation"],
    minCapabilityScore: 6,
  },
  {
    id: "tire_check",
    category: "maintenance",
    name: "Tire Pressure Check",
    description: "Check and report tire pressure",
    durationMinutes: 5,
    frequency: "Weekly",
    skillLevel: "basic",
    requiredCapabilities: ["fineManipulation", "outdoorOperation"],
    minCapabilityScore: 5,
  },
  // Passenger Assistance
  {
    id: "luggage_loading",
    category: "passenger_assist",
    name: "Luggage Loading",
    description: "Help passengers load luggage",
    durationMinutes: 3,
    frequency: "Per request",
    skillLevel: "intermediate",
    requiredCapabilities: ["heavyLifting", "humanInteraction"],
    minCapabilityScore: 7,
  },
  {
    id: "passenger_greeting",
    category: "passenger_assist",
    name: "Greeting/Wayfinding",
    description: "Greet passengers and provide directions",
    durationMinutes: 2,
    frequency: "Per pickup",
    skillLevel: "basic",
    requiredCapabilities: ["humanInteraction"],
    minCapabilityScore: 6,
  },
  // Security
  {
    id: "depot_patrol",
    category: "security",
    name: "Depot Patrol",
    description: "Regular security patrol of facility",
    durationMinutes: 0,
    frequency: "Continuous",
    skillLevel: "basic",
    requiredCapabilities: ["mobility", "outdoorOperation"],
    minCapabilityScore: 6,
  },
  // Mining Support
  {
    id: "asic_cleaning",
    category: "mining_support",
    name: "ASIC Cleaning",
    description: "Clean dust from mining hardware",
    durationMinutes: 30,
    frequency: "Monthly",
    skillLevel: "intermediate",
    requiredCapabilities: ["fineManipulation"],
    minCapabilityScore: 7,
  },
  {
    id: "hardware_monitoring",
    category: "mining_support",
    name: "Hardware Monitoring",
    description: "Monitor mining hardware status",
    durationMinutes: 0,
    frequency: "Continuous",
    skillLevel: "basic",
    requiredCapabilities: ["fineManipulation"],
    minCapabilityScore: 5,
  },
  // Facility
  {
    id: "facility_cleaning",
    category: "facility",
    name: "Facility Cleaning",
    description: "General facility cleaning and maintenance",
    durationMinutes: 60,
    frequency: "Daily",
    skillLevel: "basic",
    requiredCapabilities: ["mobility", "fineManipulation"],
    minCapabilityScore: 5,
  },
];

// Task Category Labels
export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  vehicle_turnaround: "Vehicle Turnaround",
  charging_ops: "Charging Operations",
  maintenance: "Maintenance Support",
  passenger_assist: "Passenger Assistance",
  security: "Security & Monitoring",
  mining_support: "Mining Hardware",
  facility: "Facility Management",
};

// Default humanoid configuration
export const defaultHumanoidConfig: HumanoidConfig = {
  enabled: false,
  platforms: [],
  taskAllocations: [],

  // Labor comparison
  laborComparisonEnabled: true,
  humanHourlyWage: 22,
  humanBenefitsPercent: 30,
  humanFteCount: 2,
  humanWeeklyHours: 40,

  // Operating costs per unit (monthly)
  energyCostMonthly: 45,
  maintenanceCostMonthly: 200,
  partsCostMonthly: 100,
  softwareCostMonthly: 150,
  insuranceCostMonthly: 100,

  // Capital cost additions
  customizationCost: 2000,
  chargingStationCost: 1500,
  safetySystemsCost: 1000,
  installationCost: 500,

  // Depreciation
  depreciationYears: 5,
};

// Helper function to get platform by ID
export function getPlatformById(id: string): HumanoidPlatform | undefined {
  return HUMANOID_PLATFORMS.find((p) => p.id === id);
}

// Helper function to get task by ID
export function getTaskById(id: string): TaskDefinition | undefined {
  return TASK_DEFINITIONS.find((t) => t.id === id);
}

// Helper function to get tasks by category
export function getTasksByCategory(category: TaskCategory): TaskDefinition[] {
  return TASK_DEFINITIONS.filter((t) => t.category === category);
}

// Helper function to check if platform can perform task
export function canPerformTask(
  platform: HumanoidPlatform,
  task: TaskDefinition
): boolean {
  return task.requiredCapabilities.every((cap) => {
    return platform.capabilities[cap] >= task.minCapabilityScore;
  });
}

// Helper function to get capability score for a task
export function getTaskCapabilityScore(
  platform: HumanoidPlatform,
  task: TaskDefinition
): number {
  if (task.requiredCapabilities.length === 0) return 10;

  const scores = task.requiredCapabilities.map(
    (cap) => platform.capabilities[cap]
  );
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
