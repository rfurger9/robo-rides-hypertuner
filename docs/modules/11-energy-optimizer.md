# Module 11: Energy Optimizer

> **Status:** Not Started | **Progress:** 0%

## Overview

Real-time energy allocation system that optimizes the distribution of solar power, battery storage, and grid electricity across fleet charging, facility operations, and cryptocurrency mining.

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Allocation Engine | Not Started | Priority-based distribution |
| Dispatch Scheduler | Not Started | Optimal timing decisions |
| Battery Arbitrage | Not Started | Automated buy/sell logic |
| Real-time Dashboard | Not Started | Live energy flow visualization |
| Optimization UI | Not Started | Configuration interface |
| Forecasting | Not Started | Predict demand and generation |

---

## Planned Features

### Energy Sources
1. **Solar Production** - On-site generation
2. **Battery Storage** - Stored energy
3. **Grid Import** - Utility power (variable rates)

### Energy Consumers
1. **Fleet Charging** - Primary vehicle charging
2. **Facility Operations** - Building HVAC, lighting
3. **Crypto Mining** - Opportunistic mining
4. **Battery Charging** - Store for later use
5. **Grid Export** - Sell excess power

---

## Optimization Logic

### Priority Levels (Configurable)

| Priority | Consumer | Rationale |
|----------|----------|-----------|
| 1 | Fleet Charging (Critical) | Vehicles needed for service |
| 2 | Facility Operations | Basic operations |
| 3 | Battery Charging | Store excess |
| 4 | Crypto Mining | Use surplus |
| 5 | Grid Export | Monetize excess |

### Allocation Algorithm

```typescript
function allocateEnergy(
  available: EnergySource[],
  consumers: EnergyConsumer[],
  touPeriod: 'peak' | 'offPeak' | 'superOffPeak'
): AllocationPlan {

  // Sort consumers by priority
  const sorted = consumers.sort((a, b) => a.priority - b.priority)

  // Allocate in priority order
  let remaining = totalAvailable
  const allocations = []

  for (const consumer of sorted) {
    const allocated = Math.min(consumer.demand, remaining)
    allocations.push({ consumer, allocated })
    remaining -= allocated
  }

  // Handle excess
  if (remaining > 0) {
    allocations.push({ consumer: 'gridExport', allocated: remaining })
  }

  return { allocations, touPeriod }
}
```

---

## Dispatch Scheduling

### Time-Based Rules

| Period | Solar | Battery | Grid | Action |
|--------|-------|---------|------|--------|
| Super Off-Peak (12am-9am) | Low | Charge | Cheap | Heavy grid use, charge battery |
| Off-Peak (9am-4pm) | High | Hold | Medium | Use solar, store excess |
| Peak (4pm-9pm) | Declining | Discharge | Expensive | Use battery, export solar |

### Vehicle Charging Schedule

```typescript
interface ChargingSchedule {
  vehicleId: string
  targetSoC: number        // Target state of charge
  departureTime: Date
  preferredWindow: TimeWindow
  actualWindow: TimeWindow  // After optimization
}
```

### Optimization Goals
1. Minimize grid costs
2. Maximize solar self-consumption
3. Avoid peak grid usage
4. Maintain fleet readiness
5. Maximize export revenue

---

## Battery Arbitrage Automation

### Strategy: Buy Low, Sell High

```typescript
interface ArbitrageRule {
  chargeWhen: {
    touPeriod: 'superOffPeak'
    maxRate: number         // $/kWh
    solarExcess: boolean
  }
  dischargeWhen: {
    touPeriod: 'peak'
    minRate: number         // $/kWh
    fleetNeed: boolean
  }
}
```

### Daily Arbitrage Cycle
1. **12am-6am:** Charge battery from grid (super off-peak)
2. **6am-4pm:** Hold, top up from solar
3. **4pm-9pm:** Discharge to fleet/facility (avoid peak grid)
4. **9pm-12am:** Prepare for next cycle

---

## Planned Data Model

### EnergyOptimizationConfig (State)
```typescript
{
  enabled: boolean

  // Priorities (1-5, lower = higher priority)
  priorities: {
    fleetCharging: number
    facilityOps: number
    batteryCharging: number
    cryptoMining: number
    gridExport: number
  }

  // Constraints
  minFleetSoC: number       // Minimum vehicle charge %
  maxGridImport: number     // kW limit
  reserveBattery: number    // % reserved for backup

  // Automation
  autoArbitrage: boolean
  autoMining: boolean
  autoExport: boolean
}
```

### AllocationPlan
```typescript
{
  timestamp: Date
  period: 'superOffPeak' | 'offPeak' | 'peak'

  sources: {
    solar: number           // kW available
    battery: number         // kW available
    grid: number            // kW available
  }

  allocations: {
    fleetCharging: number
    facilityOps: number
    batteryCharging: number
    cryptoMining: number
    gridExport: number
  }

  costs: {
    gridCost: number
    exportRevenue: number
    netCost: number
  }
}
```

---

## Real-Time Dashboard

### Energy Flow Diagram
```
     ┌─────────────────────────────────────────────────┐
     │                  ENERGY OPTIMIZER                │
     └─────────────────────────────────────────────────┘

     SOURCES                              CONSUMERS
     ───────                              ─────────
  ┌─────────┐                          ┌─────────────┐
  │  SOLAR  │ ────────┐    ┌────────── │ FLEET CHRG  │
  │  45 kW  │         │    │           │   35 kW     │
  └─────────┘         │    │           └─────────────┘
                      ▼    ▼
  ┌─────────┐    ┌─────────────┐       ┌─────────────┐
  │ BATTERY │ ◄──│  OPTIMIZER  │ ────► │  FACILITY   │
  │  13 kWh │    │             │       │    5 kW     │
  └─────────┘    └─────────────┘       └─────────────┘
                      ▲    │
  ┌─────────┐         │    │           ┌─────────────┐
  │  GRID   │ ────────┘    └────────── │   MINING    │
  │  0 kW   │                          │    5 kW     │
  └─────────┘                          └─────────────┘
```

### Metrics Display
- Real-time power flow (kW)
- Energy totals (kWh today/month)
- Cost savings vs. baseline
- Optimization efficiency %

---

## Key Files (To Create)

| File | Purpose |
|------|---------|
| `src/components/optimizer/OptimizerTab.tsx` | Main UI |
| `src/components/optimizer/EnergyFlowDiagram.tsx` | Visual flow |
| `src/components/optimizer/PriorityConfig.tsx` | Priority settings |
| `src/calculations/energyOptimizer.ts` | Allocation engine |
| `src/calculations/dispatchScheduler.ts` | Scheduling logic |
| `src/types/optimizer.ts` | TypeScript definitions |

---

## Integration Points

| Module | Integration |
|--------|-------------|
| Solar | Production input |
| Battery | Storage management |
| Energy Economics | Rate structures |
| Mining | Mining allocation |
| Vehicle Fleet | Charging requirements |
| Financial Analysis | Optimization savings |

---

## Implementation Steps

1. [ ] Define optimizer types
2. [ ] Implement allocation engine
3. [ ] Build dispatch scheduler
4. [ ] Create priority configuration UI
5. [ ] Build energy flow diagram
6. [ ] Implement arbitrage automation
7. [ ] Add to ScenarioContext
8. [ ] Create real-time simulation
9. [ ] Integrate with all consumers
10. [ ] Add optimization metrics
11. [ ] Test edge cases

---

## Advanced Features (Future)

- [ ] Machine learning demand prediction
- [ ] Weather-based solar forecasting
- [ ] Dynamic priority adjustment
- [ ] Multi-site optimization
- [ ] Grid services (demand response)
- [ ] Virtual power plant participation
- [ ] Carbon intensity optimization
