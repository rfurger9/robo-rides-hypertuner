# Module 5: Battery Storage

> **Status:** Complete | **Progress:** 100%

## Overview

Configures stationary battery storage systems for energy arbitrage, self-consumption optimization, and backup power.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Battery Presets | Complete | Tesla Powerwall 3 and others |
| Custom Configuration | Complete | Manual capacity/power entry |
| Quantity Scaling | Complete | Multiple units |
| Round-Trip Efficiency | Complete | Energy loss modeling |
| Self-Consumption Strategy | Complete | Maximize solar usage |
| TOU Arbitrage Strategy | Complete | Buy low, sell high |
| Cost Amortization | Complete | 10-year lifespan calculation |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/battery/BatteryTab.tsx` | Battery configuration UI |
| `src/types/battery.ts` | TypeScript type definitions |

---

## Battery Presets

### Tesla Powerwall 3
| Specification | Value |
|---------------|-------|
| Usable Capacity | 13.5 kWh |
| Continuous Power | 11.5 kW |
| Peak Power | 30 kW |
| Round-Trip Efficiency | 90% |
| Warranty | 10 years |
| Cost | $9,200 |

### Custom Battery
Users can configure:
- Capacity (kWh)
- Power output (kW)
- Efficiency (%)
- Cost ($)

---

## Storage Strategies

### 1. Self-Consumption
Maximize use of self-generated solar power.

**Logic:**
1. Solar production charges battery during day
2. Battery discharges to meet evening demand
3. Reduces grid import

**Best For:**
- High solar production
- Net metering with low export rates
- Energy independence goals

### 2. TOU Arbitrage
Exploit time-of-use rate differentials.

**Logic:**
1. Charge during super off-peak (lowest rates)
2. Discharge during peak (highest rates)
3. Profit from rate spread

**Best For:**
- Large TOU rate differentials
- Limited solar production
- Revenue maximization

---

## Calculations

### Total Storage Capacity
```
batteryCapacityKwh * quantity
```

### Effective Capacity (accounting for efficiency)
```
totalCapacity * roundTripEfficiency
```

### Daily Cycle Value (Arbitrage)
```
effectiveCapacity * (peakRate - superOffPeakRate)
```

### Monthly Arbitrage Value
```
dailyCycleValue * operatingDays
```

### Amortized Monthly Cost
```
(totalBatteryCost) / (lifespanYears * 12)
```

### Net Monthly Benefit
```
monthlyArbitrageValue - amortizedMonthlyCost
```

---

## State Structure

```typescript
interface BatteryConfig {
  enabled: boolean

  // Hardware
  preset: 'powerwall3' | 'custom'
  capacityKwh: number
  powerKw: number
  quantity: number
  roundTripEfficiency: number

  // Economics
  unitCost: number
  lifespanYears: number

  // Strategy
  strategy: 'selfConsumption' | 'touArbitrage'
}
```

---

## Calculations Output

```typescript
interface BatteryCalculations {
  // Capacity
  totalCapacityKwh: number
  effectiveCapacityKwh: number
  totalPowerKw: number

  // Economics
  totalCost: number
  amortizedMonthlyCost: number

  // Value
  dailyCycleValue: number
  monthlyCycleValue: number
  netMonthlyBenefit: number

  // Metrics
  cyclesPerDay: number
  annualCycles: number
  paybackMonths: number
}
```

---

## Integration Points

| Module | Integration |
|--------|-------------|
| Solar | Battery stores excess production |
| Energy Economics | Uses TOU rates for arbitrage |
| Financial Analysis | Includes battery costs and savings |

---

## Future Enhancements

- [ ] More battery presets (LG, Enphase, etc.)
- [ ] Battery degradation modeling
- [ ] Optimal sizing recommendations
- [ ] Grid services revenue (demand response)
- [ ] Backup power duration calculator
- [ ] Vehicle-to-grid (V2G) integration
