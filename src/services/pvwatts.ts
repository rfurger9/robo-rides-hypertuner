import { PVWattsResponse, MONTHLY_SOLAR_FACTORS } from "@/types/solar";

export interface PVWattsRequest {
  lat: number;
  lng: number;
  systemCapacity: number;
  tilt?: number;
  azimuth?: number;
}

export async function getSolarOutput(
  request: PVWattsRequest
): Promise<PVWattsResponse & { source: string }> {
  const response = await fetch("/api/pvwatts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch solar output");
  }

  return response.json();
}

/**
 * Calculate monthly solar output locally (fallback for offline use)
 */
export function calculateLocalSolarOutput(
  systemSizeKw: number,
  annualFactor: number = 1500
): number[] {
  const annualOutput = systemSizeKw * annualFactor;
  return MONTHLY_SOLAR_FACTORS.map((factor) => factor * annualOutput);
}

/**
 * Get annual solar factor based on US state
 */
export function getStateSolarFactor(state: string): number {
  const stateFactors: Record<string, number> = {
    // Southwest
    AZ: 1850,
    NM: 1800,
    NV: 1800,
    // California
    CA: 1700,
    // Mountain West
    CO: 1650,
    UT: 1650,
    // Texas
    TX: 1550,
    // Southeast
    FL: 1500,
    GA: 1450,
    NC: 1400,
    SC: 1400,
    // Midwest
    IL: 1300,
    OH: 1250,
    MI: 1200,
    IN: 1300,
    MO: 1400,
    // Northeast
    NY: 1200,
    PA: 1250,
    MA: 1300,
    NJ: 1300,
    CT: 1250,
    // Northwest
    WA: 1100,
    OR: 1150,
    // Hawaii
    HI: 1800,
  };

  return stateFactors[state.toUpperCase()] || 1500;
}
