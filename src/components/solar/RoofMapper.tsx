"use client";

import { useState, useCallback, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Slider } from "@/components/ui/Slider";
import { Location, RoofPolygon } from "@/types/solar";
import { geocodeAddress } from "@/services/geocoding";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
  width: "100%",
  height: "256px",
};

const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437,
};

interface RoofMapperProps {
  location: Location | null;
  polygons: RoofPolygon[];
  onLocationChange: (location: Location) => void;
  onPolygonsChange: (polygons: RoofPolygon[]) => void;
  onAreaChange: (totalAreaSqFt: number) => void;
}

export function RoofMapper({
  location,
  polygons,
  onLocationChange,
  onPolygonsChange,
  onAreaChange,
}: RoofMapperProps) {
  const [address, setAddress] = useState(location?.address || "");
  const [isLoading, setIsLoading] = useState(false);
  const [manualArea, setManualArea] = useState(
    polygons.reduce((sum, p) => sum + p.areaSqFt, 0) || 500
  );

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapCenter = useMemo(() => {
    if (location) {
      return { lat: location.lat, lng: location.lng };
    }
    return defaultCenter;
  }, [location]);

  const hasGoogleMaps = isLoaded && !loadError && GOOGLE_MAPS_API_KEY;

  const handleAddressSearch = useCallback(async () => {
    if (!address.trim()) return;

    setIsLoading(true);
    try {
      const newLocation = await geocodeAddress(address);
      onLocationChange(newLocation);
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, onLocationChange]);

  const handleManualAreaChange = useCallback(
    (area: number) => {
      setManualArea(area);
      onAreaChange(area);

      // Create a single default polygon with the manual area
      const defaultPolygon: RoofPolygon = {
        id: "manual-1",
        name: "Roof Area",
        coordinates: [],
        areaSqFt: area,
        tiltDegrees: 20,
        azimuthDegrees: 180,
      };
      onPolygonsChange([defaultPolygon]);
    },
    [onAreaChange, onPolygonsChange]
  );

  const handleTiltChange = useCallback(
    (tilt: number) => {
      if (polygons.length > 0) {
        const updated = polygons.map((p) => ({ ...p, tiltDegrees: tilt }));
        onPolygonsChange(updated);
      } else {
        onPolygonsChange([
          {
            id: "manual-1",
            name: "Roof Area",
            coordinates: [],
            areaSqFt: manualArea,
            tiltDegrees: tilt,
            azimuthDegrees: 180,
          },
        ]);
      }
    },
    [polygons, manualArea, onPolygonsChange]
  );

  const handleAzimuthChange = useCallback(
    (azimuth: number) => {
      if (polygons.length > 0) {
        const updated = polygons.map((p) => ({ ...p, azimuthDegrees: azimuth }));
        onPolygonsChange(updated);
      } else {
        onPolygonsChange([
          {
            id: "manual-1",
            name: "Roof Area",
            coordinates: [],
            areaSqFt: manualArea,
            tiltDegrees: 20,
            azimuthDegrees: azimuth,
          },
        ]);
      }
    },
    [polygons, manualArea, onPolygonsChange]
  );

  const currentTilt = polygons[0]?.tiltDegrees || 20;
  const currentAzimuth = polygons[0]?.azimuthDegrees || 180;

  return (
    <div className="space-y-4">
      {/* Address Search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Property Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter address (e.g., 123 Main St, Los Angeles, CA)"
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
          />
          <button
            onClick={handleAddressSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {isLoading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* Location Display */}
      {location && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <p className="text-sm text-green-700 dark:text-green-300">
            <strong>Location:</strong> {location.address}
          </p>
          <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        </div>
      )}

      {/* Map Placeholder or Real Map */}
      {hasGoogleMaps ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={location ? 18 : 10}
            mapTypeId="satellite"
            options={{
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {location && (
              <Marker
                position={{ lat: location.lat, lng: location.lng }}
              />
            )}
          </GoogleMap>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Satellite view - Use to estimate roof area
          </div>
        </div>
      ) : loadError ? (
        <div className="relative h-48 bg-red-50 dark:bg-red-900/20 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Error loading Google Maps
            </p>
            <p className="text-xs text-red-500 dark:text-red-500 mt-1">
              Please check your API key configuration
            </p>
          </div>
        </div>
      ) : !GOOGLE_MAPS_API_KEY ? (
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <svg
              className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Map Preview (Add Google Maps API key to enable)
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Use manual entry below to specify roof area
            </p>
          </div>
        </div>
      ) : (
        <div className="relative h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}

      {/* Manual Area Entry */}
      <Card title="Roof Configuration">
        <div className="space-y-4">
          <Slider
            label="Available Roof Area"
            value={manualArea}
            onChange={handleManualAreaChange}
            min={100}
            max={3000}
            step={50}
            unit=" sq ft"
          />

          <Slider
            label="Roof Tilt"
            value={currentTilt}
            onChange={handleTiltChange}
            min={0}
            max={45}
            step={5}
            unit="°"
          />

          <Slider
            label="Roof Azimuth (Direction)"
            value={currentAzimuth}
            onChange={handleAzimuthChange}
            min={90}
            max={270}
            step={15}
            formatValue={(v) => {
              if (v === 180) return "180° (South)";
              if (v < 180) return `${v}° (SE)`;
              return `${v}° (SW)`;
            }}
          />

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <strong>Tip:</strong> South-facing roofs (180°) with 20-30° tilt
              are optimal for solar production in the Northern Hemisphere.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
