import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultVehicles = [
  {
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

const defaultMiners = [
  // ASIC Miners
  {
    minerKey: "antminer_s21_hyd",
    displayName: "Bitmain Antminer S21 Hyd",
    manufacturer: "Bitmain",
    minerType: "asic",
    algorithm: "sha256",
    hashRate: 335,
    hashRateUnit: "TH/s",
    powerWatts: 5360,
    efficiencyJTh: 16.0,
    msrpUsd: 5500,
    noiseDb: 50,
    coolingType: "hydro",
    isDefault: false,
  },
  {
    minerKey: "antminer_s21",
    displayName: "Bitmain Antminer S21",
    manufacturer: "Bitmain",
    minerType: "asic",
    algorithm: "sha256",
    hashRate: 200,
    hashRateUnit: "TH/s",
    powerWatts: 3500,
    efficiencyJTh: 17.5,
    msrpUsd: 4500,
    noiseDb: 75,
    coolingType: "air",
    isDefault: true,
  },
  {
    minerKey: "antminer_s19_xp",
    displayName: "Bitmain Antminer S19 XP",
    manufacturer: "Bitmain",
    minerType: "asic",
    algorithm: "sha256",
    hashRate: 140,
    hashRateUnit: "TH/s",
    powerWatts: 3010,
    efficiencyJTh: 21.5,
    msrpUsd: 3200,
    noiseDb: 75,
    coolingType: "air",
    isDefault: false,
  },
  {
    minerKey: "whatsminer_m50s",
    displayName: "MicroBT Whatsminer M50S",
    manufacturer: "MicroBT",
    minerType: "asic",
    algorithm: "sha256",
    hashRate: 126,
    hashRateUnit: "TH/s",
    powerWatts: 3276,
    efficiencyJTh: 26.0,
    msrpUsd: 2800,
    noiseDb: 75,
    coolingType: "air",
    isDefault: false,
  },
  {
    minerKey: "antminer_l7",
    displayName: "Bitmain Antminer L7",
    manufacturer: "Bitmain",
    minerType: "asic",
    algorithm: "scrypt",
    hashRate: 9.5,
    hashRateUnit: "GH/s",
    powerWatts: 3425,
    efficiencyJTh: 360,
    msrpUsd: 8000,
    noiseDb: 75,
    coolingType: "air",
    isDefault: false,
  },
  // GPU Miners
  {
    minerKey: "rtx_4090",
    displayName: "NVIDIA RTX 4090",
    manufacturer: "NVIDIA",
    minerType: "gpu",
    algorithm: "kawpow",
    hashRate: 58,
    hashRateUnit: "MH/s",
    powerWatts: 350,
    vramGb: 24,
    msrpUsd: 1800,
    isDefault: true,
  },
  {
    minerKey: "rtx_4070ti",
    displayName: "NVIDIA RTX 4070 Ti",
    manufacturer: "NVIDIA",
    minerType: "gpu",
    algorithm: "kawpow",
    hashRate: 35,
    hashRateUnit: "MH/s",
    powerWatts: 220,
    vramGb: 12,
    msrpUsd: 800,
    isDefault: false,
  },
  {
    minerKey: "rtx_3080",
    displayName: "NVIDIA RTX 3080",
    manufacturer: "NVIDIA",
    minerType: "gpu",
    algorithm: "kawpow",
    hashRate: 28,
    hashRateUnit: "MH/s",
    powerWatts: 280,
    vramGb: 10,
    msrpUsd: 500,
    isDefault: false,
  },
  {
    minerKey: "rx_7900xtx",
    displayName: "AMD Radeon RX 7900 XTX",
    manufacturer: "AMD",
    minerType: "gpu",
    algorithm: "kawpow",
    hashRate: 32,
    hashRateUnit: "MH/s",
    powerWatts: 355,
    vramGb: 24,
    msrpUsd: 1000,
    isDefault: false,
  },
];

const defaultHumanoidPlatforms = [
  {
    platformKey: "tesla_optimus",
    displayName: "Tesla Optimus Gen 2",
    manufacturer: "Tesla",
    heightCm: 173,
    weightKg: 57,
    payloadCapacityKg: 20,
    batteryKwh: 2.3,
    runtimeHours: 5.0,
    chargeTimeHours: 2.0,
    walkingSpeedKph: 5.0,
    estimatedMsrp: 25000,
    monthlyLeaseEstimate: 800,
    availability: "2025-2026",
    capabilities: JSON.stringify({
      fineManipulation: 8,
      heavyLifting: 7,
      mobility: 6,
      outdoorOperation: 7,
      vehicleInterior: 8,
      chargingOps: 9,
      humanInteraction: 7,
      runtimeEfficiency: 8,
    }),
    isDefault: true,
  },
  {
    platformKey: "figure_02",
    displayName: "Figure 02",
    manufacturer: "Figure AI",
    heightCm: 170,
    weightKg: 60,
    payloadCapacityKg: 25,
    batteryKwh: 2.0,
    runtimeHours: 5.0,
    chargeTimeHours: 2.0,
    walkingSpeedKph: 4.5,
    estimatedMsrp: 50000,
    monthlyLeaseEstimate: 1500,
    availability: "2025",
    capabilities: JSON.stringify({
      fineManipulation: 9,
      heavyLifting: 8,
      mobility: 7,
      outdoorOperation: 6,
      vehicleInterior: 9,
      chargingOps: 8,
      humanInteraction: 8,
      runtimeEfficiency: 7,
    }),
    isDefault: false,
  },
  {
    platformKey: "1x_neo",
    displayName: "1X Neo",
    manufacturer: "1X Technologies",
    heightCm: 165,
    weightKg: 30,
    payloadCapacityKg: 15,
    batteryKwh: 1.5,
    runtimeHours: 4.0,
    chargeTimeHours: 1.5,
    walkingSpeedKph: 4.0,
    estimatedMsrp: 30000,
    monthlyLeaseEstimate: 950,
    availability: "2025",
    capabilities: JSON.stringify({
      fineManipulation: 7,
      heavyLifting: 5,
      mobility: 8,
      outdoorOperation: 7,
      vehicleInterior: 7,
      chargingOps: 7,
      humanInteraction: 8,
      runtimeEfficiency: 8,
    }),
    isDefault: false,
  },
  {
    platformKey: "agility_digit",
    displayName: "Agility Digit",
    manufacturer: "Agility Robotics",
    heightCm: 175,
    weightKg: 65,
    payloadCapacityKg: 35,
    batteryKwh: 2.5,
    runtimeHours: 4.0,
    chargeTimeHours: 2.5,
    walkingSpeedKph: 5.5,
    estimatedMsrp: 40000,
    monthlyLeaseEstimate: 1200,
    availability: "Available",
    capabilities: JSON.stringify({
      fineManipulation: 5,
      heavyLifting: 9,
      mobility: 8,
      outdoorOperation: 8,
      vehicleInterior: 5,
      chargingOps: 8,
      humanInteraction: 6,
      runtimeEfficiency: 6,
    }),
    isDefault: false,
  },
  {
    platformKey: "unitree_h1",
    displayName: "Unitree H1",
    manufacturer: "Unitree Robotics",
    heightCm: 180,
    weightKg: 47,
    payloadCapacityKg: 10,
    batteryKwh: 1.8,
    runtimeHours: 3.0,
    chargeTimeHours: 2.0,
    walkingSpeedKph: 6.0,
    estimatedMsrp: 90000,
    monthlyLeaseEstimate: 2500,
    availability: "Available",
    capabilities: JSON.stringify({
      fineManipulation: 5,
      heavyLifting: 4,
      mobility: 9,
      outdoorOperation: 8,
      vehicleInterior: 4,
      chargingOps: 5,
      humanInteraction: 5,
      runtimeEfficiency: 5,
    }),
    isDefault: false,
  },
];

async function main() {
  console.log("Seeding database...");

  // Seed vehicles
  for (const vehicle of defaultVehicles) {
    await prisma.vehicle.upsert({
      where: { vehicleKey: vehicle.vehicleKey },
      update: vehicle,
      create: vehicle,
    });
    console.log(`Upserted vehicle: ${vehicle.displayName}`);
  }

  // Seed miners
  for (const miner of defaultMiners) {
    await prisma.miner.upsert({
      where: { minerKey: miner.minerKey },
      update: miner,
      create: miner,
    });
    console.log(`Upserted miner: ${miner.displayName}`);
  }

  // Seed humanoid platforms
  for (const platform of defaultHumanoidPlatforms) {
    await prisma.humanoidPlatform.upsert({
      where: { platformKey: platform.platformKey },
      update: platform,
      create: platform,
    });
    console.log(`Upserted humanoid platform: ${platform.displayName}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
