# Module 2: Revenue Modeling

> **Status:** Complete | **Progress:** 100%

## Overview

Models revenue generation through multiple pricing strategies, utilization parameters, and platform fee structures.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Ride-Hail Pricing | Complete | Per-mile + per-minute + base fare |
| Flat-Rate Pricing | Complete | Fixed price per trip |
| Subscription Pricing | Complete | Monthly subscription model |
| Utilization Parameters | Complete | Hours, trips/hour, operating days, deadhead % |
| Platform Selection | Complete | Own Platform, Hybrid, Marketplace options |
| Trip Calculations | Complete | Daily/monthly trip aggregation |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/revenue/RevenueTab.tsx` | Main UI for revenue configuration |
| `src/calculations/revenueModel.ts` | Revenue calculation logic |
| `src/types/revenue.ts` | TypeScript type definitions |

---

## Pricing Models

### 1. Ride-Hail
```typescript
{
  baseFare: number      // Starting fare (default: $2.50)
  perMile: number       // Rate per mile (default: $1.50)
  perMinute: number     // Rate per minute (default: $0.30)
  avgTripMiles: number  // Average trip distance
  avgTripMinutes: number // Average trip duration
}
```

**Revenue per trip:** `baseFare + (perMile * avgTripMiles) + (perMinute * avgTripMinutes)`

### 2. Flat-Rate
```typescript
{
  flatRate: number      // Fixed price per trip (default: $15.00)
}
```

**Revenue per trip:** `flatRate`

### 3. Subscription
```typescript
{
  monthlyFee: number    // Monthly subscription (default: $299)
  includedTrips: number // Trips included (default: 30)
  overageFee: number    // Fee for extra trips (default: $10)
}
```

**Revenue per subscriber:** `monthlyFee + (excessTrips * overageFee)`

---

## Utilization Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| Operating Hours/Day | 16 | Hours vehicle operates daily |
| Trips per Hour | 2.5 | Average trips completed per hour |
| Operating Days/Month | 26 | Days per month in service |
| Deadhead Percentage | 15% | Non-revenue miles (repositioning) |

---

## Platform Options

| Platform | Fee | Description |
|----------|-----|-------------|
| Own Platform | 0% | Direct customer relationships |
| Hybrid | 15% | Mix of own and marketplace |
| Marketplace | 25% | Third-party platform (Uber, Lyft) |

---

## Calculations

### Daily Trips per Vehicle
```
operatingHours * tripsPerHour
```

### Monthly Trips per Vehicle
```
dailyTrips * operatingDays
```

### Gross Revenue
```
monthlyTrips * fleetSize * revenuePerTrip
```

### Net Revenue (after platform fees)
```
grossRevenue * (1 - platformFeePercent)
```

### Effective Miles per Trip
```
avgTripMiles * (1 + deadheadPercent)
```

---

## State Structure

```typescript
interface RevenueConfig {
  pricingModel: 'rideHail' | 'flatRate' | 'subscription'

  // Ride-hail specific
  baseFare: number
  perMile: number
  perMinute: number
  avgTripMiles: number
  avgTripMinutes: number

  // Flat-rate specific
  flatRate: number

  // Subscription specific
  monthlyFee: number
  includedTrips: number
  overageFee: number

  // Utilization
  operatingHoursPerDay: number
  tripsPerHour: number
  operatingDaysPerMonth: number
  deadheadPercent: number

  // Platform
  platformType: 'own' | 'hybrid' | 'marketplace'
  platformFeePercent: number
}
```

---

## Future Enhancements

- [ ] Dynamic pricing based on demand
- [ ] Surge pricing simulation
- [ ] Geographic zone pricing
- [ ] Airport/special venue rates
- [ ] Corporate account pricing
- [ ] Seasonal demand modeling
