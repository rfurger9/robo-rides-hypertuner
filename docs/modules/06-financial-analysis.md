# Module 6: Financial Analysis

> **Status:** Complete | **Progress:** 100%

## Overview

Aggregates all costs and revenues to produce financial projections, break-even analysis, and scenario comparisons.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Cost Aggregation | Complete | Vehicle, energy, solar, platform costs |
| Revenue Calculation | Complete | From pricing model and utilization |
| Break-Even Analysis | Complete | Months to profitability |
| Scenario Comparison | Complete | Vehicles Only vs. Vehicles + Solar |
| Total Investment | Complete | Upfront capital tracking |
| Monthly Projections | Complete | 60-month forecast |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/calculations/financialAnalysis.ts` | Core financial calculations |
| `src/components/layout/Dashboard.tsx` | KPI display |
| `src/components/charts/BreakEvenChart.tsx` | ROI visualization |
| `src/components/charts/ScenarioTable.tsx` | Comparison table |
| `src/types/financial.ts` | TypeScript type definitions |

---

## Dashboard KPIs

| KPI | Description |
|-----|-------------|
| Monthly Revenue | Gross revenue from operations |
| Monthly Costs | Total operating expenses |
| Monthly Profit | Revenue - Costs |
| Break-Even | Months until cumulative profit > 0 |
| Fleet Size | Number of vehicles |
| Solar Capacity | Installed kW (if enabled) |

---

## Cost Components

### Vehicle Costs (Monthly)
```typescript
{
  depreciation: number      // Vehicle value / lifespan
  financing: number         // Loan/lease payments
  insurance: number         // Per-vehicle insurance
  maintenance: number       // Per-mile * miles driven
  cleaning: number          // Weekly cleaning cost
  connectivity: number      // Data plans
  software: number          // Autonomy subscriptions
  parking: number           // Permits/fees
  registration: number      // Annual / 12
}
```

### Energy Costs (Monthly)
```typescript
{
  gridElectricity: number   // Import costs
  netMeteringCredit: number // Export credits (negative)
  netEnergyCost: number     // Grid - credits
}
```

### Solar Costs (Monthly)
```typescript
{
  amortizedSystemCost: number // Net cost / lifespan
  maintenance: number         // Panel cleaning, monitoring
}
```

### Platform Costs (Monthly)
```typescript
{
  platformFees: number      // % of revenue
  paymentProcessing: number // Credit card fees
  customerSupport: number   // Support costs
}
```

---

## Calculations

### Total Monthly Costs
```
vehicleCosts + energyCosts + solarCosts + platformCosts
```

### Monthly Profit
```
monthlyRevenue - totalMonthlyCosts
```

### Total Investment
```
vehicleCapitalCost + solarNetCost + batteryCost
```

### Break-Even Months
```
// Find month where cumulative profit > total investment
for (month = 1; month <= 60; month++) {
  cumulativeProfit += monthlyProfit
  if (cumulativeProfit >= totalInvestment) {
    return month
  }
}
return "> 60 months"
```

### ROI (Annual)
```
(annualProfit / totalInvestment) * 100
```

---

## Scenario Comparison

### Scenario 1: Vehicles Only
- No solar infrastructure
- 100% grid electricity
- Lower upfront investment
- Higher operating costs

### Scenario 2: Vehicles + Solar
- Solar installation included
- Reduced grid dependence
- Higher upfront investment
- Lower operating costs

### Comparison Metrics
| Metric | Vehicles Only | Vehicles + Solar |
|--------|---------------|------------------|
| Total Investment | $ | $ |
| Monthly Costs | $ | $ |
| Monthly Profit | $ | $ |
| Break-Even | months | months |
| 5-Year ROI | % | % |

---

## State Structure

```typescript
interface FinancialConfig {
  projectionMonths: number  // Default: 60
  discountRate: number      // For NPV calculations
  taxRate: number           // Corporate tax rate
}
```

---

## Calculations Output

```typescript
interface FinancialCalculations {
  // Investment
  totalInvestment: number
  vehicleInvestment: number
  solarInvestment: number
  batteryInvestment: number

  // Monthly
  monthlyRevenue: number
  monthlyCosts: number
  monthlyProfit: number

  // Break-even
  breakEvenMonths: number
  breakEvenDate: Date

  // Returns
  annualROI: number
  fiveYearROI: number
  npv: number
  irr: number

  // Projections
  monthlyProjections: MonthlyProjection[]
}

interface MonthlyProjection {
  month: number
  revenue: number
  costs: number
  profit: number
  cumulativeProfit: number
  cumulativeROI: number
}
```

---

## Future Enhancements

- [ ] NPV (Net Present Value) calculation
- [ ] IRR (Internal Rate of Return)
- [ ] Sensitivity analysis
- [ ] Monte Carlo simulation
- [ ] Tax implications modeling
- [ ] Investor reporting exports
- [ ] 4-scenario comparison (add Mining, Humanoids)
