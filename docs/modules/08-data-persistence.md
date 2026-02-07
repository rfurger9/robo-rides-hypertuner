# Module 8: Data Persistence

> **Status:** Complete | **Progress:** 100%

## Overview

Manages data storage through SQLite database (via Prisma ORM) and browser localStorage for session state.

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| SQLite Database | Complete | Persistent storage via Prisma |
| Vehicle Storage | Complete | Pre-loaded and custom vehicles |
| Scenario Storage | Complete | Save/load configurations |
| LocalStorage | Complete | Auto-save session state |
| API Routes | Complete | RESTful endpoints |
| Database Seeding | Complete | Default data population |

---

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema definition |
| `prisma/seed.ts` | Default data seeding |
| `prisma/dev.db` | SQLite database file |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/storage.ts` | LocalStorage utilities |
| `src/app/api/vehicles/route.ts` | Vehicle API |
| `src/app/api/scenarios/route.ts` | Scenario API |

---

## Database Schema

### Vehicle Model
```prisma
model Vehicle {
  id                 String   @id @default(uuid())
  vehicleKey         String   @unique
  displayName        String
  manufacturer       String
  msrp               Float
  batteryKwh         Float
  efficiencyMiPerKwh Float
  rangeMiles         Int
  modelYear          Int
  isDefault          Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

### Scenario Model
```prisma
model Scenario {
  id          String   @id @default(uuid())
  name        String
  description String?
  config      String   // JSON stored as text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## API Endpoints

### Vehicles API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vehicles` | GET | List all vehicles |
| `/api/vehicles` | POST | Create vehicle |
| `/api/vehicles/[id]` | GET | Get vehicle by ID |
| `/api/vehicles/[id]` | PUT | Update vehicle |
| `/api/vehicles/[id]` | DELETE | Delete vehicle |

### Scenarios API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scenarios` | GET | List all scenarios |
| `/api/scenarios` | POST | Create scenario |
| `/api/scenarios/[id]` | GET | Get scenario by ID |
| `/api/scenarios/[id]` | PUT | Update scenario |
| `/api/scenarios/[id]` | DELETE | Delete scenario |

---

## LocalStorage

### Auto-Save Behavior
- Saves on every configuration change
- Debounced to prevent excessive writes
- Restores on page load

### Storage Keys
| Key | Data |
|-----|------|
| `robo-rides-config` | Current scenario configuration |
| `robo-rides-active-tab` | Last active tab |

### Storage Utilities
```typescript
// src/lib/storage.ts

export function saveConfig(config: ScenarioConfig): void
export function loadConfig(): ScenarioConfig | null
export function clearConfig(): void
```

---

## Seeded Data

### Default Vehicles
| Vehicle | Key | MSRP |
|---------|-----|------|
| Tesla Model 3 LR | `tesla_model3_lr` | $47,490 |
| Tesla Model Y LR | `tesla_model_y_lr` | $50,490 |
| Tesla Cybertruck | `tesla_cybertruck` | $79,990 |

### Seeding Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed default data
npm run db:seed
```

---

## Prisma Client

### Singleton Pattern
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

## Data Flow

```
┌──────────────────────────────────────────┐
│              User Interface              │
└────────────────┬─────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌─────────────┐       ┌─────────────┐
│ LocalStorage│       │  API Routes │
│  (Session)  │       │   (REST)    │
└─────────────┘       └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │   Prisma    │
                      │   Client    │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │   SQLite    │
                      │  (dev.db)   │
                      └─────────────┘
```

---

## Configuration

### Environment Variables
```env
# Database URL (SQLite)
DATABASE_URL="file:./dev.db"
```

### package.json Scripts
```json
{
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:seed": "npx tsx prisma/seed.ts"
}
```

---

## Future Enhancements

- [ ] PostgreSQL support for production
- [ ] User authentication and multi-tenancy
- [ ] Scenario versioning/history
- [ ] Export/import scenarios (JSON)
- [ ] Cloud sync (optional)
- [ ] Backup and restore
