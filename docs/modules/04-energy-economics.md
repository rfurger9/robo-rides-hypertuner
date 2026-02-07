# Module 4: Energy Economics

> **Status:** Complete | **Progress:** 100%

## Overview

Models electricity costs and revenue through rate structures, time-of-use optimization, and net metering configurations.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Flat-Rate Pricing | Complete | Simple $/kWh rate |
| Time-of-Use (TOU) | Complete | Peak/off-peak/super-off-peak rates |
| Net Metering | Complete | Export credits and true-up |
| Energy Balance | Complete | Vehicle consumption vs. solar production |
| Grid Import/Export | Complete | Track grid interactions |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/energy/EnergyTab.tsx` | Energy economics UI |
| `src/calculations/energyBalance.ts` | Energy balance calculations |
| `src/types/energy.ts` | TypeScript type definitions |

---

## Rate Structures

### Flat-Rate
```typescript
{
  type: 'flat'
  rate: number  // $/kWh (default: $0.15)
}
```

### Time-of-Use (TOU)
```typescript
{
  type: 'tou'
  peakRate: number       // $/kWh (default: $0.35)
  offPeakRate: number    // $/kWh (default: $0.12)
  superOffPeakRate: number // $/kWh (default: $0.08)

  peakHours: [number, number]      // [16, 21] = 4pm-9pm
  offPeakHours: [number, number]   // [9, 16] = 9am-4pm
  superOffPeakHours: [number, number] // [0, 9] = 12am-9am
}
```

---

## Net Metering Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| Export Rate | 75% of retail | Credit for exported power |
| Annual True-Up | Yes | Yearly settlement of credits |
| Rollover Credits | Yes | Unused credits carry forward |

---

## Energy Balance Calculations

### Vehicle Energy Need (Monthly)
```
fleetSize * dailyMiles * operatingDays / efficiencyMiPerKwh
```

### Daily Miles per Vehicle
```
tripsPerDay * avgTripMiles * (1 + deadheadPercent)
```

### Grid Import (when solar < need)
```
max(0, vehicleEnergyNeed - solarProduction)
```

### Grid Export (when solar > need)
```
max(0, solarProduction - vehicleEnergyNeed)
```

### Net Energy Cost
```
(gridImport * importRate) - (gridExport * exportRate)
```

---

## TOU Optimization

The system assumes optimal charging behavior:
- **Super Off-Peak (12am-9am):** Primary charging window
- **Off-Peak (9am-4pm):** Secondary charging, solar production peak
- **Peak (4pm-9pm):** Avoid charging, maximize solar export

### Charging Distribution (Default)
| Period | Charging % | Rationale |
|--------|------------|-----------|
| Super Off-Peak | 60% | Lowest rates |
| Off-Peak | 35% | Solar supplements |
| Peak | 5% | Emergency only |

---

## State Structure

```typescript
interface EnergyConfig {
  rateStructure: 'flat' | 'tou'

  // Flat rate
  flatRate: number

  // TOU rates
  peakRate: number
  offPeakRate: number
  superOffPeakRate: number

  // TOU schedule
  peakStart: number
  peakEnd: number
  offPeakStart: number
  offPeakEnd: number

  // Net metering
  netMeteringEnabled: boolean
  exportRatePercent: number
  annualTrueUp: boolean
}
```

---

## Calculations Output

```typescript
interface EnergyCalculations {
  // Consumption
  dailyVehicleKwh: number
  monthlyVehicleKwh: number

  // Solar
  monthlySolarKwh: number

  // Grid interaction
  monthlyGridImportKwh: number
  monthlyGridExportKwh: number

  // Costs
  monthlyEnergyCost: number
  monthlyExportCredit: number
  netEnergyCost: number

  // Metrics
  solarCoveragePercent: number
  gridDependencePercent: number
}
```

---

## Future Enhancements

- [ ] Demand charge modeling
- [ ] Real utility rate imports (OpenEI API)
- [ ] EV charging rate schedules
- [ ] Dynamic rate optimization
- [ ] Carbon intensity tracking
- [ ] Renewable energy certificates (RECs)
