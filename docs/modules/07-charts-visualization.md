# Module 7: Charts & Visualization

> **Status:** Complete | **Progress:** 100%

## Overview

Provides data visualization through interactive charts and tables for financial projections, energy generation, and scenario comparisons.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Break-Even Chart | Complete | 60-month cumulative ROI projection |
| Monthly Energy Chart | Complete | Solar generation by month |
| Scenario Table | Complete | Side-by-side comparison |
| Dashboard KPIs | Complete | Real-time metric cards |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/charts/BreakEvenChart.tsx` | ROI projection chart |
| `src/components/charts/MonthlyEnergyChart.tsx` | Energy generation chart |
| `src/components/charts/ScenarioTable.tsx` | Comparison table |
| `src/components/layout/Dashboard.tsx` | KPI cards |

---

## Chart Library

**Recharts 3.6.0** - React-based charting library

Features used:
- LineChart for time-series projections
- BarChart for monthly comparisons
- ResponsiveContainer for responsive sizing
- Custom tooltips and legends
- Animated transitions

---

## Chart Components

### 1. Break-Even Chart

**Type:** Line Chart
**Data:** 60-month projection

**Series:**
- Cumulative Revenue (green)
- Cumulative Costs (red)
- Cumulative Profit (blue)
- Break-Even Line (dashed)

**Features:**
- Highlights break-even month
- Shows ROI percentage at each point
- Zoom and pan support
- Export to PNG

### 2. Monthly Energy Chart

**Type:** Bar Chart
**Data:** 12 months

**Series:**
- Solar Production (yellow)
- Vehicle Consumption (blue)
- Grid Import (red)
- Grid Export (green)

**Features:**
- Stacked or grouped view
- Monthly/quarterly toggle
- Seasonal patterns visible

### 3. Scenario Table

**Type:** Data Table
**Data:** Scenario comparison

**Columns:**
| Metric | Vehicles Only | Vehicles + Solar | Difference |
|--------|---------------|------------------|------------|
| Investment | $ | $ | $ |
| Monthly Cost | $ | $ | $ |
| Monthly Profit | $ | $ | $ |
| Break-Even | mo | mo | mo |
| 5-Year ROI | % | % | % |

---

## Dashboard KPI Cards

### Card Layout
```
┌─────────────┬─────────────┬─────────────┐
│  Monthly    │  Monthly    │  Monthly    │
│  Revenue    │  Costs      │  Profit     │
│  $XX,XXX    │  $XX,XXX    │  $XX,XXX    │
├─────────────┼─────────────┼─────────────┤
│  Break-Even │  Fleet      │  Solar      │
│  XX months  │  XX units   │  XX kW      │
└─────────────┴─────────────┴─────────────┘
```

### Card Features
- Real-time updates on config change
- Color-coded (green/red for profit/loss)
- Sparkline trends (optional)
- Click to drill down

---

## Styling

### Color Palette
| Purpose | Color | Hex |
|---------|-------|-----|
| Revenue/Positive | Green | #10B981 |
| Costs/Negative | Red | #EF4444 |
| Neutral | Blue | #3B82F6 |
| Solar | Yellow | #F59E0B |
| Secondary | Gray | #6B7280 |

### Dark Mode Support
All charts support dark mode with:
- Inverted axis colors
- Adjusted grid lines
- Contrast-appropriate text

---

## Recharts Usage Example

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

<ResponsiveContainer width="100%" height={400}>
  <LineChart data={projectionData}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line
      type="monotone"
      dataKey="cumulativeProfit"
      stroke="#10B981"
      strokeWidth={2}
    />
    <Line
      type="monotone"
      dataKey="cumulativeCosts"
      stroke="#EF4444"
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>
```

---

## Data Flow

```
ScenarioContext (calculations)
         │
         ▼
   Chart Components
         │
    ┌────┼────┐
    ▼    ▼    ▼
 Break Monthly Scenario
 Even  Energy  Table
 Chart Chart
```

---

## Future Enhancements

- [ ] Chart export (PNG, SVG, PDF)
- [ ] Interactive drill-down
- [ ] Custom date range selection
- [ ] Comparison overlays
- [ ] Print-optimized layouts
- [ ] Animation controls
- [ ] Data table view toggle
