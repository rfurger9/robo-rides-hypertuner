"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/calculations";

interface TeslaVehicle {
  id: number;
  vehicle_id: number;
  vin: string;
  display_name: string;
  state: string;
}

interface TeslaChargeState {
  battery_level: number;
  battery_range: number;
  charge_limit_soc: number;
  charge_rate: number;
  charging_state: string;
  est_battery_range: number;
  ideal_battery_range: number;
  time_to_full_charge: number;
  usable_battery_level: number;
}

interface TeslaVehicleData {
  charge_state: TeslaChargeState;
  drive_state: {
    power: number;
    speed: number | null;
    latitude: number;
    longitude: number;
  };
  vehicle_state: {
    odometer: number;
    car_version: string;
  };
}

export function TeslaIntegration() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [vehicles, setVehicles] = useState<TeslaVehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<TeslaVehicle | null>(null);
  const [vehicleData, setVehicleData] = useState<TeslaVehicleData | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/tesla?action=status");
      const data = await res.json();
      setConnected(data.connected);
      if (data.connected) {
        fetchVehicles();
      }
    } catch (err) {
      console.error("Failed to check Tesla status:", err);
    }
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      setError("Please enter your Tesla access token");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tesla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "authenticate",
          accessToken: accessToken.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setConnected(true);
        setShowTokenInput(false);
        setAccessToken("");
        fetchVehicles();
      } else {
        setError(data.error || "Failed to connect");
      }
    } catch (err) {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/tesla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect" }),
      });
      setConnected(false);
      setVehicles([]);
      setSelectedVehicle(null);
      setVehicleData(null);
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/tesla?action=vehicles");
      const data = await res.json();
      if (data.response) {
        setVehicles(data.response);
        if (data.response.length > 0) {
          setSelectedVehicle(data.response[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    }
  };

  const fetchVehicleData = async (vehicleId: number) => {
    setLoading(true);
    try {
      // First wake up the vehicle
      await fetch("/api/tesla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "wake_up", vehicle_id: vehicleId }),
      });

      // Wait a moment for vehicle to wake
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Fetch vehicle data
      const res = await fetch(`/api/tesla?action=vehicle_data&vehicle_id=${vehicleId}`);
      const data = await res.json();
      if (data.response) {
        setVehicleData(data.response);
      }
    } catch (err) {
      console.error("Failed to fetch vehicle data:", err);
      setError("Failed to fetch vehicle data. Vehicle may be asleep.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Tesla Integration">
      <div className="space-y-4">
        {!connected ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connect your Tesla account to pull real vehicle data.
                </p>
              </div>
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
              >
                Connect Tesla
              </button>
            </div>

            {showTokenInput && (
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your Tesla API access token. You can get this from your Tesla account
                  or use a third-party tool like{" "}
                  <a
                    href="https://tesla-info.com/tesla-token.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Tesla Token Generator
                  </a>
                  .
                </p>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter Tesla Access Token"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
                  >
                    {loading ? "Connecting..." : "Connect"}
                  </button>
                  <button
                    onClick={() => setShowTokenInput(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-white text-sm font-medium rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Connected to Tesla
                </span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                Disconnect
              </button>
            </div>

            {vehicles.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select Vehicle
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedVehicle?.id || ""}
                    onChange={(e) => {
                      const v = vehicles.find((v) => v.id === Number(e.target.value));
                      setSelectedVehicle(v || null);
                      setVehicleData(null);
                    }}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.display_name} ({v.state})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => selectedVehicle && fetchVehicleData(selectedVehicle.id)}
                    disabled={loading || !selectedVehicle}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
                  >
                    {loading ? "Loading..." : "Refresh Data"}
                  </button>
                </div>
              </div>
            )}

            {vehicleData && (
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Live Vehicle Data
                </h4>

                {/* Battery Status */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-green-700 dark:text-green-400">Battery</span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      {vehicleData.charge_state.battery_level}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${vehicleData.charge_state.battery_level}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-green-600 dark:text-green-500 mt-1">
                    <span>{formatNumber(vehicleData.charge_state.battery_range, 0)} mi range</span>
                    <span>Limit: {vehicleData.charge_state.charge_limit_soc}%</span>
                  </div>
                </div>

                {/* Charging Status */}
                {vehicleData.charge_state.charging_state !== "Disconnected" && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700 dark:text-blue-400">
                        Charging: {vehicleData.charge_state.charging_state}
                      </span>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        {vehicleData.charge_state.charge_rate} mi/hr
                      </span>
                    </div>
                    {vehicleData.charge_state.time_to_full_charge > 0 && (
                      <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                        {formatNumber(vehicleData.charge_state.time_to_full_charge, 1)} hours to full
                      </p>
                    )}
                  </div>
                )}

                {/* Odometer */}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Odometer</span>
                  <span className="font-medium">
                    {formatNumber(vehicleData.vehicle_state.odometer, 0)} mi
                  </span>
                </div>

                {/* Software Version */}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Software</span>
                  <span className="font-medium text-xs">
                    {vehicleData.vehicle_state.car_version?.split(" ")[0] || "Unknown"}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
