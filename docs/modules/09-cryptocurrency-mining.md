# Module 9: Cryptocurrency Mining

> **Status:** Complete | **Progress:** 100%

## Overview

Models cryptocurrency mining operations using excess solar energy, including ASIC and GPU miners, profitability calculations, and integration with crypto price APIs.

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Mining Hardware Database | Complete | ASIC and GPU specs in types |
| Profitability Calculator | Complete | BTC/altcoin revenue calculations |
| Energy Integration | Complete | Strategy-based mining |
| Crypto Price API | Complete | CoinGecko + Mempool.space |
| Mining UI | Complete | Full configuration interface |
| Database Models | Complete | Prisma Miner model |

---

## Planned Features

### Hardware Types

#### ASIC Miners
| Miner | Algorithm | Hash Rate | Power | Price |
|-------|-----------|-----------|-------|-------|
| Bitmain Antminer S21 | SHA-256 | 200 TH/s | 3500W | $5,000 |
| Whatsminer M50S | SHA-256 | 126 TH/s | 3276W | $3,500 |
| Bitmain Antminer L7 | Scrypt | 9.5 GH/s | 3425W | $8,000 |

#### GPU Miners
| Card | Memory | Hash Rate (ETH) | Power | Price |
|------|--------|-----------------|-------|-------|
| NVIDIA RTX 4090 | 24GB | 130 MH/s | 450W | $1,600 |
| NVIDIA RTX 4080 | 16GB | 100 MH/s | 320W | $1,200 |
| AMD RX 7900 XTX | 24GB | 95 MH/s | 355W | $1,000 |

### Mining Strategies

1. **Excess Solar Only**
   - Mine only when solar > vehicle demand
   - Zero marginal energy cost
   - Environmentally friendly

2. **Time-of-Use Arbitrage**
   - Mine during super off-peak hours
   - Use cheap grid power
   - Higher output, some energy cost

3. **24/7 Mining**
   - Continuous operation
   - Maximum hash rate
   - Highest energy cost

---

## Planned Data Model

### Miner (Database)
```typescript
{
  id: string
  minerKey: string        // "antminer_s21"
  displayName: string
  manufacturer: string
  minerType: 'asic' | 'gpu'
  algorithm: string       // SHA-256, Scrypt, Ethash
  hashRate: number        // TH/s or MH/s
  hashRateUnit: string
  powerWatts: number
  price: number
  isDefault: boolean
}
```

### MiningConfig (State)
```typescript
{
  enabled: boolean
  miners: MinerSelection[]
  strategy: 'excessSolar' | 'touArbitrage' | 'continuous'
  targetCrypto: 'BTC' | 'LTC' | 'ETH' | 'custom'
  poolFeePercent: number
  walletAddress: string
}

interface MinerSelection {
  minerKey: string
  quantity: number
}
```

---

## Planned Calculations

### Daily Hash Output
```
totalHashRate = sum(miner.hashRate * miner.quantity)
```

### Daily Energy Consumption
```
dailyKwh = sum(miner.powerWatts * miner.quantity) / 1000 * hoursPerDay
```

### Mining Revenue (Daily)
```
// Simplified - actual uses network difficulty
dailyBTC = totalHashRate / networkDifficulty * blockReward
dailyRevenue = dailyBTC * btcPrice
```

### Net Mining Profit
```
netProfit = miningRevenue - energyCost - poolFees - hardwareDepreciation
```

---

## Planned API Integrations

### CoinGecko API
- Real-time crypto prices
- Historical price data
- Market cap and volume

### Blockchain.com API
- Network difficulty
- Block reward
- Transaction fees

### Mining Pool APIs
- Pool hash rate
- Payout history
- Worker status

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/mining/MiningTab.tsx` | Mining configuration UI |
| `src/calculations/miningProfitability.ts` | Profitability calculations |
| `src/types/mining.ts` | TypeScript definitions |
| `src/app/api/crypto/route.ts` | Crypto price proxy |
| `src/services/coingecko.ts` | CoinGecko API service |
| `prisma/schema.prisma` | Miner model added |
| `prisma/seed.ts` | Default miners seeded |

---

## Integration Points

| Module | Integration |
|--------|-------------|
| Solar | Excess energy feeds mining |
| Battery | Store for off-peak mining |
| Energy Economics | Mining energy costs |
| Financial Analysis | Mining revenue/costs |

---

## Implementation Steps

1. [x] Add Miner model to Prisma schema
2. [x] Create miner seed data
3. [x] Build mining types
4. [x] Implement CoinGecko service
5. [x] Create profitability calculations
6. [x] Build MiningTab UI component
7. [x] Add mining to ScenarioContext
8. [x] Integrate with financial analysis
9. [ ] Add mining charts (future)
10. [x] Test and validate calculations

---

## Risks and Considerations

- Crypto price volatility
- Network difficulty changes
- Regulatory concerns
- Hardware availability
- Heat management
- Noise considerations
- ROI uncertainty
