import { NextRequest, NextResponse } from "next/server";
import { MONTHLY_SOLAR_FACTORS } from "@/types/solar";

const NREL_API_KEY = process.env.NREL_API_KEY;
const PVWATTS_URL = "https://developer.nrel.gov/api/pvwatts/v8.json";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng, systemCapacity, tilt = 20, azimuth = 180 } = body;

    if (!lat || !lng || !systemCapacity) {
      return NextResponse.json(
        { error: "Missing required parameters: lat, lng, systemCapacity" },
        { status: 400 }
      );
    }

    // If no API key, return mock data
    if (!NREL_API_KEY) {
      console.log("No NREL_API_KEY found, using mock data");
      return NextResponse.json(getMockResponse(systemCapacity, lat));
    }

    // Build the NREL PVWatts API request
    const params = new URLSearchParams({
      api_key: NREL_API_KEY,
      lat: lat.toString(),
      lon: lng.toString(),
      system_capacity: systemCapacity.toString(),
      azimuth: azimuth.toString(),
      tilt: tilt.toString(),
      array_type: "1", // Fixed - Roof Mounted
      module_type: "1", // Standard
      losses: "14", // 14% system losses
    });

    const response = await fetch(`${PVWATTS_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PVWatts API error:", response.status, errorText);
      // Fall back to mock data on API error
      return NextResponse.json({
        ...getMockResponse(systemCapacity, lat),
        source: "mock (API error)",
      });
    }

    const data = await response.json();

    // Validate response structure
    if (!data.outputs || !data.outputs.ac_monthly || !data.outputs.ac_annual) {
      console.error("Invalid PVWatts response structure:", data);
      return NextResponse.json({
        ...getMockResponse(systemCapacity, lat),
        source: "mock (invalid response)",
      });
    }

    return NextResponse.json({
      outputs: {
        ac_monthly: data.outputs.ac_monthly,
        ac_annual: data.outputs.ac_annual,
        solrad_monthly: data.outputs.solrad_monthly || [],
      },
      station_info: data.station_info || null,
      source: "nrel",
    });
  } catch (error) {
    console.error("PVWatts route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch solar data" },
      { status: 500 }
    );
  }
}

function getMockResponse(systemCapacityKw: number, lat: number) {
  // Adjust annual factor based on latitude (rough approximation)
  let annualFactor = 1500; // Default kWh per kW
  if (lat >= 32 && lat <= 36) {
    annualFactor = 1800; // Southwest
  } else if (lat >= 36 && lat <= 42) {
    annualFactor = 1600; // Mid-latitudes
  } else if (lat >= 42 && lat <= 48) {
    annualFactor = 1300; // Northern US
  } else if (lat < 32) {
    annualFactor = 1700; // Southern
  }

  const annualOutput = systemCapacityKw * annualFactor;
  const monthlyOutput = MONTHLY_SOLAR_FACTORS.map(
    (factor) => factor * annualOutput
  );

  return {
    outputs: {
      ac_monthly: monthlyOutput,
      ac_annual: annualOutput,
      solrad_monthly: MONTHLY_SOLAR_FACTORS.map((f) => f * 5.5), // Approximate solar radiation
    },
    station_info: {
      city: "Estimated",
      state: "US",
    },
    source: "mock",
  };
}
