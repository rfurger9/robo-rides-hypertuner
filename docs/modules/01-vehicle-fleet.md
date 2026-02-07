# Module 1: Vehicle Fleet Management

> **Status:** Complete | **Progress:** 100%

## Overview

Manages the autonomous vehicle fleet configuration including vehicle selection, fleet sizing, financing options, and comprehensive cost tracking.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Vehicle Selection | Complete | Choose from pre-loaded Tesla vehicles |
| Fleet Sizing | Complete | Adjust quantity of vehicles |
| Financing Modes | Complete | Cash, Loan, or Lease options |
| Capital Costs | Complete | Purchase, taxes, AV hardware, branding, accessories |
| Operating Costs | Complete | Insurance, maintenance, cleaning, connectivity, software, parking, registration |
| Depreciation | Complete | Configurable depreciation years |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/vehicles/VehicleTab.tsx` | Main UI component for vehicle configuration |
| `src/calculations/vehicleCosts.ts` | Cost calculation logic |
| `src/types/vehicle.ts` | TypeScript type definitions |
| `src/app/api/vehicles/route.ts` | Vehicle database API |
| `prisma/seed.ts` | Default vehicle data seeding |

---

## Data Model

### Vehicle (Database)
```typescript
{
  id: string           // UUID primary key
  vehicleKey: string   // Unique identifier (e.g., "tesla_model3_lr")
  displayName: string  // Display name
  manufacturer: string // Manufacturer name
  msrp: number         // Base price
  batteryKwh: number   // Battery capacity
  efficiencyMiPerKwh: number // Miles per kWh
  rangeMiles: number   // Total range
  modelYear: number    // Model year
  isDefault: boolean   // Show by default
}
```

### VehicleConfig (State)
```typescript
{
  vehicleKey: string
  displayName: string
  msrp: number
  batteryKwh: number
  efficiencyMiPerKwh: number
  rangeMiles: number
}
```

---

## Pre-loaded Vehicles

| Vehicle | MSRP | Battery | Efficiency | Range |
|---------|------|---------|------------|-------|
| Tesla Model 3 Long Range | $47,490 | 82 kWh | 4.0 mi/kWh | 333 mi |
| Tesla Model Y Long Range | $50,490 | 82 kWh | 3.5 mi/kWh | 310 mi |
| Tesla Cybertruck | $79,990 | 123 kWh | 2.5 mi/kWh | 340 mi |

---

## Calculations

### Capital Costs
- Base MSRP
- Sales tax (configurable %)
- AV hardware package
- Fleet branding/wrap
- Accessories

### Operating Costs (Monthly)
- Insurance per vehicle
- Maintenance per mile
- Cleaning per week
- Connectivity/data
- Software subscriptions
- Parking permits
- Registration/licensing

### Depreciation
- Configurable lifespan (default: 5 years)
- Straight-line depreciation method

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vehicles` | GET | List all vehicles |
| `/api/vehicles` | POST | Add new vehicle |
| `/api/vehicles/[id]` | GET | Get single vehicle |
| `/api/vehicles/[id]` | PUT | Update vehicle |
| `/api/vehicles/[id]` | DELETE | Remove vehicle |

---

## Future Enhancements

- [ ] Add more vehicle manufacturers (Waymo, Cruise, etc.)
- [ ] Import vehicle data from external APIs
- [ ] Custom vehicle entry form
- [ ] Vehicle comparison view
- [ ] Fleet optimization suggestions
