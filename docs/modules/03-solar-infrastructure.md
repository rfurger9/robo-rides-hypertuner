# Module 3: Solar Infrastructure

> **Status:** Complete | **Progress:** 95%

## Overview

Configures solar panel installations for fleet charging, integrates with NREL PVWatts API for production estimates, and includes a Google Maps-based roof mapping tool.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Solar Toggle | Complete | Enable/disable solar in calculations |
| System Sizing | Complete | Configure system size in kW |
| Production Estimates | Complete | Annual/monthly kWh output |
| Roof Mapping | Partial | Google Maps polygon drawing |
| Address Geocoding | Complete | Google Maps API integration |
| PVWatts Integration | Complete | NREL API with mock fallback |
| Cost Modeling | Complete | Per-watt pricing, incentives |
| Federal ITC | Complete | 30% Investment Tax Credit |
| State Rebates | Complete | Configurable state incentives |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/solar/SolarTab.tsx` | Main solar configuration UI |
| `src/components/solar/RoofMapper.tsx` | Google Maps roof drawing tool |
| `src/app/api/pvwatts/route.ts` | PVWatts API proxy |
| `src/services/pvwatts.ts` | PVWatts service layer |
| `src/services/geocoding.ts` | Google Maps geocoding |
| `src/types/solar.ts` | TypeScript type definitions |

---

## Configuration Options

### System Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| System Size | 50 kW | Total installed capacity |
| Module Type | Standard | Panel technology (Standard/Premium/Thin Film) |
| Array Type | Fixed (Roof) | Mounting type |
| Tilt | 20° | Panel tilt angle |
| Azimuth | 180° | Panel orientation (180° = South) |
| System Losses | 14% | Wiring, inverter, soiling losses |

### Cost Parameters
| Parameter | Default | Description |
|-----------|---------|-------------|
| Cost per Watt | $2.50 | Installed cost |
| Federal ITC | 30% | Federal tax credit |
| State Rebate | $0 | State/local incentives |
| Permit Costs | $500 | Permitting fees |

---

## PVWatts API Integration

### Request Parameters
```typescript
{
  system_capacity: number  // kW
  module_type: 0 | 1 | 2   // Standard, Premium, Thin Film
  losses: number           // System losses %
  array_type: 0-4          // Fixed, 1-axis, 2-axis tracking
  tilt: number             // Degrees
  azimuth: number          // Degrees (180 = South)
  lat: number              // Latitude
  lon: number              // Longitude
}
```

### Response Data
```typescript
{
  ac_annual: number        // Annual AC output (kWh)
  ac_monthly: number[]     // 12 monthly values
  solrad_annual: number    // Solar radiation (kWh/m²/day)
  capacity_factor: number  // System efficiency %
}
```

### Fallback Behavior
When `NREL_API_KEY` is not configured, the system uses mock data based on:
- Average US solar radiation
- System size and losses
- Seasonal variation curves

---

## Calculations

### Gross System Cost
```
systemSizeKw * 1000 * costPerWatt + permitCosts
```

### Net System Cost (after incentives)
```
grossCost - (grossCost * federalITC) - stateRebate
```

### Monthly Production Estimate
```
annualProduction / 12  // Simplified
// Or use PVWatts monthly array for accuracy
```

### Solar Value (monthly)
```
monthlyProduction * electricityRate
```

---

## State Structure

```typescript
interface SolarConfig {
  enabled: boolean
  systemSizeKw: number

  // Technical
  moduleType: 'standard' | 'premium' | 'thinFilm'
  arrayType: 'fixed' | 'oneAxis' | 'twoAxis'
  tilt: number
  azimuth: number
  systemLosses: number

  // Location
  latitude: number
  longitude: number
  address: string

  // Costs
  costPerWatt: number
  federalITC: number
  stateRebate: number
  permitCosts: number

  // Production (from PVWatts)
  annualProductionKwh: number
  monthlyProductionKwh: number[]
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NREL_API_KEY` | No | PVWatts API key (uses mock if missing) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Google Maps for roof mapping |

---

## Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| PVWatts requires API key | Medium | Mock data fallback active |
| Roof polygon drawing incomplete | Low | Manual system size entry |

---

## Future Enhancements

- [ ] Complete roof polygon area calculation
- [ ] Automatic system sizing from roof area
- [ ] Shading analysis integration
- [ ] Multiple roof section support
- [ ] Solar panel layout visualization
- [ ] Historical weather data integration
- [ ] Degradation modeling (0.5%/year)
