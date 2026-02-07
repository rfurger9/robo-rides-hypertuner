import { Location } from "@/types/solar";

/**
 * Mock geocoding service
 * When Google Maps API key is added, this will use real geocoding
 */
export async function geocodeAddress(address: string): Promise<Location> {
  // Check if Google Maps API is available
  const hasGoogleMaps =
    typeof window !== "undefined" &&
    typeof google !== "undefined" &&
    google.maps &&
    google.maps.Geocoder;

  if (hasGoogleMaps) {
    return realGeocode(address);
  }

  // Mock geocoding based on common US cities
  return mockGeocode(address);
}

async function realGeocode(address: string): Promise<Location> {
  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address,
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

function mockGeocode(address: string): Location {
  const lowerAddress = address.toLowerCase();

  // Common US cities for mock data
  const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    "los angeles": { lat: 34.0522, lng: -118.2437 },
    "la": { lat: 34.0522, lng: -118.2437 },
    "san francisco": { lat: 37.7749, lng: -122.4194 },
    "sf": { lat: 37.7749, lng: -122.4194 },
    "san diego": { lat: 32.7157, lng: -117.1611 },
    "phoenix": { lat: 33.4484, lng: -112.074 },
    "las vegas": { lat: 36.1699, lng: -115.1398 },
    "denver": { lat: 39.7392, lng: -104.9903 },
    "austin": { lat: 30.2672, lng: -97.7431 },
    "houston": { lat: 29.7604, lng: -95.3698 },
    "dallas": { lat: 32.7767, lng: -96.797 },
    "miami": { lat: 25.7617, lng: -80.1918 },
    "atlanta": { lat: 33.749, lng: -84.388 },
    "chicago": { lat: 41.8781, lng: -87.6298 },
    "new york": { lat: 40.7128, lng: -74.006 },
    "nyc": { lat: 40.7128, lng: -74.006 },
    "seattle": { lat: 47.6062, lng: -122.3321 },
    "portland": { lat: 45.5152, lng: -122.6784 },
    "boston": { lat: 42.3601, lng: -71.0589 },
  };

  // Check if address contains a known city
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    if (lowerAddress.includes(city)) {
      return {
        ...coords,
        address: address,
      };
    }
  }

  // Default to Los Angeles if no match
  return {
    lat: 34.0522,
    lng: -118.2437,
    address: address || "Los Angeles, CA (default)",
  };
}

/**
 * Calculate distance between two coordinates (in miles)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
