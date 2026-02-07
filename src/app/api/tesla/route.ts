import { NextRequest, NextResponse } from "next/server";

// Tesla API endpoints
const TESLA_AUTH_URL = "https://auth.tesla.com/oauth2/v3";
const TESLA_API_URL = "https://owner-api.teslamotors.com/api/1";

// Store tokens in memory (in production, use a proper session/database)
let tokenCache: {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
} = {};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "status":
        return NextResponse.json({
          connected: !!tokenCache.accessToken && Date.now() < (tokenCache.expiresAt || 0),
          hasToken: !!tokenCache.accessToken,
        });

      case "vehicles":
        if (!tokenCache.accessToken) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        return await getVehicles();

      case "vehicle_data":
        if (!tokenCache.accessToken) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const vehicleId = searchParams.get("vehicle_id");
        if (!vehicleId) {
          return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
        }
        return await getVehicleData(vehicleId);

      case "charge_state":
        if (!tokenCache.accessToken) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const chargeVehicleId = searchParams.get("vehicle_id");
        if (!chargeVehicleId) {
          return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
        }
        return await getChargeState(chargeVehicleId);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Tesla API error:", error);
    return NextResponse.json(
      { error: "Tesla API request failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case "authenticate":
        // In a real implementation, this would handle OAuth flow
        // For now, accept access token directly (from user's Tesla account)
        const { accessToken, refreshToken } = body;
        if (!accessToken) {
          return NextResponse.json({ error: "Access token required" }, { status: 400 });
        }
        tokenCache = {
          accessToken,
          refreshToken,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
        };
        return NextResponse.json({ success: true, message: "Authenticated" });

      case "disconnect":
        tokenCache = {};
        return NextResponse.json({ success: true, message: "Disconnected" });

      case "wake_up":
        if (!tokenCache.accessToken) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }
        const wakeVehicleId = body.vehicle_id;
        if (!wakeVehicleId) {
          return NextResponse.json({ error: "Vehicle ID required" }, { status: 400 });
        }
        return await wakeUpVehicle(wakeVehicleId);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Tesla API error:", error);
    return NextResponse.json(
      { error: "Tesla API request failed" },
      { status: 500 }
    );
  }
}

async function getVehicles() {
  const response = await fetch(`${TESLA_API_URL}/vehicles`, {
    headers: {
      Authorization: `Bearer ${tokenCache.accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Tesla API error: ${response.status}`);
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function getVehicleData(vehicleId: string) {
  const response = await fetch(
    `${TESLA_API_URL}/vehicles/${vehicleId}/vehicle_data`,
    {
      headers: {
        Authorization: `Bearer ${tokenCache.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Tesla API error: ${response.status}`);
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function getChargeState(vehicleId: string) {
  const response = await fetch(
    `${TESLA_API_URL}/vehicles/${vehicleId}/data_request/charge_state`,
    {
      headers: {
        Authorization: `Bearer ${tokenCache.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Tesla API error: ${response.status}`);
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function wakeUpVehicle(vehicleId: string) {
  const response = await fetch(
    `${TESLA_API_URL}/vehicles/${vehicleId}/wake_up`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenCache.accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Tesla API error: ${response.status}`);
  }

  const data = await response.json();
  return NextResponse.json(data);
}
